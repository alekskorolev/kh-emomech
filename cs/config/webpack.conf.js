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
            {test: /\.scss$/, loaders: ["style", "raw?sourceMap", "sass?sourceMap"]},
/*            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'url-loader?limit=100000'
                ]
            }*/
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