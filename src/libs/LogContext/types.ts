type ActiveTab = {clientID: string; isLeader: boolean};

type AddLogContext = (message: string) => string;

type SetActiveTab = (tab: ActiveTab) => void;

export default AddLogContext;
export type {ActiveTab, SetActiveTab};
