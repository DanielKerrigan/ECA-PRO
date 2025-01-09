import type { InternMap } from 'd3';

export type Settings = {
	directory: string;
};

export type PROItem = {
	itemID: number;
	item: string;
	constructName: string;
	responseItemType: string;
	responseItemStrings: string[];
	responseItemValues: number[];
	bankName: string;
	categoryName: string;
};

export type PROMeta = InternMap<string, d3.InternMap<string, PROItem[]>>;

export type PROResponse = {
	userID: string;
	dateTime: Date;
	itemID: number;
	responseValue: number;
	responseText: string;
};

export type PROData = InternMap<number, PROResponse[]>;

export type Data = {
	proMeta: PROMeta;
	proData: PROData;
};

export type ElectronAPI = {
	getSettings: () => Promise<Settings>;
	updateSettings: (newSettings: Settings) => Promise<Settings>;
	selectDirectory: () => Promise<string>;
	onSettingsMenuClicked: (callback: () => void) => void;
	getData: (path: string) => Promise<Data>;
};
