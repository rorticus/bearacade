const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
	entry: "./src/index.ts",
	plugins: [
        new webpack.EnvironmentPlugin({
            "HOST": "",
            "DB": "",
            "WEBSOCKET_PROTOCOL": "wss",
            "NODE_ENV": "production"
        }),
		new HtmlWebpackPlugin({
			inject: true,
			template: require("html-webpack-template"),
			title: "Bearacade",
			appMountId: "app",
			appMountHtmlSnippet: "<div>App goes here</div>",
			lang: "en-US",
			headHtmlSnippet: `
<style type="text/css">
html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.main {
}

#app {
    width: 100%;
    height: 100%;
    background-color: #222222;
}

#game {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    cursor: none;
}
</style>
<meta name="viewport" content="width=320,initial-scale=1" />
            `
		})
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/
			},
			{
				test: /\.(png|svg|jpg|gif|mp3)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							esModule: false
						}
					}
				],
			},
			{
				test: /\.(fnt)/,
				use: [
					{
						loader: "raw-loader",
						options: {
							esModule: false
						}
					}
				]
			}
		]
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"]
	},
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "build")
	}
};
