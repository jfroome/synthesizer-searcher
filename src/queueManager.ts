import request from 'request';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import jsonfile from 'jsonfile';
import { Listing } from './models/listing';

export module QueueManager {
  export async function flush() {
    try {
      console.log("Uploading data...")
      fs.readdir('./storage/datasets/default', function (
        err: any,
        files: string[]
      ) {
        if (err) {
          console.log(err)
          return
        }
        files.forEach(async function (file) {
          if (file.includes("lock")) {
            return;
          }
          //console.log('reading: ' + file)
          var filePath = path.join('./storage/datasets/default/' + file);
          var jsonBody = jsonfile.readFileSync(filePath);
          try {
            if (await uploadListing(jsonBody)) {
              fs.unlinkSync(filePath);
            }
          }
          catch {
            console.warn("unable to connect to api server")
          }
        });
      });
    } catch (exception) {
      console.log(exception);
    }
  }
  export async function getExistingLinks(): Promise<string[]> {
    return getLinks();
  }
}


async function uploadListing(jsonBody: String): Promise<boolean> {
  try {
    if (jsonBody != null) {
      await request.post(
        {
          url: 'http://localhost:3000/api/post',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonBody,
          json: true
        }, (error) => {
          if (error) {
            console.log(error)
            return false;
          } else {
            return true;
          }
        }
      );
    }
  }
  catch (exception) {
    console.log(exception);
  }
  return false;
}

async function getLinks(): Promise<any[]> {
  const links: any[] = [];
  try {
    const response = await fetch('http://localhost:3000/api/getLinks');
    const data = await response.json()
    //@ts-ignore

    data.links.map((url) => {
      //@ts-ignore
      var hostname = new URL(url).hostname;
      switch (hostname) {
        case "www.spacemanmusic.com":
          links.push({
            url: url,
            label: 'SM_DETAILS'
          });
          break;
        case "moogaudio.com":
          links.push({
            url: url,
            label: 'MOOG_DETAILS'
          });
          break;
        case "cicadasound.ca":
          links.push({
            url: url,
            label: 'CICADA_DETAILS'
          });
          break;
        case "www.kijiji.ca":
          return;
        default: return;
      }
    });
  } catch (exception) {
    console.log(exception);
  }
  console.log(links);
  return links;
}

