const webpack = require('webpack'); //为了使用webpack的热更新
const {
    merge
} = require('webpack-merge');
const commonConf = require('./webpack.common.js');
const path = require('path');
const vConsolePlugin = require('vconsole-webpack-plugin');

module.exports = (env, argv) => {

    let moduleName = argv.m;

    return merge(commonConf(env, argv), {
        mode: 'development',
        devtool: 'cheap-module-eval-source-map', // 不单独的生成map文件，报错行显示
        // devtool: 'source-map', // 生成单独的map文件，报错行报错，编译会慢一些
        output: {
            filename: '[name].js', //文件名指的入口对应的出口文件
            chunkFilename: 'js/[id].js',
            path: path.resolve('.', `dev/${moduleName}/`),
            publicPath: `/dev/${moduleName}/` // 要配合devServer的openPage来使用这个带不带斜杠真的很重要
        },

        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new vConsolePlugin({
                // filter: [],  // 需要过滤的入口文件
                enable: true // 发布代码前记得改回 false
            })
        ],

        devServer: {
            host: '0.0.0.0',
            useLocalIp: true, // 扫码就可以访问
            port: 9002,
            open: true,
            openPage: `dev/${moduleName}/`,
            publicPath: `/dev/${moduleName}/`,
            hot: true,
            inline: true,
            compress: true,
            // proxy: {
            //     // "/api": 'http://localhost:3000',
            //     "/api": {
            //         target: 'http://localhost:3000',
            //         pathRewrite: {
            //             "^/api": ""
            //         }
            //     }
            // }
        }
    })
}