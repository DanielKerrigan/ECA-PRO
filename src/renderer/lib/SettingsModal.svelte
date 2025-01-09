<!---
References:
https://www.w3schools.com/howto/howto_css_modals.asp
-->
<script lang="ts">
	import type { Settings } from '../../shared/api';

	let {
		settings,
		onClose,
		onUpdateSettings
	}: {
		settings: Settings;
		onClose: () => void;
		onUpdateSettings: (newSettings: Settings) => void;
	} = $props();

	let newSettings = $state($state.snapshot(settings));

	function onkeydown(ev: KeyboardEvent) {
		if (ev.key === 'Escape') {
			onClose();
		}
	}

	function onClickSelectDirectory() {
		window.api.selectDirectory().then((value) => (newSettings.directory = value));
	}

	function onClickSave() {
		window.api.updateSettings($state.snapshot(newSettings)).then((value) => {
			onUpdateSettings(value);
		});
	}
</script>

<svelte:window {onkeydown} />

<div class="fixed left-0 top-0 flex h-screen w-screen items-center justify-center bg-black/75">
	<div class="flex max-h-[90%] min-w-96 max-w-[90%] flex-col gap-4 rounded bg-white p-4">
		<div class="flex flex-none items-center">
			<div class="text-xl">Settings</div>
			<button
				class="ml-auto hover:text-blue-600 active:text-blue-700"
				aria-label="Close"
				onclick={onClose}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
		<div class="flex flex-1 flex-col gap-2">
			<div class="flex items-center gap-2">
				<div class="flex-none">Data folder:</div>
				<div class="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">
					{newSettings.directory}
				</div>
				<button
					class="ml-auto flex-none rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700 active:bg-blue-800"
					onclick={onClickSelectDirectory}>Select</button
				>
			</div>
		</div>
		<button
			class="flex-none self-start rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700 active:bg-blue-800"
			onclick={onClickSave}>Save</button
		>
	</div>
</div>
