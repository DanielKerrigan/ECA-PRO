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

	let newSettings: Settings = $derived($state.snapshot(settings));

	function onSelectFile(onfulfilled: (path: string) => void) {
		window.api.selectFilePath().then(onfulfilled);
	}

	const pathInputs: { label: string; key: keyof Settings }[] = [
		{ label: 'PRO Meta', key: 'proMetaPath' },
		{ label: 'PRO Data', key: 'proDataPath' },
		{ label: 'Radiation Treatment', key: 'radiationPath' },
		{ label: 'Systemic Therapy Treatment', key: 'systemicTherapyPath' },
		{ label: 'Surgery', key: 'surgeryPath' },
		{ label: 'Oral Treatment', key: 'oralPath' }
	];

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
	<Dialog.Content class="max-h-screen grid-rows-[auto_minmax(0,1fr)_auto]">
		<Dialog.Header class="px-1">
			<Dialog.Title>Settings</Dialog.Title>
		</Dialog.Header>

		<div class="flex min-h-0 max-w-full min-w-0 flex-col gap-4 overflow-y-auto p-1">
			{#each pathInputs as { label, key }}
				<div class="flex flex-col gap-2">
					<div class="font-semibold">{label}</div>
					<div class="overflow-x-auto whitespace-nowrap">
						{newSettings[key] || 'No file selected'}
					</div>
					<Button
						variant="secondary"
						class="self-start py-2"
						onclick={() => onSelectFile((path) => (newSettings[key] = path))}>Select File</Button
					>
				</div>
			{/each}
		</div>

		<Dialog.Footer>
			<Button type="submit" onclick={onClickSave}>Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
