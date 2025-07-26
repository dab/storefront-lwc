import lwc from '@lwc/rollup-plugin';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const isProduction = process.env.NODE_ENV === 'production';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/app.js',
        format: 'iife',
        globals: {
            'my/app': 'MyApp'
        }
    },
    plugins: [
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            preventAssignment: true
        }),
        resolve({
            browser: true
        }),
        lwc(),
        !isProduction && serve({
            contentBase: 'dist',
            port: 3001,
            open: false
        }),
        !isProduction && livereload('dist')
    ],
    watch: {
        clearScreen: false
    }
};