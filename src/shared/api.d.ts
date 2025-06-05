import type { InternMap } from 'd3';

// Settings

export type Settings = {
	proMetaPath: string;
	proDataPath: string;
	radiationPath: string;
	systemicTherapyPath: string;
	oralPath: string;
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

export type RadiationEvent = {
	date: Date;
	site: string;
	dose: number | null;
	fractions: number | null;
};

export type RadiationTreatment = {
	totalDoseInitiallyPlanned: number | null;
	totalFractionsPlanned: number | null;
	changeInPlan: string;
	newTotalDosePlanned: number | null;
	newTotalFractionsPlanned: number | null;
	events: RadiationEvent[];
};

export type RadiationTreatmentByUser = InternMap<number, RadiationTreatment>;

// preload API

export type Data = {
	proMetaByKey: PROMetaByKey;
	proUsersResponses: PROUsersResponses;
	proUsersConstructOrders: PROUsersConstructOrders;
	radiationTreatmentByUser: RadiationTreatmentByUser;
};

export type ElectronAPI = {
	getSettings: () => Promise<Settings>;
	updateSettings: (newSettings: Settings) => Promise<Settings>;
	selectFilePath: () => Promise<string>;
	onSettingsMenuClicked: (callback: () => void) => void;
	getData: (settings: Settings) => Promise<Data>;
};
