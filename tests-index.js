const req = require.context('./test', true, /\.spec.js$/);
req.keys().forEach(req);

console.log("test")
require('vscode-mocha-hmr')(module);
