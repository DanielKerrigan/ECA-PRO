<script lang="ts">
	import type { Data, Settings } from '../shared/api';
	import DataTable from './lib/DataTable.svelte';
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

<div class="flex h-full w-full flex-col">
	{#if showSettingsModal}
		{#await settingsPromise then settings}
			<SettingsModal
				{settings}
				onClose={() => (showSettingsModal = false)}
				onUpdateSettings={(newSettings) => (settingsPromise = Promise.resolve(newSettings))}
			/>
		{/await}
	{/if}

	{#await dataPromise then data}
		<DataTable proMeta={data.proMeta} proData={data.proData} />
	{/await}
</div>
