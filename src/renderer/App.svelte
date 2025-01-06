<script lang="ts">
	import type { ElectronAPI } from '../shared/api';
	import Counter from './lib/Counter.svelte';

	const electronApi: ElectronAPI = window.api;

	const nodeVersion = electronApi.versions.node();
	const chromeVersion = electronApi.versions.chrome();
	const electronVersion = electronApi.versions.electron();
</script>

<main>
	<div>Node: {nodeVersion}</div>
	<div>Chrome: {chromeVersion}</div>
	<div>Electron: {electronVersion}</div>
	<div>
		<Counter />
	</div>
</main>

<style>
</style>
