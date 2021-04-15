const path = require('path');
const webpack = require('webpack');

module.exports = env => {
  return {
    node: { global: true, fs: 'empty' },
    entry: ["./src/main.ts"],
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
    devServer: {
      contentBase: './dist',
      hot: true,
    },
    mode: 'development',

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [ ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
      rules: [
          // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
          { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
          // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
          { test: /\.js$/, loader: "source-map-loader" }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.API_ROOT': JSON.stringify(env.API_ROOT)
      })
    ]
  }
};
