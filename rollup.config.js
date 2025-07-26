import lwc from '@lwc/rollup-plugin';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import copy from 'rollup-plugin-copy';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/app.js',
    format: 'iife',
    globals: {
      'my/app': 'MyApp',
    },
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      preventAssignment: true,
    }),
    resolve({
      browser: true,
    }),
    lwc(),
    copy({
      targets: [
        // Copy only the CSS file we need
        {
          src: 'node_modules/@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css',
          dest: 'dist/assets/styles',
        },
        // Copy only the icon sprite files we use
        {
          src: 'node_modules/@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg',
          dest: 'dist/assets/icons/utility-sprite/svg',
        },
        // Copy our custom assets (bikes.json and any custom files)
        {
          src: 'src/assets/**/*',
          dest: 'dist/assets',
        },
        // Copy the HTML file
        {
          src: 'src/index.html',
          dest: 'dist',
        },
      ],
    }),
    !isProduction &&
      serve({
        contentBase: 'dist',
        port: 3001,
        open: false,
      }),
    !isProduction && livereload('dist'),
  ],
  watch: {
    clearScreen: false,
  },
};
