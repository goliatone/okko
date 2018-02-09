import svelte from 'rollup-plugin-svelte';
import { babel, uglify } from 'rollup-plugin-bundleutils';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';

let dev = process.env.NODE_ENV === 'development';

//use reshape for HTML rendering https://reshape.ml/
export default {
		input: './modules/server/app/main.js',
		output: {
				file: './modules/server/public/js/main.js',
				format: 'iife'
		},
		plugins: [
				svelte({
						// By default, all .html and .svelte files are compiled
						extensions: ['.html'],

						// You can restrict which files are compiled
						// using `include` and `exclude`
						include: './modules/server/app/components/**.html'
				}),
				nodeResolve({
						jsnext: true,
						main: true,
						browser: true
				}),
				commonjs(),
				babel({
					  exclude: 'node_modules/**',
						include: ['./modules/server/app/**/*.js']
				}),
				replace({
						'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
						'process.env.APP_BASE_PATH': JSON.stringify(process.env.APP_BASE_PATH || ''),
				}),
				dev ? uglify() : {},
				dev
						? serve({
									contentBase: ['./modules/server/app'],
									open: true
							})
						: {},
				dev ? livereload() : {}
		]
};
