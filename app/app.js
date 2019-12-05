const http = require('http');
const axios = require('axios')
const mappings = JSON.parse(process.env.MAPPINGS)
const { execSync} = require('./execSync');


http.createServer((request, response) => {
  const { headers, method, url } = request;
  let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', async () => {
    body = Buffer.concat(body).toString();

    const hookInfo = JSON.parse(body)

    console.log("hookInfo.repository.full_name: ",hookInfo.repository.full_name)
    const mappingQuery =  mappings.filter(r => r.gitRepoFullName===hookInfo.repository.full_name)
    if (mappingQuery.length==0){
      response.end();
      return
    }

    const mappingNodeInfo = mappingQuery[0];
    await execGit2SVNSync(mappingNodeInfo, hookInfo);

    const targetJenkinsJobQuery = mappingNodeInfo.jenkins.filter(r => r.branchRef===hookInfo.ref)
    if (mappingQuery.length==0){
      response.end();
      return
    }
    const targetJenkinsJob = targetJenkinsJobQuery[0];
    console.log("posting: ",targetJenkinsJob.jenkinsURL)
    await axios.post(targetJenkinsJob.jenkinsURL);
    response.end();
  });
}).listen(80);

async function execGit2SVNSync(mappingNodeInfo, hookInfo) {
  const gitBranchName = hookInfo.ref.replace('refs/heads/','')
  const svnTargetPath = process.env.SVN_BASEURL + mappingNodeInfo.svnPath;
  let svnTargetURL = '';
  if (gitBranchName === 'master') {
    svnTargetURL = svnTargetPath + 'trunk';
  }
  else {
    svnTargetURL = svnTargetPath + 'branches/' + gitBranchName;
  }
  const gitUrl = process.env.GIT_SERVER + hookInfo.repository.full_name + '.git';
  console.log("svnTargetURL: ",svnTargetURL)
  console.log("gitUrl: ",gitUrl)
  console.log("gitBranchName: ",gitBranchName)
  await execSync(gitUrl, gitBranchName, svnTargetURL);
}
