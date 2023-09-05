import {RefObject} from 'react';

type ControlSelectionModule = {
    block: () => void;
    unblock: () => void;
    blockElement: <T>(ref?: RefObject<T>) => void;
    unblockElement: <T>(ref?: RefObject<T>) => void;
};

export default ControlSelectionModule;
