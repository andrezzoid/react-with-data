const path = require('path')
const webpack = require('webpack')

const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'

module.exports = {
  // Don't attempt to continue if there are any errors.
  bail: true,

  // We generate sourcemaps in production. This is slow but gives good results.
  // You can exclude the *.map files from the build during deployment.
  devtool: 'source-map',

  entry: './src/index.js',

  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    }
  },

  output: {
    // The build folder.
    path: path.resolve(__dirname, 'lib'),
    // Generated JS file name.
    filename: 'index.js',
    // Library name
    library: 'withData',
    libraryTarget: 'umd'
  },

  module: {
    rules: [
      // First, run the linter.
      // It's important to do this before Babel processes the JS.
      {
        test: /\.(js|jsx)$/,
        // checks source files not modified by other loaders
        enforce: 'pre',
        loader: 'eslint-loader',
        include: path.resolve(__dirname, 'src')
      },

      // Process JS with Babel.
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'src')
      }
    ]
  },

  plugins: [
    // Minify the code.
    new UglifyJsPlugin({
      compress: {
        warnings: false,
        // Disabled because of an issue with Uglify breaking seemingly valid code:
        // https://github.com/facebookincubator/create-react-app/issues/2376
        // Pending further investigation:
        // https://github.com/mishoo/UglifyJS2/issues/2011
        comparisons: false
      },
      output: {
        comments: false,
        // Turned on because emoji and regex is not minified properly using default
        // https://github.com/facebookincubator/create-react-app/issues/2488
        ascii_only: true
      },
      sourceMap: true
    })
  ]
}
