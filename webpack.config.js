const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// 设置环境变量
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

module.exports = {
  mode: NODE_ENV,
  entry: {
    popup: path.join(__dirname, 'src', 'popup', 'index.ts'),
    background: path.join(__dirname, 'src', 'background', 'index.ts'),
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js',
    clean: true,
    publicPath: './'
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'vue': '@vue/runtime-dom',
      'vue-i18n': path.resolve(__dirname, 'node_modules/vue-i18n/dist/vue-i18n.runtime.esm-bundler.js'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@stores': path.resolve(__dirname, 'src/stores'),
      '@locales': path.resolve(__dirname, 'src/locales')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            isCustomElement: tag => tag.startsWith('chrome-'),
            whitespace: 'condense',
            comments: false,
            hoistStatic: true,
            prefixIdentifiers: true,
            optimize: true
          },
          hotReload: false,
          runtimeCompiler: false,
          productionMode: true,
          sourceMap: !isProd
        }
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { modules: false }],
                '@babel/preset-typescript'
              ],
              plugins: [
                '@babel/plugin-transform-runtime',
                '@vue/babel-plugin-jsx'
              ]
            }
          },
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              transpileOnly: true,
              compilerOptions: {
                module: 'esnext',
                target: 'es2015',
                isolatedModules: true,
                noEmitOnError: true
              }
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]'
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      __VUE_I18N_FULL_INSTALL__: false,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV)
      }
    }),
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'popup', 'index.html'),
      filename: 'popup.html',
      chunks: ['popup'],
      inject: true,
      minify: isProd ? {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      } : false
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/assets',
          to: 'assets'
        },
        {
          from: 'manifest.json',
          to: 'manifest.json',
          transform(content) {
            return Buffer.from(JSON.stringify({
              ...JSON.parse(content.toString()),
              version: process.env.npm_package_version
            }))
          }
        }
      ]
    })
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    },
    runtimeChunk: false,
    minimize: isProd,
    moduleIds: 'deterministic'
  },
  devtool: isProd ? false : 'source-map',
  performance: {
    hints: false
  }
};
