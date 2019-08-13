/* eslint-disable
  import/order,
  multiline-ternary,
  no-param-reassign,
*/
import del from 'del';
import path from 'path';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';

const module = (config) => {
  return {
    rules: config.rules
      ? config.rules
      : [
          {
            test: (config.loader && config.loader.test) || /\.s[ac]ss$/i,
            resolve: config.loader.resolve,
            use: [
              {
                loader: require.resolve('./testLoader'),
              },
              {
                loader: path.join(__dirname, '../../src'),
                options: (config.loader && config.loader.options) || {},
              },
            ],
          },
        ],
  };
};

const plugins = (config) => [].concat(config.plugins || []);

const output = (config) => {
  return {
    path: path.resolve(
      __dirname,
      `../outputs/${config.output ? config.output : ''}`
    ),
    filename: '[name].bundle.js',
  };
};

export default function(fixture, config = {}, options = {}) {
  // webpack Config
  config = {
    mode: config.mode || 'development',
    devtool: config.devtool || false,
    // context: path.resolve(__dirname, '..', 'fixtures'),
    context: path.resolve(__dirname, '..'),
    entry: config.entry || `./${fixture}`,
    output: output(config),
    module: module(config),
    plugins: plugins(config),
    optimization: {
      runtimeChunk: false,
    },
    // eslint-disable-next-line no-undefined
    resolve: config.resolve || undefined,
  };
  // Compiler Options
  options = Object.assign({ output: false }, options);

  if (options.output) {
    del.sync(config.output.path);
  }

  const compiler = webpack(config);

  if (!options.output) {
    compiler.outputFileSystem = new MemoryFS();
  }

  return new Promise((resolve, reject) =>
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }

      return resolve(stats);
    })
  );
}
