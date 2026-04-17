import {hasSeenTourSelector} from '@selectors/Onboarding';
import {useCallback, useEffect, useRef} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {useInitialURLActions, useInitialURLState} from '@components/InitialURLContextProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasActiveAdminPolicies from '@hooks/useHasActiveAdminPolicies';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import {init, isClientTheLeader} from '@libs/ActiveClientManager';
import Log from '@libs/Log';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';
import Pusher from '@libs/Pusher';
import PusherConnectionManager from '@libs/PusherConnectionManager';
import {getReportIDFromLink} from '@libs/ReportUtils';
import * as SessionUtils from '@libs/SessionUtils';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {getSearchParamFromUrl} from '@libs/Url';
import * as App from '@userActions/App';
import * as Download from '@userActions/Download';
import * as Report from '@userActions/Report';
import * as Session from '@userActions/Session';
import * as User from '@userActions/User';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {lastWorkspaceNumberSelector} from '@src/selectors/Policy';
import type {Policy, ReportAttributesDerivedValue} from '@src/types/onyx';

function initializePusher(currentUserAccountID?: number, getReportAttributes?: () => ReportAttributesDerivedValue['reports'] | undefined) {
    return Pusher.init({
        appKey: CONFIG.PUSHER.APP_KEY,
        cluster: CONFIG.PUSHER.CLUSTER,
        authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api/AuthenticatePusher?`,
    }).then(() => {
        User.subscribeToUserEvents(currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID, getReportAttributes);
    });
}

/**
 * Component that does not render anything and owns mount-only initialization logic, network reconnect,
 * and all Onyx subscriptions that are only consumed during initialization.
 *
 * Extracted from AuthScreens to isolate useOnyx subscriptions:
 * - SESSION, NVP_INTRO_SELECTED, NVP_ACTIVE_POLICY_ID,
 *   NVP_ONBOARDING (tour selector), ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT (x2),
 *   IS_LOADING_APP
 */
function AuthScreensInitHandler() {
    const currentUrl = getCurrentUrl();
    const delegatorEmail = getSearchParamFromUrl(currentUrl, 'delegatorEmail');
    const {translate} = useLocalize();
    const {initialURL, isAuthenticatedAtStartup} = useInitialURLState();
    const {setIsAuthenticatedAtStartup} = useInitialURLActions();
    const hasActiveAdminPolicies = useHasActiveAdminPolicies();

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [initialLastUpdateIDAppliedToClient] = useOnyx(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const lastWorkspaceNumberWithEmailSelector = useCallback(
        (policies: OnyxCollection<Policy>) => {
            const policyOwnerEmail = getSearchParamFromUrl(currentUrl, 'ownerEmail') ?? session?.email ?? '';
            return lastWorkspaceNumberSelector(policies, policyOwnerEmail);
        },
        [currentUrl, session?.email],
    );
    const [lastWorkspaceNumber] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: lastWorkspaceNumberWithEmailSelector});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const reportAttributes = useReportAttributes();
    // We use a ref so the Pusher callback (registered once on mount) always reads the latest value without re-subscribing.
    const reportAttributesRef = useRef(reportAttributes);
    reportAttributesRef.current = reportAttributes;

    useEffect(() => {
        if (!Navigation.isActiveRoute(ROUTES.SIGN_IN_MODAL)) {
            return;
        }
        // This means sign in in RHP was successful, so we can subscribe to user events
        initializePusher(session?.accountID, () => reportAttributesRef.current);
    }, [session?.accountID]);

    useEffect(() => {
        const isLoggingInAsNewUser = !!session?.email && SessionUtils.isLoggingInAsNewUser(currentUrl, session.email);
        // Sign out the current user if we're transitioning with a different user
        const isTransitioning = currentUrl.includes(ROUTES.TRANSITION_BETWEEN_APPS);
        const isSupportalTransition = currentUrl.includes('authTokenType=support');
        if (isLoggingInAsNewUser && isTransitioning) {
            Session.signOutAndRedirectToSignIn(false, isSupportalTransition);
            return () => {
                Session.cleanupSession();
            };
        }

        // Pusher initialization span
        startSpan(CONST.TELEMETRY.SPAN_NAVIGATION.PUSHER_INIT, {
            name: CONST.TELEMETRY.SPAN_NAVIGATION.PUSHER_INIT,
            op: CONST.TELEMETRY.SPAN_NAVIGATION.PUSHER_INIT,
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.ROOT),
        });
        PusherConnectionManager.init();

        initializePusher(session?.accountID, () => reportAttributesRef.current).finally(() => {
            endSpan(CONST.TELEMETRY.SPAN_NAVIGATION.PUSHER_INIT);
        });

        // Sometimes when we transition from old dot to new dot, the client is not the leader
        // so we need to initialize the client again
        if (!isClientTheLeader() && isTransitioning) {
            init();
        }

        // If we are on this screen then we are "logged in", but the user might not have "just logged in". They could be reopening the app
        // or returning from background. If so, we'll assume they have some app data already and we can call reconnectApp() instead of openApp().
        // Delegator connect() is handled by DelegatorConnectGate.
        if (delegatorEmail) {
            // connect() handled by DelegatorConnectGate
        } else if (SessionUtils.didUserLogInDuringSession()) {
            const reportID = getReportIDFromLink(initialURL ?? null);
            if (reportID && !isAuthenticatedAtStartup) {
                Report.openReport({reportID, introSelected, betas});
                // Don't want to call `openReport` again when logging out and then logging in
                setIsAuthenticatedAtStartup(true);
            }
            App.openApp();
        } else {
            Log.info('[AuthScreens] Sending ReconnectApp');
            App.reconnectApp(initialLastUpdateIDAppliedToClient);
        }

        App.setUpPoliciesAndNavigate(
            session,
            introSelected,
            currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
            activePolicyID,
            isSelfTourViewed,
            betas,
            hasActiveAdminPolicies,
            lastWorkspaceNumber,
            translate,
        );

        Download.clearDownloads();

        return () => {
            Session.cleanupSession();
        };

        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default AuthScreensInitHandler;
