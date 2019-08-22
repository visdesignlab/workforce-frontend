const express = require('express');
const app = express();
const port = 8000;

app.use(express.static(__dirname+"/dist"));
app.use('/data/', express.static('./data'));

const server = app.listen(port, function () {
	let host = server.address().address;

	console.info('Workforce frontend server is listening at http://%s:%s', host, port);
});
