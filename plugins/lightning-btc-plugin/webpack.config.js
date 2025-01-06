// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname),
    libraryTarget: 'commonjs2',
  },
  target: 'node', // Since we're running in Node.js
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  externals: {
    express: 'commonjs express',
    sequelize: 'commonjs sequelize',
  },
};
