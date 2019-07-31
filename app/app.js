const http = require('http');
const axios = require('axios')
const mappings = JSON.parse(process.env.MAPPINGS)


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
    console.log({repoFullName,branchRef})
    const target = mappings.filter(r => r.repoFullName===repoFullName && r.branchRef===branchRef)[0];
    console.log("posting: ",target)
    await axios.post(target.jenkinsURL);
    response.end();
  });
}).listen(80);