import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import LocalizationPlugin from 'localization-webpack-plugin';

const isRelease = process.env.NODE_ENV === 'production';

export default {
  entry: [
    'babel-regenerator-runtime',
    'react-hot-loader/patch',
    path.resolve('source/entry.js'),
  ],

  output: {
    path: path.resolve('dist'),
    filename: !isRelease ? 'bundle.js' : 'bundle.[chunkhash:5].js',
    chunkFilename: !isRelease ? '[name].chunk.js' : '[name].[chunkhash:5].chunk.js',
  },

  watch: !isRelease,

  devServer: {
    hot: true,
    contentBase: path.join(__dirname, '../dist'),
    port: 9000,
    open: true,
  },

  module: {
    rules: [{
      test: /\.js$/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: !isRelease,
            babelrc: false,
            compact: false,
            presets: [
              ['env', {
                targets: {
                  browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 11',
                  ],
                  forceAllTransforms: isRelease,
                },
                modules: false,
                useBuiltIns: false,
                debug: false,
              }],
              'stage-2',
              'react',
              'react-optimize',
            ],
          },
        },
      ],
    }, {
      test: /locales\/[a-z]{2}\.json$/,
      loader: LocalizationPlugin.replaceJSONByRandomNumber(),
    }],
  },

  plugins: [
    new LocalizationPlugin({
      filename: !isRelease ? '[chunkname].[lang].json' : '[chunkname].[lang].[hash].json', // Avaible: [chunkname], [hash], [lang]
      locales: ['en', 'ru'],
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': !isRelease ? '"development"' : '"production"',
      'process.env.BROWSER': true,
      __DEV__: !isRelease,
    }),
    new HtmlWebpackPlugin({
      template: 'source/index.ejs',
    }),
    ...(isRelease ? [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          unused: true,
          dead_code: true,
          screw_ie8: true,
        },
        mangle: {
          screw_ie8: true,
        },
        output: {
          comments: false,
          screw_ie8: true,
        },
        sourceMap: false,
      }),
    ] : [
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
    ]),
  ],
};
