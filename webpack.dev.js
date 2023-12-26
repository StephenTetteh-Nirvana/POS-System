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
    
    devServer:{
        static:{
            directory:path.resolve(__dirname,'dist'),
            watch:true
        },
        port:8080,
        hot:true,
        open:true
    },


    mode:"development"
}