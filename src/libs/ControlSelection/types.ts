import {RefObject} from 'react';

type ControlSelectionModule = {
    block: () => void;
    unblock: () => void;
    blockElement: <T>(ref?: RefObject<T> | null) => void;
    unblockElement: <T>(ref?: RefObject<T> | null) => void;
};

export default ControlSelectionModule;
