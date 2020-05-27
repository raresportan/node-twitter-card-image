const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/draw.js',
    output: {
        path: path.resolve(__dirname, `./browser/`),
        filename: `twittercard.js`,
        libraryTarget: 'umd',
        globalObject: 'this',
        library: 'twittercard'
    },
    devtool: 'source-maps',
    plugins: [
        new webpack.NamedModulesPlugin()
    ]
};
