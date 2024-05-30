const path = require('path');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { babel } = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser').default;
const json = require('@rollup/plugin-json');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const externalGlobals  = require('rollup-plugin-external-globals');

const options = {
    input: 'dist/web.js',
    output: {
        file: 'dist/web.bundled.js',
        format: 'iife'
    },
    external: ['react', 'react-dom', 'prismjs', 'react-markdown'],
    plugins: [
        externalGlobals({
            'react': 'React',
            'react-dom': 'ReactDOM',
            'prismjs': 'Prism',
            'react-markdown': 'ReactMarkdown'
        }),
        json(),
        commonjs(),
        nodePolyfills(),
        nodeResolve({
            browser: true,
            preferBuiltins: false
        }),
        babel({
            presets: ['@babel/preset-react', '@babel/preset-env', {
                exclude: "transform-typeof-symbol"
            }],
            babelHelpers: 'runtime',
            plugins: [
                ["@babel/plugin-transform-runtime", {
                    regenerator: true
                }]
            ]
        }),
        terser()
    ]
};

export default options;