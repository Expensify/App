import {useEffect, useRef} from 'react';
import type {NativeEventSubscription} from 'react-native';
import {Linking} from 'react-native';
import CONST from './CONST';
import useIsAuthenticated from './hooks/useIsAuthenticated';
import useOnyx from './hooks/useOnyx';
import {openReportFromDeepLink} from './libs/actions/Link';
import * as Report from './libs/actions/Report';
import {hasAuthToken} from './libs/actions/Session';
import Log from './libs/Log';
import {endSpan} from './libs/telemetry/activeSpans';
import ONYXKEYS from './ONYXKEYS';
import type {Route} from './ROUTES';
import {hasSeenTourSelector} from './selectors/Onboarding';
import isLoadingOnyxValue from './types/utils/isLoadingOnyxValue';

type DeepLinkHandlerProps = {
    /** Callback to set the initial URL resolved from deep linking */
    onInitialUrl: (url: Route | null) => void;
};

/**
 * Component that does not render anything but isolates the COLLECTION.REPORT Onyx subscription
 * from the root Expensify component to prevent cascading re-renders of the
 * entire navigation tree on every report change.
 */
function DeepLinkHandler({onInitialUrl}: DeepLinkHandlerProps) {
    const linkingChangeListener = useRef<NativeEventSubscription | null>(null);
    const initialUrlProcessed = useRef(false);

    const [allReports, allReportsMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [, sessionMetadata] = useOnyx(ONYXKEYS.SESSION);
    const [conciergeReportID, conciergeReportIDMetadata] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected, introSelectedMetadata] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed, isSelfTourViewedMetadata] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas, betasMetadata] = useOnyx(ONYXKEYS.BETAS);
    const isAuthenticated = useIsAuthenticated();

    useEffect(() => {
        if (isLoadingOnyxValue(allReportsMetadata, sessionMetadata, conciergeReportIDMetadata, introSelectedMetadata, isSelfTourViewedMetadata, betasMetadata)) {
            return;
        }

        // Guard against stale closures: when deps change and the effect re-runs, the previous
        // getInitialURL() promise may still be in-flight. Without this guard, its .then() would
        // fire with stale conciergeReportID/introSelected values, causing a duplicate
        // openReportFromDeepLink() call.
        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout>;

        // If the app is opened from a deep link, get the reportID (if exists) from the deep link and navigate to the chat report.
        // We race against a timeout to prevent permanently blocking NavigationRoot if getInitialURL() never resolves
        // (e.g. in HybridApp when OldDot fails to send the URL via native bridge).
        Promise.race([
            Linking.getInitialURL(),
            new Promise<null>((resolve) => {
                timeoutId = setTimeout(() => resolve(null), CONST.TIMING.GET_INITIAL_URL_TIMEOUT);
            }),
        ])
            .then((url) => {
                if (cancelled) {
                    return;
                }

                initialUrlProcessed.current = true;
                onInitialUrl(url as Route);

                if (url) {
                    if (conciergeReportID === undefined) {
                        Log.info('[Deep link] conciergeReportID is undefined when processing initial URL', false, {url});
                    }
                    if (introSelected === undefined) {
                        Log.info('[Deep link] introSelected is undefined when processing initial URL', false, {url});
                    }
                    // Use hasAuthToken() for the latest auth state at call time, since the isAuthenticated
                    // closure value may be stale on cold start (useOnyx reports 'loaded' before storage completes).
                    const isCurrentlyAuthenticated = hasAuthToken();
                    openReportFromDeepLink(url, allReports, isCurrentlyAuthenticated, conciergeReportID, introSelected, isSelfTourViewed, betas);
                } else {
                    Report.doneCheckingPublicRoom();
                }

                endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.DEEP_LINK);
            })
            .catch(() => {
                if (cancelled) {
                    return;
                }

                initialUrlProcessed.current = true;
                onInitialUrl(null);
                Report.doneCheckingPublicRoom();
                endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.DEEP_LINK);
            });

        // Open chat report from a deep link (only mobile native)
        linkingChangeListener.current = Linking.addEventListener('url', (state) => {
            if (conciergeReportID === undefined) {
                Log.info('[Deep link] conciergeReportID is undefined when processing URL change', false, {url: state.url});
            }
            if (introSelected === undefined) {
                Log.info('[Deep link] introSelected is undefined when processing URL change', false, {url: state.url});
            }
            const isCurrentlyAuthenticated = hasAuthToken();
            openReportFromDeepLink(state.url, allReports, isCurrentlyAuthenticated, conciergeReportID, introSelected, isSelfTourViewed, betas);
        });

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
            linkingChangeListener.current?.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally excluding allReports, isAuthenticated, and onInitialUrl to avoid re-triggering deep link handling on every report update
    }, [
        conciergeReportID,
        introSelected,
        betas,
        allReportsMetadata.status,
        sessionMetadata.status,
        conciergeReportIDMetadata.status,
        introSelectedMetadata.status,
        isSelfTourViewedMetadata.status,
        betasMetadata.status,
    ]);

    // Safety net: if getInitialURL() resolves before the session loads, hasAuthToken() may return false
    // for an authenticated user, causing openReportFromDeepLink to take the wrong path. Once isAuthenticated
    // settles to true, unblock the UI. The initialUrlProcessed guard ensures this doesn't fire before URL
    // resolution. In the common case (isAuthenticated settles first), this is a no-op because
    // openReportFromDeepLink's own doneCheckingPublicRoom() call handles it.
    useEffect(() => {
        if (!isAuthenticated || !initialUrlProcessed.current) {
            return;
        }

        Report.doneCheckingPublicRoom();
    }, [isAuthenticated]);

    return null;
}

export default DeepLinkHandler;
