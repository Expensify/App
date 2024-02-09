type PlatformSpecificUpdater = {
    update: () => void;
    init?: () => void;
};

export default PlatformSpecificUpdater;
