const http = require('http');

http.createServer((req, res) => {
  res.end("Deployed to Kubernetes using Jenkins!");
}).listen(3000);
