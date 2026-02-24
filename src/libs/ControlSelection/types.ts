type ControlSelectionModule = {
    block: () => void;
    unblock: () => void;
    blockElement: (element?: HTMLElement | null) => void;
    unblockElement: (element?: HTMLElement | null) => void;
};

export default ControlSelectionModule;
