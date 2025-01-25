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

	let newSettings = $state($state.snapshot(settings));

	function onClickSelectDirectory() {
		window.api.selectDirectory().then((value) => (newSettings.directory = value));
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

		<div class="flex min-w-0 items-center gap-2">
			<div class="flex-none py-2">Data folder:</div>
			<div class="min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-2">
				{newSettings.directory}
			</div>
			<Button variant="secondary" class="ml-auto flex-none py-2" onclick={onClickSelectDirectory}
				>Select</Button
			>
		</div>

		<Dialog.Footer>
			<Button type="submit" onclick={onClickSave}>Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
