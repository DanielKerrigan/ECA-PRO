import path from 'path';
import { extendRendererConfig } from './vite.base.config.ts';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vite.dev/config/
export default extendRendererConfig({
	// base: './',
	// build: {
	// 	outDir: 'dist/renderer',
	// 	emptyOutDir: true
	// },
	plugins: [svelte()],
	resolve: {
		alias: {
			$lib: path.resolve('./src/renderer/lib')
		}
	}
});
