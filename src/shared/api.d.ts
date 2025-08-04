import type { InternMap } from 'd3';

// Settings

export type Settings = {
	proMetaPath: string;
	proDataPath: string;
	radiationPath: string;
	systemicTherapyPath: string;
	oralPath: string;
	surgeryPath: string;
};

// PRO

// Meta

export type PROItem = {
	key: string;
	itemID: number;
	item: string;
	constructName: string;
	responseItemType: string;
	responseItemStrings: string[];
	responseItemValues: number[];
	normalizedResponseItemValues: number[];
	bankName: string;
	categoryName: string;
};

export type MergedPROItem = Omit<PROItem, 'itemID' | 'item'> & {
	itemIDs: number[];
	items: string[];
};

export type PROMetaByKey = InternMap<string, MergedPROItem>;

// Responses

export type PROResponse = {
	userID: number;
	dateTime: Date;
	key: string;
	itemID: number;
	responseValue: number;
	normalizedResponseValue: number;
	responseText: string;
};

export type PROKeyToResponses = InternMap<string, PROResponse[]>;
export type PROUsersResponses = InternMap<number, PROKeyToResponses>;

// Constructs

export type PROConstructOrderMethod = 'category' | 'severity';

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

// Treatments

export type TreatmentEvent = SingleTreatmentEvent | RangeTreatmentEvent;

// Used to represent on instance of a treatment that takes place on
// a specific day.
export type SingleTreatmentEvent = {
	kind: 'single';
	userID: number;
	category: 'Oral' | 'Systemic therapy' | 'Radiation' | 'Surgery';
	detail: string;
	date: Date;
	stopDate: null; // always null, see RangeTreatmentEvent below
	missed: boolean;
	extras: { label: string; value: string }[];
};

// Used to represent a treatment taking placing over multiple days.
// For example, with oral treatment, the patient may take some medicine
// daily. We know the start and end dates, but we don't have an event
// for each time they take it.
export type RangeTreatmentEvent = {
	kind: 'range';
	userID: number;
	category: 'Oral' | 'Systemic therapy' | 'Radiation' | 'Surgery';
	detail: string;
	date: Date;
	stopDate: Date | null; // null means it's ongoing
	missed: false; // we don't track if they any
	extras: [];
};

export type TreatmentEventsByUser = InternMap<number, TreatmentEvent[]>;

export type GroupedTreatments = [
	TreatmentEvent['category'],
	[TreatmentEvent['detail'], TreatmentEvent[]][]
][];

// preload API

export type Data = {
	proMetaByKey: PROMetaByKey;
	proUsersResponses: PROUsersResponses;
	proUsersConstructOrders: PROUsersConstructOrders;
	treatmentEventsByUser: TreatmentEventsByUser;
};

export type ElectronAPI = {
	getSettings: () => Promise<Settings>;
	updateSettings: (newSettings: Settings) => Promise<Settings>;
	selectFilePath: () => Promise<string>;
	onSettingsMenuClicked: (callback: () => void) => void;
	getData: (settings: Settings) => Promise<Data>;
};
