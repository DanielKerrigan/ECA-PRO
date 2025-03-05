<script lang="ts">
	import type { PROItem } from '../../../shared/api';
	import PROLegend from './PROLegend.svelte';

	let { item }: { item: PROItem } = $props();
</script>

<div>
	<PROLegend {item} />
</div>
