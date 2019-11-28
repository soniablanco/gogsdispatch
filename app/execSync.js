'use strict';
var spawn = require('child_process').spawn;

const execSyncFx = (gitUrl,gitBranch,targetSVNUrl) => {   
    var process = spawn('/syncToSVN.sh'
    , [
          gitUrl
        , gitBranch
        , targetSVNUrl
    ]);
    var result = '';
    process.stdout.on('data', (data) => {
        result += data.toString();
    });
    var errorResult = '';
    process.stderr.on('data', (data) => {
      errorResult += data.toString();
    });
    process.on('exit', function (code, signal) {
      if (code) {
        console.log('ffmpeg videoFileStream error');
        console.log(JSON.stringify({code,signal,result,errorResult}))
        
      } else if (signal) {
        console.log('ffmpeg videoFileStream error');
        console.log(JSON.stringify({code,signal,result,errorResult}))
      } else {

      }        
    });    
    
};


exports.execSync = execSyncFx