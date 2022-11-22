import request from 'request';
import path from 'path';
import fs from 'fs';
import jsonfile from 'jsonfile';

export module QueueManager {
  export async function flush() {
    try {
      fs.readdir('./storage/datasets/default', function (
        err: any,
        files: string[]
      ) {
        if (err) {
          console.log(err)
          return
        }
        files.forEach(function (file) {
          if(file.includes("lock")){
            return;
          }
          console.log('reading: ' + file)
          var filePath = path.join('./storage/datasets/default/' + file);
          var jsonBody = jsonfile.readFileSync(filePath);
          try{
            if(SendRequest(jsonBody)){
              fs.unlinkSync(filePath);
            }
          }
          catch{
            console.log("unable to connect to api server")
          }
        });
      });
    } catch (exception) {
      console.log(exception);
    }
  }
}


function SendRequest(jsonBody: String):boolean {
  try{
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
      return true;
    }
    else{
      return false;
    }
  }
  catch(exception){
    console.log(exception);
    return false;
  }
}
