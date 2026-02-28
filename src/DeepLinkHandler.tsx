import {useEffect, useRef} from 'react';
import type {NativeEventSubscription} from 'react-native';
import {Linking} from 'react-native';
import CONST from './CONST';
import useArchivedReportsIDSet from './hooks/useArchivedReportsIDSet';
import useIsAuthenticated from './hooks/useIsAuthenticated';
import useOnyx from './hooks/useOnyx';
import {openReportFromDeepLink} from './libs/actions/Link';
import * as Report from './libs/actions/Report';
import {hasAuthToken} from './libs/actions/Session';
import Log from './libs/Log';
import {endSpan} from './libs/telemetry/activeSpans';
import ONYXKEYS from './ONYXKEYS';
import type {Route} from './ROUTES';
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

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [, sessionMetadata] = useOnyx(ONYXKEYS.SESSION);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const archivedReportsIDSet = useArchivedReportsIDSet();
    const allReportsRef = useRef(allReports);
    const onInitialURLRef = useRef(onInitialUrl);
    const archivedReportsIDSetRef = useRef(archivedReportsIDSet);
    const isAuthenticated = useIsAuthenticated();
    const isAuthenticatedRef = useRef(isAuthenticated);

    useEffect(() => {
        allReportsRef.current = allReports;
    }, [allReports]);

    useEffect(() => {
        onInitialURLRef.current = onInitialUrl;
    }, [onInitialUrl]);

    useEffect(() => {
        archivedReportsIDSetRef.current = archivedReportsIDSet;
    }, [archivedReportsIDSet]);

    useEffect(() => {
        isAuthenticatedRef.current = isAuthenticated;
    }, [isAuthenticated]);

    useEffect(() => {
        if (isLoadingOnyxValue(sessionMetadata)) {
            return;
        }
        // If the app is opened from a deep link, get the reportID (if exists) from the deep link and navigate to the chat report
        Linking.getInitialURL().then((url) => {
            onInitialURLRef.current(url as Route);

            if (url) {
                if (conciergeReportID === undefined) {
                    Log.info('[Deep link] conciergeReportID is undefined when processing initial URL', false, {url});
                }
                if (introSelected === undefined) {
                    Log.info('[Deep link] introSelected is undefined when processing initial URL', false, {url});
                }
                openReportFromDeepLink(url, allReportsRef.current, isAuthenticatedRef.current, conciergeReportID, introSelected, archivedReportsIDSetRef.current);
            } else {
                Report.doneCheckingPublicRoom();
            }

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
            openReportFromDeepLink(state.url, allReportsRef.current, isCurrentlyAuthenticated, conciergeReportID, introSelected, archivedReportsIDSetRef.current);
        });

        return () => {
            linkingChangeListener.current?.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want this effect to re-run when conciergeReportID changes
    }, [sessionMetadata?.status, conciergeReportID, introSelected]);

    return null;
}

export default DeepLinkHandler;
