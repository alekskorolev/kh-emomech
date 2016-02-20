var path = require('path'),
    fs = require('fs'),
    webpack = require('webpack');

fs.exists(path.join(__dirname, '/../local.config.js'), function(exist) {
    if (!exist) {
        fs.closeSync(fs.openSync(path.join(__dirname, '/../local.config.js'), 'w+'));
    }
});
module.exports = {
    context: path.join(__dirname + '/..'),
    entry: {
        'index': 'js/index.js'
    },
    output: {
        path: path.join(__dirname, '../build/js'),
        filename: '[name].js'
    },
    module: {
        loaders: [
            {test: /\.html$/, loader: 'ehogan'},
            {test: /\.js$/, loader: 'babel'},
            {test: /\.scss$/, loaders: ["style", "css?sourceMap", "sass?sourceMap"]}
        ]
    },
    resolve: {
        root: [
            path.join(__dirname, '/../source'),
            path.join(__dirname, '/../../')
        ]
    },
    devtool: 'source-map',
    debug: true,
    plugins: [
        new webpack.optimize.DedupePlugin()
    ]
}