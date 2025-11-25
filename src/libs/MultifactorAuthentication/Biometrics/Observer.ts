import {MultifactorAuthenticationCallbacks} from './VALUES';

const MultifactorAuthenticationObserver = {
    registerCallback: (id: string, callback: () => unknown) => {
        MultifactorAuthenticationCallbacks.onFulfill[id] = callback;
    },
};

export default MultifactorAuthenticationObserver;
