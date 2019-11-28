const http = require('http');
const axios = require('axios')
const mappings = JSON.parse(process.env.MAPPINGS)
const { execSyncFx} = require('./execSyncFx.js');


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
    const repoFullName = hookInfo.repository.full_name;
    const branchRef = hookInfo.ref;
    const branchName = hookInfo.branchName
    console.log({repoFullName,branchRef})
    console.log(mappings.length)
    const nodeInfo = mappings.filter(r => r.repoFullName===repoFullName)[0];
    const svnTargetBranch = branchName=='master' ? 'trunk' : branchName
    const svnTargetURL =  nodeInfo.svnRepoBaseURL + svnTargetBranch
    execSyncFx(hookInfo.gitUrl,hookInfo.branchName,svnTargetURL)
    const targetJenkinsJob = nodeInfo.jenkins.filter(r => r.branchRef===branchRef)[0];
    console.log("posting: ",targetJenkinsJob.jenkinsURL)
    await axios.post(targetJenkinsJob.jenkinsURL);
    response.end();
  });
}).listen(80);