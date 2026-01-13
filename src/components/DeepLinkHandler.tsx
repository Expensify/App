import HybridAppModule from '@expensify/react-native-hybrid-app';
import {useEffect, useRef} from 'react';
import type {NativeEventSubscription} from 'react-native';
import {Linking} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import {openReportFromDeepLink} from '@libs/actions/Link';
import {hasAuthToken} from '@libs/actions/Session';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';

type DeepLinkHandlerProps = {
    initialUrl: Route | null;
    isAuthenticated: boolean;
};

/**
 * Component that handles deep link processing with deferred Onyx subscriptions.
 * This component only loads deep link related Onyx keys when a URL exists, reducing initial startup time.
 */
function DeepLinkHandler({initialUrl, isAuthenticated}: DeepLinkHandlerProps) {
    const linkingChangeListener = useRef<NativeEventSubscription | null>(null);

    // Only subscribe to these Onyx keys when component is rendered (i.e., when URL exists)
    const [currentOnboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, {canBeMissing: true});
    const [currentOnboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE, {canBeMissing: true});
    const [onboardingInitialPath] = useOnyx(ONYXKEYS.ONBOARDING_LAST_VISITED_PATH, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});

    useEffect(() => {
        // Handle initial URL if it exists
        if (initialUrl) {
            openReportFromDeepLink(initialUrl, currentOnboardingPurposeSelected, currentOnboardingCompanySize, onboardingInitialPath, allReports, isAuthenticated);
        }

        // Open chat report from a deep link (only mobile native)
        linkingChangeListener.current = Linking.addEventListener('url', (state) => {
            const isCurrentlyAuthenticated = hasAuthToken();
            openReportFromDeepLink(state.url, currentOnboardingPurposeSelected, currentOnboardingCompanySize, onboardingInitialPath, allReports, isCurrentlyAuthenticated);
        });

        if (CONFIG.IS_HYBRID_APP) {
            HybridAppModule.onURLListenerAdded();
        }

        return () => {
            linkingChangeListener.current?.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default DeepLinkHandler;
