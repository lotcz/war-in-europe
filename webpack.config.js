const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: {
		index: './src/index.js'
	},
	devtool: 'inline-source-map',
	devServer: {
		contentBase: './dist',
		port: 8082
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
		}),

		new CopyWebpackPlugin({
			patterns: [
				{ from: 'assets/favicon.ico', to: '' },
			]
		})

	],
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.(jpg|png|svg|woff|woff2|ttf)$/,
				use: {
					loader: 'url-loader',
				},
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				]
			},
		]
	}
};
