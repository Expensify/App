type Init = () => void;

type IsClientTheLeader = () => boolean;

type IsReady = () => Promise<void>;

/** Returns a function that removes the callback */
type OnBecomeLeader = (callback: () => void) => () => void;

export type {Init, IsClientTheLeader, IsReady, OnBecomeLeader};
