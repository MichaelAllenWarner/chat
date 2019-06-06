const path = require('path');

// Bundle-specific Babel options:

// ES5 version uses React (w/ class props) & preset-env (w/ polyfills)
const es5BabelOptions = {
  plugins: ['@babel/plugin-proposal-class-properties'],
  presets: [
    '@babel/preset-react',
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3,
      debug: true,
      targets: {
        browsers: ['IE >= 10']
      }
    }]
  ]
};

// ES6+ version uses React w/ class props
const es6BabelOptions = {
  plugins: ['@babel/plugin-proposal-class-properties'],
  presets: ['@babel/preset-react']
};


module.exports = [
  {
    entry: './src/index.js',
    output: {
      filename: 'es5-main.js',
      path: path.resolve(__dirname, 'public/js')
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: es5BabelOptions
          }
        }
      ]
    }
  },
  {
    entry: './src/index.js',
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'public/js')
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: es6BabelOptions
          }
        }
      ]
    }
  }
];
