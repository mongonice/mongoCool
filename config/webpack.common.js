const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');

// 定义全局变量
const handleGlobal = (oGlobal) => {

    // 最终生成definePlugin想要的样子
    let finalGlobals = {};

    for (let key in oGlobal) {
        finalGlobals[key] = JSON.stringify(oGlobal[key])
    }
    return finalGlobals
}


module.exports = (env, argv) => {
    // 必须得处理一下env, 因为你拿到的env值是 'development' 而非 development，多了两个引号
    const _env = env.replace(/\'/g, ''),
        moduleName = argv.m;

    const {
        dev,
        prod
    } = require(`../src/${moduleName}/config.js`)


    const modeConf = {
        'development': {
            defineGlobal: dev,
            cssFilename: 'css/[name].css', //http://localhost:9002/dev/actDouble11/css/0.css
            cssChunkFilename: 'css/[id].css',
            imgName: 'images/[name].[ext]' // 如果这里添加了images，那么outputPath就不用配置了
        },
        'production': {
            defineGlobal: prod,
            cssFilename: 'css/[name].[contenthash:8].css',
            cssChunkFilename: 'css/[id].[contenthash:8].css',
            imgName: 'images/[name].[contenthash:8].[ext]'
        }
    }

    const finalGlobals = handleGlobal(modeConf[_env].defineGlobal)

    return {
        entry: [
            // path.resolve('.', `src/${moduleName}/main.js`),
            path.resolve(__dirname, `../src/${moduleName}/main.js`)
        ],

        resolve: {
            extensions: ['.vue', '.js', '.json'],
            modules: [path.resolve(__dirname, '..', 'node_modules')] // 坑strip-ansi
        },
        module: {
            noParse: /jquery|lodash|flexible/, //可以定义哪些模块不需要解析
            rules: [{ //配置babel-loader将es6转成es5
                    test: /\.js$/,
                    // 如果写了 include，是不是只包含，就不用写exclude了？
                    include: path.resolve('.', `src/${moduleName}/`),
                    use: [{
                            // 开启多线程进行编译构建
                            loader: 'thread-loader',
                            options: {
                                workers: 3
                            }
                        },
                        {
                            loader: 'babel-loader',
                            options: {
                                "presets": [
                                    [
                                        '@babel/preset-env',
                                        {
                                            "modules": false, // tree-Shaking
                                            targets: {
                                                "node": "current",
                                                "chrome": 52,
                                                "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
                                            },
                                            // useBuiltIns: 'usage',// 试验阶段，慎用
                                            useBuiltIns: 'entry' // 试验阶段，慎用
                                        }
                                    ]
                                ],
                                plugins: [
                                    "@babel/transform-runtime"
                                ]
                            }
                        }
                    ]
                },
                { // 处理样式的加载器们
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        // 'style-loader',
                        _env == 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
                        // MiniCssExtractPlugin.loader, // link标签
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 2,
                                sourceMap: true
                            }
                        },
                        // 如果postcss配置不好 报错：path must be a string 
                        {
                            // 自动添加前缀
                            loader: 'postcss-loader',
                            options: {
                                plugins: () => [
                                    // require括号中的autoprefixer必须加双引号
                                    require('autoprefixer')({
                                        "overrideBrowserslist": [
                                            "defaults",
                                            "not ie <= 8",
                                            "last 2 versions",
                                            "> 1%",
                                            "iOS >= 7",
                                            "Android >= 4.0"
                                        ]
                                    })
                                ]
                                // plugins: () => [
                                //     //autoprefixer不能加双引号
                                //     autoprefixer({
                                //         "overrideBrowserslist": ['iOS >= 7', 'Android >= 4.1']
                                //     })
                                // ]
                                // plugins: [
                                //     require('autoprefixer')({
                                //         //必须设置支持的浏览器才会自动添加浏览器兼容
                                //         //注意：
                                //         //使用browsers属性也是可以编译生效，但编译中会提示下图中警告，可能会发生错误
                                //         //所以还是推荐使用overrideBrowserslist这个属性
                                //         overrideBrowserslist: [
                                //             "defaults",
                                //             "not ie <= 8",
                                //             "last 2 versions",
                                //             "> 1%",
                                //             "iOS >= 7",
                                //             "Android >= 4.0"
                                //         ]
                                //     })
                                // ]
                            }
                        },
                        {
                            loader: 'px2rem-loader',
                            options: {
                                remUnit: 108
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                // 能够知道当前的scss样式来自哪个文件
                                sourceMap: _env == 'development'
                            }
                        }
                    ]
                },
                { // 处理资源的加载器
                    test: /\.(png|jpe?g|gif|webp)$/,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            esModule: false, // file-loader新版本默认使用了esModule语法， <img src="[object Module]">,那么设置为false
                            name: modeConf[_env].imgName,
                            // outputPath: `images/`, // 如果name已经配置了images层级目录， 那么不用配置此选项了   /dev/actDouble11/images/1b155de3bbb8b6d2953d42166766518d.png
                            // 组成部分：output中的publicPath 拼接 options.outputPath 再拼上images
                        }
                    }]

                },
                {
                    test: /\.(svg|woff|ttf|eot|mp3|mp4)$/,
                    loader: 'file-loader'
                },
                {
                    test: /\.vue$/,
                    use: 'vue-loader'
                }
            ]
        },
        plugins: [
            new VueLoaderPlugin(),
            new webpack.DefinePlugin(finalGlobals),
            new webpack.ProvidePlugin({
                "coreBus": [path.resolve('.', 'src/__common/js/eventBus.js'), 'default'],
                "Vue": ['vue/dist/vue.runtime.esm.js', 'default'] //重点
            }),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, `../src/${moduleName}/index.html`),
                // minify配置在production环境下默认是开启的，所以无需在此配置
                // minify: _env == 'production' && {
                //     removeAttributeQuotes: true,
                //     collapseWhitespace: true
                // }
            }),

            ...(_env == 'production' ? new MiniCssExtractPlugin({
                filename: modeConf[_env].cssFilename, // 设置输出的文件名
                chunkFilename: modeConf[_env].cssChunkFilename
            }) : [])
            // new MiniCssExtractPlugin({
            //     filename: modeConf[_env].cssFilename, // 设置输出的文件名
            //     chunkFilename: modeConf[_env].cssChunkFilename
            // })
        ]
    }
}