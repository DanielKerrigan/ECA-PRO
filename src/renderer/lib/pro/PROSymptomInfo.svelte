<script lang="ts">
	import type { MergedProItem } from '../../../shared/api';
	import ProLegend from './ProLegend.svelte';

	let { item }: { item: MergedProItem } = $props();
</script>

<div>
	<ProLegend {item} />
</div>
