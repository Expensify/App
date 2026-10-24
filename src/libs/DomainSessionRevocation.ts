/** Shares the persisted modal state with authentication code outside React. */
import ONYXKEYS from '@src/ONYXKEYS';
import type DomainSessionRevocation from '@src/types/onyx/DomainSessionRevocation';

import Onyx from 'react-native-onyx';

let receipt: DomainSessionRevocation | undefined;
let resolveLoaded: () => void;
const receiptLoaded = new Promise<void>((resolve) => {
    resolveLoaded = resolve;
});

// Authentication must honor the modal even when no authenticated screen is mounted.
Onyx.connectWithoutView({
    key: ONYXKEYS.DOMAIN_SESSION_REVOCATION,
    callback: (value) => {
        receipt = value;
        resolveLoaded();
    },
});

function isDomainSessionRevocationActive() {
    return !!receipt;
}

async function getDomainSessionRevocation() {
    await receiptLoaded;
    return receipt;
}

export {isDomainSessionRevocationActive, getDomainSessionRevocation};
