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

// File reading

export type FileResults<T> = {
	rows: T[];
	errors: string[];
};

// PRO

// Meta

export type ProItem = {
	key: string;
	itemId: number;
	item: string;
	constructName: string;
	responseItemType: string;
	bankName: string;
	categoryName: string;
	textToValue: Map<string, number>;
	valueToNormalizedValue: Map<number, number>;
};

export type MergedProItem = Omit<ProItem, 'itemId' | 'item'> & {
	itemIds: number[];
	items: string[];
};

export type ProItemByKey = InternMap<string, MergedProItem>;

// Responses

export type ProResponse = {
	responseId: number;
	userId: number;
	dateTime: Date;
	key: string;
	itemId: number;
	responseValue: number;
	normalizedResponseValue: number;
	responseText: string;
};

export type PROKeyToResponses = InternMap<string, ProResponse[]>;
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
	userId: number;
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
	userId: number;
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
	proMetaByKey: ProItemByKey;
	proUsersResponses: PROUsersResponses;
	proUsersConstructOrders: PROUsersConstructOrders;
	treatmentEventsByUser: TreatmentEventsByUser;
	errors: {
		proMeta: string[];
		proData: string[];
		radiation: string[];
		systemicTherapy: string[];
		oral: string[];
		surgery: string[];
	};
};

export type ElectronAPI = {
	getSettings: () => Promise<Settings>;
	updateSettings: (newSettings: Settings) => Promise<Settings>;
	selectFilePath: () => Promise<string>;
	onSettingsMenuClicked: (callback: () => void) => void;
	getData: (settings: Settings) => Promise<Data>;
};
