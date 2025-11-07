import {MFACallbacks} from './VALUES';

const MFA = {
    registerCallback: (id: string, callback: () => unknown) => {
        MFACallbacks.onFulfill[id] = callback;
    },
};

export default MFA;
