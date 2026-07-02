type Init = () => void;

type IsClientTheLeader = () => boolean;

type IsReady = () => Promise<void>;

type PromoteToLeader = () => void;

export type {Init, IsClientTheLeader, IsReady, PromoteToLeader};
