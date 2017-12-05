const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool: 'inline-source-map',
    entry: './src/main.ts',
    output: {
        path: path.resolve('./output'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {test: /\.ts$/, loader: 'ts-loader'},
            {test: /\.jpg$/, loader: 'file-loader'}
        ]
    },
    plugins: [
        new HtmlWebpackPlugin()
    ]
};