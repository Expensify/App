type ActiveClientManagerModule = {
    init: () => void;
    isClientTheLeader: () => boolean;
    isReady: () => Promise<void>;
};

export default ActiveClientManagerModule;
