const http = require("http");
const { parse, escape } = require('querystring');

const host = "localhost";
const port = 9002;

function collectRequestData(request, callback) {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';

    if(request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}

const requestListener = function(req, res) {
  if(req.method === 'POST') {
    var token;
    collectRequestData(req, result => {
        console.log(result);
      token = result.id_token;
      // can't test with real token, dot breaks URL parsing in app
  res.writeHead(302, { Location: `https://exptest.ngrok.io/siwa/exampletoken` });
  // res.writeHead(302, { Location: "" });
  res.end();
    });
}
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
