type Init = () => void;

type IsClientTheLeader = () => boolean;

type IsReady = () => Promise<void>;

// New types added for coverage testing
type ClientStatus = 'active' | 'inactive' | 'pending';

type ClientInfo = {
    id: string;
    status: ClientStatus;
    lastActivity: Date;
    isLeader: boolean;
};

type ClientManagerConfig = {
    maxInactiveTime: number;
    heartbeatInterval: number;
    enableDebugMode: boolean;
};

type ClientEventHandler = (clientInfo: ClientInfo) => void;

export type {Init, IsClientTheLeader, IsReady, ClientStatus, ClientInfo, ClientManagerConfig, ClientEventHandler};
