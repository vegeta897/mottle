const { merge } = require('webpack-merge')
const ZipPlugin = require('zip-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default
const common = require('./webpack.common')
const { ESBuildMinifyPlugin } = require('esbuild-loader')

module.exports = merge(common, {
	mode: 'production',
	optimization: {
		minimizer: [
			new ESBuildMinifyPlugin({
				target: 'esnext',
				keepNames: true, // TODO: Turn this off for next bitECS version
			}),
		],
	},
	plugins: [
		new CleanWebpackPlugin(),
		new ImageminPlugin({
			optipng: {
				optimizationLevel: 7,
			},
		}),
		new ZipPlugin({
			filename: 'app.zip',
			exclude: [/\.js.map$/],
		}),
	],
})
