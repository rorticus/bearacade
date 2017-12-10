const merge = require('webpack-merge');
const webpack = require('webpack');
const base = require('./webpack.config.js');

module.exports = merge(base, {
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
});