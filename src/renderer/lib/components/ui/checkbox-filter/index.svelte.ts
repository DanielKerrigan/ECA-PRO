export class ChildCheck {
	name = $state('');
	checked = $state(true);
	show = $state(true);
	keys: string[] = $state([]);

	constructor(name: string, keys: string[]) {
		this.name = name;
		this.keys = keys;
	}
}

export class ParentCheck {
	name: string = $state('');
	show: boolean = $state(true);
	children: ChildCheck[] = $state([]);
	#checked: boolean = $derived(this.children.some((d) => d.checked));
	indeterminate: boolean = $derived(
		this.children.some((d, _, arr) => d.checked !== arr[0].checked)
	);

	constructor(name: string, children: ChildCheck[]) {
		this.name = name;
		this.children = children;
	}

	set checked(value: boolean) {
		this.children.forEach((child) => {
			child.checked = value;
		});
	}

	get checked(): boolean {
		return this.#checked;
	}

	updateShow(search: string) {
		this.children.forEach((child) => {
			child.show = child.name.toLowerCase().includes(search);
		});
		this.show =
			this.name.toLowerCase().includes(search) || this.children.some((child) => child.show);
	}
}

export type CheckboxFilterData = {
	name: string;
	children: {
		name: string;
		keys: string[];
	}[];
}[];

export class ParentChecks {
	parents: ParentCheck[] = $state([]);

	constructor(data: CheckboxFilterData) {
		this.parents = data.map((parent) => {
			const children = parent.children.map((child) => new ChildCheck(child.name, child.keys));
			return new ParentCheck(parent.name, children);
		});
	}

	getCheckedKeys(): string[] {
		return this.parents
			.map((parent) => parent.children.filter((child) => child.checked).map((child) => child.keys))
			.flat(2);
	}

	updateShow(search: string) {
		this.parents.forEach((parent) => {
			parent.updateShow(search);
		});
	}

	setAll(checked: boolean) {
		this.parents.forEach((parent) => {
			parent.checked = checked;
		});
	}
}
