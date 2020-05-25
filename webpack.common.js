var HtmlWebpackPlugin = require("html-webpack-plugin");
var CopyPlugin = require("copy-webpack-plugin");
var webpack = require("webpack");

module.exports = {
  stats: "errors-only",
  entry: {
    main: "./src/index.js"
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html"
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/assets/images/*', 
          to: "../dist/assets/images/",
          toType: 'dir',
          flatten: true
        }
      ],
    })
  ],
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ["html-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "assets/[folder]/[name].[hash].[ext]"
          }
        }
      },
      {
        test: /\.(ogg|mp3)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "assets/[folder]/[name].[ext]"
          }
        }
      }
    ]
  }
}