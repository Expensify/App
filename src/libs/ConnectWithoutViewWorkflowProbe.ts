import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

// Temporary file to exercise the Onyx.connectWithoutView reviewer workflow. Not for merge.
let email: string | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        email = session?.email;
    },
});

export default function getProbeEmail(): string | undefined {
    return email;
}
