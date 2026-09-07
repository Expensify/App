import {useInitialURLActions, useInitialURLState} from '@components/InitialURLContextProvider';

import useActivePolicy from '@hooks/useActivePolicy';
import useAIFeaturesPromoModal from '@hooks/useAIFeaturesPromoModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasActiveAdminPolicies from '@hooks/useHasActiveAdminPolicies';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import useLocalize from '@hooks/useLocalize';
import useOneTransactionThreadReportID from '@hooks/useOneTransactionThreadReportID';
import useOnyx from '@hooks/useOnyx';
import useReconcileHighContrastIntent from '@hooks/useReconcileHighContrastIntent';
import useReportAttributes from '@hooks/useReportAttributes';
import useRootNavigationState from '@hooks/useRootNavigationState';

import {init, isClientTheLeader} from '@libs/ActiveClientManager';
import {isQAServerActive} from '@libs/ApiUtils';
import Log from '@libs/Log';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';
import Pusher from '@libs/Pusher';
import PusherConnectionManager from '@libs/PusherConnectionManager';
import {getReportIDFromLink} from '@libs/ReportUtils';
import {registerPusherReinitializeHandler} from '@libs/requestPusherReinitialize';
import type {PusherReinitializeHandlerParams} from '@libs/requestPusherReinitialize';
import * as SessionUtils from '@libs/SessionUtils';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {getSearchParamFromUrl} from '@libs/Url';

import * as App from '@userActions/App';
import * as Download from '@userActions/Download';
import {clearStaleExportDownloads} from '@userActions/Export';
import * as Report from '@userActions/Report';
import * as Session from '@userActions/Session';
import * as User from '@userActions/User';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import {useEffect, useRef} from 'react';

function initializePusher(
    currentUserAccountID: number | undefined,
    currentUserEmail: string | undefined,
    getTopmostOneTransactionThreadReportID: () => string | undefined,
    getReportAttributes: () => ReportAttributesDerivedValue['reports'] | undefined,
) {
    // No fallback: CONFIG.PUSHER.APP_KEY defaults to the production key, so falling back would open a QA socket
    // against production Pusher and every channel auth, signed with QA's secret, would be rejected quietly.
    const appKey = isQAServerActive() ? CONFIG.PUSHER.QA_APP_KEY : CONFIG.PUSHER.APP_KEY;

    // pusher-js rejects only a null/undefined key, so an empty one builds a socket that never connects while Pusher.init
    // resolves solely from its 'connected' handler, leaving every subscribe() and the PUSHER_INIT span pending forever.
    if (!appKey) {
        Log.alert('[Pusher] Skipping init: no Pusher app key is configured for the active server');
        return Promise.resolve();
    }

    return Pusher.init({
        appKey,
        cluster: CONFIG.PUSHER.CLUSTER,
    }).then(() => {
        User.subscribeToUserEvents(currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID, currentUserEmail ?? '', getTopmostOneTransactionThreadReportID, getReportAttributes);
    });
}

/**
 * Component that does not render anything and owns mount-only initialization logic, network reconnect,
 * and all Onyx subscriptions that are only consumed during initialization.
 *
 * Extracted from AuthScreens to isolate useOnyx subscriptions:
 * - SESSION, NVP_INTRO_SELECTED, NVP_ACTIVE_POLICY_ID,
 *   NVP_ONBOARDING (guided-setup and tour status selector), ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT (x2),
 *   IS_LOADING_APP
 */
function AuthScreensInitHandler() {
    const currentUrl = getCurrentUrl();
    const delegatorEmail = getSearchParamFromUrl(currentUrl, 'delegatorEmail');
    const ownerEmail = getSearchParamFromUrl(currentUrl, 'ownerEmail');
    const {translate} = useLocalize();
    const {initialURL, isAuthenticatedAtStartup} = useInitialURLState();
    const {setIsAuthenticatedAtStartup} = useInitialURLActions();
    const hasActiveAdminPolicies = useHasActiveAdminPolicies();

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [initialLastUpdateIDAppliedToClient] = useOnyx(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const lastWorkspaceNumber = useLastWorkspaceNumber(ownerEmail ?? undefined);
    const activePolicy = useActivePolicy();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const reportAttributes = useReportAttributes();
    // We use a ref so the Pusher callback (registered once on mount) always reads the latest value without re-subscribing.
    const reportAttributesRef = useRef(reportAttributes);
    reportAttributesRef.current = reportAttributes;

    useReconcileHighContrastIntent();
    useAIFeaturesPromoModal(session);

    const topmostReportID = useRootNavigationState(Navigation.getFocusedReportId);
    const topmostOneTransactionThreadReportID = useOneTransactionThreadReportID(topmostReportID);
    // We use a ref so the Pusher callback (registered once on mount) always reads the latest value without re-subscribing.
    const topmostOneTransactionThreadReportIDRef = useRef(topmostOneTransactionThreadReportID);

    useEffect(() => {
        topmostOneTransactionThreadReportIDRef.current = topmostOneTransactionThreadReportID;
    }, [topmostOneTransactionThreadReportID]);

    useEffect(() => {
        registerPusherReinitializeHandler(({accountID, email}: PusherReinitializeHandlerParams = {}) => {
            const currentAccountID = accountID ?? session?.accountID;
            const currentEmail = email ?? session?.email ?? '';

            if (currentAccountID === undefined) {
                return Promise.resolve();
            }

            return initializePusher(
                currentAccountID,
                currentEmail,
                () => topmostOneTransactionThreadReportIDRef.current,
                () => reportAttributesRef.current,
            );
        });

        return () => {
            registerPusherReinitializeHandler(null);
        };
    }, [session?.accountID, session?.email]);

    useEffect(() => {
        if (!Navigation.isActiveRoute(ROUTES.SIGN_IN_MODAL)) {
            return;
        }
        // This means sign in in RHP was successful, so we can subscribe to user events
        initializePusher(session?.accountID, session?.email, () => topmostOneTransactionThreadReportIDRef.current, () => reportAttributesRef.current);
    }, [session?.accountID, session?.email]);

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

        initializePusher(session?.accountID, session?.email, () => topmostOneTransactionThreadReportIDRef.current, () => reportAttributesRef.current).finally(() => {
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
                Report.openReport({
                    reportID,
                    introSelected,
                    betas,
                    conciergeChat,
                    hasReportActions: false,
                    currentUserAccountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    isSelfTourViewed: guidedSetupAndTourStatus?.isSelfTourViewed,
                    hasCompletedGuidedSetupFlow: guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
                });
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
            activePolicy,
            guidedSetupAndTourStatus?.isSelfTourViewed,
            betas,
            hasActiveAdminPolicies,
            lastWorkspaceNumber,
            translate,
            conciergeChat,
        );

        Download.clearDownloads();
        clearStaleExportDownloads();

        return () => {
            Session.cleanupSession();
        };

        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default AuthScreensInitHandler;
