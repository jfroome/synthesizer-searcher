import request from 'request';
import path from 'path';
import fs from 'fs';
import jsonfile from 'jsonfile';

export module QueueManager{
  export async function flush () {
    
    fs.readdir('./storage/datasets/default', function (
      err: any,
      files: string[]
    ) {
      if (err) {
        console.log(err)
        return
      }
      files.forEach(function (file) {
        console.log('reading: ' + file)
        var filePath = path.join('./storage/datasets/default/' + file);
        var jsonBody = jsonfile.readFileSync(filePath);
        SendRequest(jsonBody);
        fs.unlinkSync(filePath);
      });
    });
  }
}


function SendRequest (jsonBody: String) {
  if (jsonBody != null) {
    request.post(
      {
        url: 'http://localhost:3000/api/post',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonBody,
        json: true
      }
    )
  }
}
