const path = require('path')

module.exports = {
    entry: {
     login: './src/pages/Login/index.js',
     register: './src/pages/Register/index.js',
     index: './src/index.js'
    },
    output: {
        filename: '[name].bundle.js',
        path:path.resolve(__dirname,'dist'),
    },
    mode:'development',
}