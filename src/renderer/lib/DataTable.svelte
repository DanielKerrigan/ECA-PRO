<script lang="ts">
	import type { PROResponse, PROItem, PROMeta, PROData } from '../../shared/api';

	let {
		proMeta,
		proData
	}: {
		proMeta: PROMeta;
		proData: PROData;
	} = $props();
</script>

<svelte:window {onkeydown} />

<div class="flex h-full w-full flex-col">
	<div>
		{proMeta}
	</div>
	<div>
		{proData}
	</div>
</div>
