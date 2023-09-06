import CustomRefObject from '../../types/utils/CustomRefObject';

type ControlSelectionModule = {
    block: () => void;
    unblock: () => void;
    blockElement: <T>(ref?: CustomRefObject<T> | null) => void;
    unblockElement: <T>(ref?: CustomRefObject<T> | null) => void;
};

export default ControlSelectionModule;
