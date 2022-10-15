const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  plugins: [
      new HtmlWebpackPlugin({
        template: "index.html",
      }),
      new CopyWebpackPlugin({
          patterns: [
              { from: "assets"}
          ]
      })
  ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: "/"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
  devServer: {
    open: true,
      historyApiFallback: true,
      proxy: {
          '/api': {
              target: "http://localhost:3000",
              pathRewrite: {
                  '^/api': ''
              }
          },
      }
  }
}