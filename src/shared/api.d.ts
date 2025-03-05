import type { InternMap } from 'd3';

export type Settings = {
	directory: string;
};

// Meta

export type PROItem = {
	index: number;
	itemID: number;
	item: string;
	constructName: string;
	responseItemType: string;
	responseItemStrings: string[];
	responseItemValues: number[];
	bankName: string;
	categoryName: string;
};

export type PROMetaByID = InternMap<number, PROItem>;

// Responses

export type PROResponse = {
	userID: number;
	dateTime: Date;
	itemID: number;
	responseValue: number;
	normalizedResponseValue: number;
	responseText: string;
};

export type PROUsersResponses = InternMap<number, PROItemToResponses>;
export type PROItemToResponses = InternMap<number, PROResponse[]>;

// Constructs

export type PROConstructOrderKey = 'category' | 'severity';

export type PROUserConstructOrders = {
	category: {
		order: string[];
	};
	severity: {
		startDate: Date;
		endDate: Date;
		order: string[];
	};
};

export type PROUsersConstructOrders = InternMap<number, PROUserConstructOrders>;

export type Data = {
	proMetaByID: PROMetaByID;
	proUsersResponses: PROUsersResponses;
	proUsersConstructOrders: PROUsersConstructOrders;
};

// preload API

export type ElectronAPI = {
	getSettings: () => Promise<Settings>;
	updateSettings: (newSettings: Settings) => Promise<Settings>;
	selectDirectory: () => Promise<string>;
	onSettingsMenuClicked: (callback: () => void) => void;
	getData: (path: string) => Promise<Data>;
};
