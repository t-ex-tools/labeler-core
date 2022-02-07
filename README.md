# T.EX Labeler Core

Core of the labeling component of T.EX, which provides a generic interface to other components. The core implements a data model to easily extend it by additional blocklists. 

# Usage
```
import BlockList from './labeler-core/BlockList.js';
import EasyListParser from './labeler-core/EasyListParser.js';
import EasyListEvaluator from './labeler-core/EasyListEvaluator.js';

let list = await fetch('https://easylist.to/easylist/easyprivacy.txt');
let evaluator = EasyListEvaluator(EasyListParser);
let labeler = new BlockList('EasyPrivacy', list, evaluator);

const request = {
  url: 'https://www.tccd.edu/images/.../2021-summer-update.jpg',
  source: 'https://www.tccd.edu/',
  type: 'image'
};

let result = labeler.isLabeled([r]);
// result: { isLabeled: false, rule: null, type: null } 
```

# Model: Parser and Evaluator

![Model the labeler implements](/figures/model.png)

**Figure 1**

To extend the core by additional blocklists, which shall be used in an automated labeling process, adapt the model depicted in *Figure 1*. 

# Example Request

Requests to be labeled by the labeler must be serialized in JSON and each request must define the following properties: ```url```, ```source```, and ```type```. See an example of a complete request recorded by T.EX.

```
{
  "frameId": 0,
  "initiator": "https://www.tccd.edu",
  "method": "GET",
  "parentFrameId": -1,
  "requestId": "923027",
  "tabId": 19696,
  "timeStamp": 1628773542862.1062,
  "type": "image",
  "url": "https://www.tccd.edu/images/.../2021-summer-update.jpg",
  "source": "https://www.tccd.edu/",
  "complete": true,
  "requestHeaders": [
    {
      "name": "User-Agent",
      "value": "Mozilla/5.0 ... Chrome/92.0.4515.131 Safari/537.36"
    },
    ...
  ],
  "response": {
    "frameId": 0,
    "fromCache": false,
    "initiator": "https://www.tccd.edu",
    "ip": "64.28.255.100",
    "method": "GET",
    "parentFrameId": -1,
    "requestId": "923027",
    "responseHeaders": [
      {
        "name": "Content-Type",
        "value": "image/jpeg"
      },
      ...
    ],
    "statusCode": 200,
    "statusLine": "HTTP/1.1 200 OK",
    "tabId": 19696,
    "timeStamp": 1628773543179.2751,
    "type": "image",
    "url": "https://www.tccd.edu/images/.../2021-summer-update.jpg"
  },
  "success": true
}
```
