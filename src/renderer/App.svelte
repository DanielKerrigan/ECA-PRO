<script lang="ts">
	import type { Data, Settings } from '../shared/api';
	import Main from './lib/Main.svelte';
	import SettingsModal from './lib/SettingsModal.svelte';

	let settingsPromise: Promise<Settings> = $state(window.api.getSettings());
	let showSettingsModal = $state(false);

	const dataPromise: Promise<Data> = $derived(
		settingsPromise.then((v) => window.api.getData(v.directory))
	);

	window.api.onSettingsMenuClicked(() => {
		showSettingsModal = true;
	});
</script>

<div class="flex h-full w-full flex-col p-4">
	{#await settingsPromise then settings}
		<SettingsModal
			isOpen={showSettingsModal}
			{settings}
			onClose={() => (showSettingsModal = false)}
			onUpdateSettings={(newSettings) => (settingsPromise = Promise.resolve(newSettings))}
		/>
	{:catch error}
		<div>{error.message}</div>
	{/await}

	{#await dataPromise then data}
		<Main proMeta={data.proMeta} proUsersResponses={data.proUsersResponses} />
	{:catch error}
		<div>{error.message}</div>
	{/await}
</div>
