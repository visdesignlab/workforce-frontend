const path = require('path');

module.exports = {
	mode: 'development',
  entry:{'bundle.js': [
    path.resolve(__dirname, 'src/index.js')

  ]},
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'dist')
  }
};
