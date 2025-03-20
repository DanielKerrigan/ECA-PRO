<script lang="ts">
	import type { Settings } from '../../shared/api';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	let {
		isOpen,
		settings,
		onClose,
		onUpdateSettings
	}: {
		isOpen: boolean;
		settings: Settings;
		onClose: () => void;
		onUpdateSettings: (newSettings: Settings) => void;
	} = $props();

	let newSettings: Settings = $state($state.snapshot(settings));

	// TODO: is there a way to do this without $effect?
	$effect(() => {
		newSettings = $state.snapshot(settings);
	});

	function onSelectPROMetaFile() {
		window.api.selectFilePaths(false).then((paths) => (newSettings.proMetaPath = paths[0]));
	}

	function onSelectPRODataFile() {
		window.api.selectFilePaths(false).then((paths) => (newSettings.proDataPath = paths[0]));
	}

	function onSelectTreatmentFiles() {
		window.api.selectFilePaths(true).then((paths) => (newSettings.treatmentPaths = paths));
	}

	function onClickSave() {
		window.api.updateSettings($state.snapshot(newSettings)).then((value) => {
			onUpdateSettings(value);
		});
	}
</script>

<Dialog.Root
	open={isOpen}
	onOpenChange={(open) => {
		if (!open) {
			onClose();
		}
	}}
>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Settings</Dialog.Title>
		</Dialog.Header>

		<div class="flex min-w-0 max-w-full flex-col gap-4">
			<div class="flex flex-col gap-2">
				<div class="font-semibold">PRO Data</div>
				<div class="overflow-x-auto whitespace-nowrap">
					{newSettings.proDataPath || 'No file selected'}
				</div>
				<Button variant="secondary" class="self-start py-2" onclick={onSelectPRODataFile}
					>Select File</Button
				>
			</div>

			<div class="flex flex-col gap-2">
				<div class="font-semibold">PRO Meta</div>
				<div class="overflow-x-auto whitespace-nowrap">
					{newSettings.proMetaPath || 'No file selected'}
				</div>
				<Button variant="secondary" class="self-start py-2" onclick={onSelectPROMetaFile}
					>Select File</Button
				>
			</div>

			<div class="flex flex-col gap-2">
				<div class="font-semibold">Treatment</div>
				<div>
					{#if newSettings.treatmentPaths.length > 0}
						{#each newSettings.treatmentPaths as path}
							<div class="overflow-x-auto whitespace-nowrap">{path}</div>
						{/each}
					{:else}
						<div>No files selected</div>
					{/if}
				</div>
				<Button variant="secondary" class="self-start py-2" onclick={onSelectTreatmentFiles}>
					Select Files
				</Button>
			</div>
		</div>

		<Dialog.Footer>
			<Button type="submit" onclick={onClickSave}>Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
