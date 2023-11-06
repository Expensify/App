type Init = () => void;

type IsClientTheLeader = () => boolean;

type IsReady = () => Promise<void>;

export type {Init, IsClientTheLeader, IsReady};
