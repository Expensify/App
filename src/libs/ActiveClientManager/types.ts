type Init = () => void;

type IsClientTheLeader = () => boolean;

type IsReady = () => Promise<void>;

/** Returns a function that removes the callback */
type OnBecomeLeader = (callback: () => void) => () => void;

type LogTab = {clientID: string; isLeader: boolean};

type GetLogTab = () => LogTab | undefined;

export type {GetLogTab, Init, IsClientTheLeader, IsReady, OnBecomeLeader};
