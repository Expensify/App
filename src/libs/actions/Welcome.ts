import Onyx, {OnyxCollection} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import OnyxPolicy from '@src/types/onyx/Policy';
import Report from '@src/types/onyx/Report';
import * as Policy from './Policy';

let resolveIsReadyPromise: (value?: Promise<void>) => void | undefined;
let isReadyPromise = new Promise<void>((resolve) => {
    resolveIsReadyPromise = resolve;
});

let isFirstTimeNewExpensifyUser: boolean | undefined;
let isLoadingReportData = true;
let currentUserAccountID: number | undefined;

type Route = {
    name: string;
    params?: {path: string; exitTo?: string; openOnAdminRoom?: boolean};
};

type ShowParams = {
    routes: Route[];
    showCreateMenu?: () => void;
    showPopoverMenu?: () => boolean;
};

/**
 * Check that a few requests have completed so that the welcome action can proceed:
 *
 * - Whether we are a first time new expensify user
 * - Whether we have loaded all policies the server knows about
 * - Whether we have loaded all reports the server knows about
 */
function checkOnReady() {
    if (isFirstTimeNewExpensifyUser === undefined || isLoadingReportData) {
        return;
    }

    resolveIsReadyPromise?.();
}

Onyx.connect({
    key: ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
    initWithStoredValues: false,
    callback: (value) => {
        // If isFirstTimeNewExpensifyUser was true do not update it to false. We update it to false inside the Welcome.show logic
        // More context here https://github.com/Expensify/App/pull/16962#discussion_r1167351359

        isFirstTimeNewExpensifyUser = value ?? undefined;

        checkOnReady();
    },
});

Onyx.connect({
    key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    initWithStoredValues: false,
    callback: (value) => {
        isLoadingReportData = value ?? false;
        checkOnReady();
    },
});

const allReports: OnyxCollection<Report> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    initWithStoredValues: false,
    callback: (val, key) => {
        if (!val || !key) {
            return;
        }

        allReports[key] = {...allReports[key], ...val};
    },
});

const allPolicies: OnyxCollection<OnyxPolicy> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (val, key) => {
        if (!key) {
            return;
        }

        if (val === null || val === undefined) {
            delete allPolicies[key];
            return;
        }

        allPolicies[key] = {...allPolicies[key], ...val};
    },
});

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val, key) => {
        if (!val || !key) {
            return;
        }

        currentUserAccountID = val.accountID;
    },
});

/**
 * Shows a welcome action on first login
 */
function show({routes, showCreateMenu = () => {}, showPopoverMenu = () => false}: ShowParams) {
    isReadyPromise.then(() => {
        if (!isFirstTimeNewExpensifyUser) {
            return;
        }

        // If we are rendering the SidebarScreen at the same time as a workspace route that means we've already created a workspace via workspace/new and should not open the global
        // create menu right now. We should also stay on the workspace page if that is our destination.
        const topRoute = routes.length > 0 ? routes[routes.length - 1] : undefined;
        const isWorkspaceRoute = topRoute !== undefined && topRoute.name === SCREENS.RIGHT_MODAL.SETTINGS && topRoute.params?.path.includes('workspace');
        const transitionRoute = routes.find((route) => route.name === SCREENS.TRANSITION_BETWEEN_APPS);
        const exitingToWorkspaceRoute = transitionRoute?.params?.exitTo === 'workspace/new';
        const openOnAdminRoom = topRoute?.params?.openOnAdminRoom ?? false;
        const isDisplayingWorkspaceRoute = isWorkspaceRoute ?? exitingToWorkspaceRoute;

        // If we already opened the workspace settings or want the admin room to stay open, do not
        // navigate away to the workspace chat report
        const shouldNavigateToWorkspaceChat = !isDisplayingWorkspaceRoute && !openOnAdminRoom;

        const workspaceChatReport = Object.values(allReports ?? {}).find((report) => {
            if (report) {
                return ReportUtils.isPolicyExpenseChat(report) && report.ownerAccountID === currentUserAccountID && report.statusNum !== CONST.REPORT.STATUS.CLOSED;
            }
            return false;
        });

        if (workspaceChatReport ?? openOnAdminRoom) {
            // This key is only updated when we call ReconnectApp, setting it to false now allows the user to navigate normally instead of always redirecting to the workspace chat
            Onyx.set(ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER, false);
        }

        if (shouldNavigateToWorkspaceChat && workspaceChatReport) {
            if (workspaceChatReport.reportID !== null) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(workspaceChatReport.reportID));
            }

            // If showPopoverMenu exists and returns true then it opened the Popover Menu successfully, and we can update isFirstTimeNewExpensifyUser
            // so the Welcome logic doesn't run again
            if (showPopoverMenu?.()) {
                isFirstTimeNewExpensifyUser = false;
            }

            return;
        }

        // If user is not already an admin of a free policy and we are not navigating them to their workspace or creating a new workspace via workspace/new then
        // we will show the create menu.
        if (!Policy.isAdminOfFreePolicy(allPolicies ?? undefined) && !isDisplayingWorkspaceRoute) {
            showCreateMenu();
        }

        // Update isFirstTimeNewExpensifyUser so the Welcome logic doesn't run again
        isFirstTimeNewExpensifyUser = false;
    });
}

function resetReadyCheck() {
    isReadyPromise = new Promise((resolve) => {
        resolveIsReadyPromise = resolve;
    });
    isFirstTimeNewExpensifyUser = undefined;
    isLoadingReportData = true;
}

function serverDataIsReadyPromise(): Promise<void> {
    return isReadyPromise;
}

export {show, serverDataIsReadyPromise, resetReadyCheck};
