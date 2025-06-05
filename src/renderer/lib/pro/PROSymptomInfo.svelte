<script lang="ts">
	import type { MergedPROItem } from '../../../shared/api';
	import PROLegend from './PROLegend.svelte';

	let { item }: { item: MergedPROItem } = $props();
</script>

<div>
	<PROLegend {item} />
</div>
