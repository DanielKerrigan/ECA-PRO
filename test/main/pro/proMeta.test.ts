import { getProItemSchema } from '../../../src/main/pro/proMeta.js';

import { expect, test } from 'vitest';

test('getProItemSchema', () => {
	const Schema = getProItemSchema();

	expect(
		Schema.safeParse({
			ItemID: '1',
			Item: 'A',
			ConstructName: 'B',
			ResponseItemType: 'C',
			ResponseItemValues: 'D | E | F | Prefer not to say',
			BankName: 'G',
			CategoryName: 'H'
		}).data
	).toStrictEqual({
		key: 'B_C',
		itemId: 1,
		item: 'A',
		constructName: 'B',
		responseItemType: 'C',
		bankName: 'G',
		categoryName: 'H',
		textToValue: new Map([
			['D', 0],
			['E', 1],
			['F', 2],
			['Prefer not to say', -100]
		]),
		valueToNormalizedValue: new Map([
			[0, 0],
			[1, 0.5],
			[2, 1],
			[-100, -100]
		])
	});

	expect(
		Schema.safeParse({
			ItemID: '1',
			Item: 'A',
			ConstructName: 'B',
			ResponseItemType: 'C',
			ResponseItemValues: 'D | E | F | Not applicable | Prefer not to say',
			BankName: 'G',
			CategoryName: 'H'
		}).data
	).toStrictEqual({
		key: 'B_C',
		itemId: 1,
		item: 'A',
		constructName: 'B',
		responseItemType: 'C',
		bankName: 'G',
		categoryName: 'H',
		textToValue: new Map([
			['D', 0],
			['E', 1],
			['F', 2],
			['Not applicable', -101],
			['Prefer not to say', -100]
		]),
		valueToNormalizedValue: new Map([
			[0, 0],
			[1, 0.5],
			[2, 1],
			[-101, -101],
			[-100, -100]
		])
	});

	expect(
		Schema.safeParse({
			ItemID: '1',
			Item: 'A',
			ConstructName: 'B',
			ResponseItemType: 'C',
			ResponseItemValues: 'D | E | F | Not sexually active | Prefer not to say',
			BankName: 'G',
			CategoryName: 'H'
		}).data
	).toStrictEqual({
		key: 'B_C',
		itemId: 1,
		item: 'A',
		constructName: 'B',
		responseItemType: 'C',
		bankName: 'G',
		categoryName: 'H',
		textToValue: new Map([
			['D', 0],
			['E', 1],
			['F', 2],
			['Not sexually active', -102],
			['Prefer not to say', -100]
		]),
		valueToNormalizedValue: new Map([
			[0, 0],
			[1, 0.5],
			[2, 1],
			[-102, -102],
			[-100, -100]
		])
	});

	expect(
		Schema.safeParse({
			ItemID: '',
			Item: 'A',
			ConstructName: 'B',
			ResponseItemType: 'C',
			ResponseItemValues: 'D | E | F | Prefer not to say',
			BankName: 'G',
			CategoryName: 'H'
		}).error?.message
	).toContain('ItemID');

	expect(
		Schema.safeParse({
			ItemID: '1',
			Item: '',
			ConstructName: 'B',
			ResponseItemType: 'C',
			ResponseItemValues: 'D | E | F | Prefer not to say',
			BankName: 'G',
			CategoryName: 'H'
		}).error?.message
	).toContain('Item');

	expect(
		Schema.safeParse({
			ItemID: '1',
			Item: 'A',
			ConstructName: '',
			ResponseItemType: 'C',
			ResponseItemValues: 'D | E | F | Prefer not to say',
			BankName: 'G',
			CategoryName: 'H'
		}).error?.message
	).toContain('ConstructName');

	expect(
		Schema.safeParse({
			ItemID: '1',
			Item: 'A',
			ConstructName: 'B',
			ResponseItemType: '',
			ResponseItemValues: 'D | E | F | Prefer not to say',
			BankName: 'G',
			CategoryName: 'H'
		}).error?.message
	).toContain('ResponseItemType');

	expect(
		Schema.safeParse({
			ItemID: '1',
			Item: 'A',
			ConstructName: 'B',
			ResponseItemType: 'C',
			ResponseItemValues: '',
			BankName: 'G',
			CategoryName: 'H'
		}).error?.message
	).toContain('ResponseItemValues');

	expect(
		Schema.safeParse({
			ItemID: '1',
			Item: 'A',
			ConstructName: 'B',
			ResponseItemType: 'C',
			ResponseItemValues: 'D | E',
			BankName: 'G',
			CategoryName: 'H'
		}).error?.message
	).toContain('ResponseItemValues');

	expect(
		Schema.safeParse({
			ItemID: '1',
			Item: 'A',
			ConstructName: 'B',
			ResponseItemType: 'C',
			ResponseItemValues: 'D | E | Prefer not to say | F',
			BankName: 'G',
			CategoryName: 'H'
		}).error?.message
	).toContain('ResponseItemValues');

	expect(
		Schema.safeParse({
			ItemID: '1',
			Item: 'A',
			ConstructName: 'B',
			ResponseItemType: 'C',
			ResponseItemValues: 'D | E | Not sexually active | F | Prefer not to say',
			BankName: 'G',
			CategoryName: 'H'
		}).error?.message
	).toContain('ResponseItemValues');

	expect(
		Schema.safeParse({
			ItemID: '1',
			Item: 'A',
			ConstructName: 'B',
			ResponseItemType: 'C',
			ResponseItemValues: 'D | E | Not applicable | F | Prefer not to say',
			BankName: 'G',
			CategoryName: 'H'
		}).error?.message
	).toContain('ResponseItemValues');

	expect(
		Schema.safeParse({
			ItemID: '1',
			Item: 'A',
			ConstructName: 'B',
			ResponseItemType: 'C',
			ResponseItemValues: 'D | E | F | Prefer not to say',
			BankName: '',
			CategoryName: 'H'
		}).error?.message
	).toContain('BankName');

	expect(
		Schema.safeParse({
			ItemID: '1',
			Item: 'A',
			ConstructName: 'B',
			ResponseItemType: 'C',
			ResponseItemValues: 'D | E | F | Prefer not to say',
			BankName: 'G',
			CategoryName: ''
		}).error?.message
	).toContain('CategoryName');
});
