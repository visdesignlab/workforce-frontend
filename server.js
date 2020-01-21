const express = require('express');
const app = express();
const port = 8000;


const webpack = require('webpack');
const config = require('./webpack.config.js');
const compiler = webpack(config);

app.use(require("webpack-dev-middleware")(compiler, {
    noInfo: true, publicPath: config.output.publicPath
}));

app.use(require("webpack-hot-middleware")(compiler));


app.use(express.static(__dirname+"/dist"));
app.use('/data/', express.static('./data'));



const server = app.listen(port, function () {
	let host = server.address().address;

	console.info('Workforce frontend server is listening at http://%s:%s', host, port);
});
