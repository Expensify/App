import {useRoot} from './RootContext';

function useIsOpen(): boolean {
    return useRoot('useIsOpen').state.isOpen;
}

export default useIsOpen;
