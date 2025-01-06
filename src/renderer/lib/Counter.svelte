<script lang="ts">
	let count: number = $state(0);
	const increment = () => {
		count += 1;
	};
</script>

<button class="rounded-full bg-yellow-500" onclick={increment}>
	Count is {count}
</button>
