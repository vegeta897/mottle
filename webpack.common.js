const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const { ProgressPlugin } = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
	entry: ['./src/index.ts'],
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].bundle.js',
		sourceMapFilename: '[file].map',
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.(png|svg|jpg|jpeg|gif|obj)$/i,
				type: 'asset/resource',
			},
			{
				test: /\.(css)$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.js$/,
				use: ['source-map-loader'],
				enforce: 'pre',
			},
			{
				test: /\.tsx?$/,
				loader: 'esbuild-loader',
				options: {
					loader: 'ts',
					target: 'es2015',
				},
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},
	optimization: {
		splitChunks: {
			chunks: 'all',
		},
	},
	plugins: [
		new ProgressPlugin(),
		new CopyPlugin({ patterns: [{ from: 'src/assets' }] }),
		new HtmlWebPackPlugin({
			title: 'Mottle',
		}),
	],
}
