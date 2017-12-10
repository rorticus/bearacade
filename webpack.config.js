const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'inline-source-map',
    entry: './client/src/main.ts',
    output: {
        path: path.resolve('./client-dist'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {test: /\.ts$/, loader: 'ts-loader'},
            {test: /\.(jpg|png)$/, loader: 'file-loader'},
            {test: /\.(mp3|wav)$/, loader: 'arraybuffer-loader'},
            {
                test: /\.css$/, use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Bearacade',
            template: 'client/src/index.html'
        }),
        new ExtractTextPlugin('styles.css')
    ]
};