const path = require('path');
const webpack = require('webpack');


module.exports = {
  entry: ["./src/Main.ts", 'webpack-hot-middleware/client'],
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
          { test: /\.js$/, loader: "source-map-loader" },
          {
            test: /\.(scss)$/,
            use: [
              {
                // Adds CSS to the DOM by injecting a `<style>` tag
                loader: 'style-loader'
              },
              {
                // Interprets `@import` and `url()` like `import/require()` and will resolve them
                loader: 'css-loader'
              },
              {
                // Loader for webpack to process CSS with PostCSS
                loader: 'postcss-loader',
                options: {
                  plugins: function () {

                    return [
                      require('autoprefixer')
                    ];
                  }
                }
              },
              {
                // Loads a SASS/SCSS file and compiles it to CSS
                loader: 'sass-loader'
              }
            ]
          }
      ]


        },
        plugins: [
          new webpack.optimize.OccurrenceOrderPlugin(),
          new webpack.HotModuleReplacementPlugin(),
          // Use NoErrorsPlugin for webpack 1.x
          new webpack.NoEmitOnErrorsPlugin()
        ],
  // Other options...
};
