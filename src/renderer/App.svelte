<script lang="ts">
	import type { Data, Settings } from '../shared/api';
	import Main from './lib/Main.svelte';
	import SettingsModal from './lib/SettingsModal.svelte';

	let settingsPromise: Promise<Settings> = $state(window.api.getSettings());
	let showSettingsModal = $state(false);

	const dataPromise: Promise<Data> = $derived(
		settingsPromise.then((settings) => window.api.getData(settings))
	);

	window.api.onSettingsMenuClicked(() => {
		showSettingsModal = true;
	});
</script>

<div class="h-screen max-h-screen w-screen max-w-screen p-4">
	{#await settingsPromise then settings}
		<SettingsModal
			isOpen={showSettingsModal}
			{settings}
			onClose={() => (showSettingsModal = false)}
			onUpdateSettings={(newSettings) => (settingsPromise = Promise.resolve(newSettings))}
		/>
	{/await}

	{#await dataPromise then data}
		<Main {data} />
	{/await}
</div>
