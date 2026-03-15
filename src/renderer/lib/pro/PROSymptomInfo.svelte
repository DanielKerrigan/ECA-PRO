<script lang="ts">
	import type { MergedProItem } from '../../../shared/api';
	import PROLegend from './PROLegend.svelte';

	let { item }: { item: MergedProItem } = $props();
</script>

<div>
	<PROLegend {item} />
</div>
