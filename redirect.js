const http = require("http");
const host = "localhost";
const port = 9002;

const requestListener = function(req, res) {
  res.writeHead(302, { Location: "new-expensify://settings" });
  res.end();
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
