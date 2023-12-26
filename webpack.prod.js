const path = require('path')


module.exports = {
    entry: {
     login: './src/pages/Login/index.js',
     register: './src/pages/Register/index.js',
     users: './src/pages/Users/index.js',
     orders:'./src/pages/Orders/index.js',
     dashboard: './src/pages/Dashboard/index.js',
     index: './src/index.js',
    },
    output: {
        filename: '[name].bundle.js',
        path:path.resolve(__dirname,'dist'),
    },
    optimization: {
        splitChunks: {
          chunks: 'all',
          minSize: 100,
          cacheGroups: {
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunk:'all'
            },
          },
        },
      },
    mode:"production"
}