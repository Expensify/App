import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

// Once we get the sidebar loaded end mark we know that the app is ready to be used:
export default function waitForAppLoaded(): Promise<void> {
    return new Promise((resolve) => {
        // We have used `connectWithoutView` here because OnyxUpdates is not connected to any UI
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.IS_SIDEBAR_LOADED,
            callback: (isSidebarLoaded) => {
                if (!isSidebarLoaded) {
                    return;
                }

                resolve();
                Onyx.disconnect(connection);
            },
        });
    });
}
