const { merge } = require('webpack-merge')
const ZipPlugin = require('zip-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default
const TerserPlugin = require('terser-webpack-plugin')
const common = require('./webpack.common')

module.exports = merge(common, {
	mode: 'production',
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					keep_fnames: /^Query/,
				},
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
