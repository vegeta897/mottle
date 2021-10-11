const { merge } = require('webpack-merge')
const ZipPlugin = require('zip-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default
const common = require('./webpack.common')
const { ESBuildMinifyPlugin } = require('esbuild-loader')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = merge(common, {
	mode: 'production',
	optimization: {
		minimizer: [
			new ESBuildMinifyPlugin({
				target: 'esnext',
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
		new BundleAnalyzerPlugin({
			analyzerMode: 'static',
			reportFilename: '../bundle-report.html',
		}),
		new ZipPlugin({
			filename: 'app.zip',
			exclude: [/\.js.map$/],
		}),
	],
})
