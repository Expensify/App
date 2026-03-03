import type {RefObject} from 'react';
import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {canWriteInReport, chatIncludesChronosWithID, isArchivedNonExpenseReport, isUnread} from '@libs/ReportUtils';
import {isAnonymousUser, signOutAndRedirectToSignIn} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions, Report as ReportType} from '@src/types/onyx';
import type {ActionID} from './actions/actionConfig';
import {getVisibleActionIDs as getVisibleActionIDsFromConfig, RESTRICTED_READONLY_ACTION_IDS} from './actions/actionConfig';
import type {ContextMenuAnchor, ContextMenuType} from './ReportActionContextMenu';
import {hideContextMenu} from './ReportActionContextMenu';

const EMPTY_SET = new Set<string>();

type UseContextMenuDataParams = {
    reportID: string | undefined;
    reportActionID: string | undefined;
    originalReportID: string | undefined;
    draftMessage: string;
    selection: string;
    type: ContextMenuType;
    anchor: RefObject<ContextMenuAnchor> | undefined;
};

type UseReportContextMenuDataReturn = {
    report: OnyxEntry<ReportType>;
    originalReport: OnyxEntry<ReportType>;
    reportActions: OnyxEntry<ReportActions>;
    reportAction: OnyxEntry<ReportAction>;
    isArchivedRoom: boolean;
    isChronosReport: boolean;
    isPinnedChat: boolean;
    isUnreadChat: boolean;
    isProduction: boolean;
    isDebugModeEnabled: OnyxEntry<boolean>;
    isOffline: boolean;
    disabledActionIDs: Set<string>;
    translate: ReturnType<typeof useLocalize>['translate'];
    getLocalDateFromDatetime: ReturnType<typeof useLocalize>['getLocalDateFromDatetime'];
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    getVisibleActionIDs: () => ActionID[];
    type: ContextMenuType;
    reportID: string | undefined;
    originalReportID: string | undefined;
    draftMessage: string;
    selection: string;
    anchor: RefObject<ContextMenuAnchor> | undefined;
};

function useReportContextMenuData({reportID, reportActionID, originalReportID, draftMessage, selection, type, anchor}: UseContextMenuDataParams): UseReportContextMenuDataReturn {
    const {translate, getLocalDateFromDatetime} = useLocalize();
    const {isOffline} = useNetwork();
    const {isProduction} = useEnvironment();

    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canEvict: false});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`);
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);

    const isOriginalReportArchived = useReportIsArchived(originalReportID);

    const disabledActionIDs = !canWriteInReport(report) ? RESTRICTED_READONLY_ACTION_IDS : EMPTY_SET;

    const hasValidReportAction = reportActions && reportActionID && reportActionID !== '0' && reportActionID !== '-1';
    const reportAction: OnyxEntry<ReportAction> = hasValidReportAction ? reportActions[reportActionID] : undefined;

    const isChronosReport = chatIncludesChronosWithID(originalReportID);
    const isArchivedRoom = isArchivedNonExpenseReport(originalReport, isOriginalReportArchived);
    const isPinnedChat = !!report?.isPinned;
    const isUnreadChat = isUnread(report, undefined, isOriginalReportArchived);

    const interceptAnonymousUser = (callback: () => void, isAnonymousAction = false) => {
        if (isAnonymousUser() && !isAnonymousAction) {
            hideContextMenu(false);
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                signOutAndRedirectToSignIn();
            });
        } else {
            callback();
        }
    };

    const shouldShowArgs = {
        type: CONST.CONTEXT_MENU_TYPES.REPORT,
        reportAction,
        childReportActions: undefined,
        isArchivedRoom,
        menuTarget: anchor,
        isChronosReport,
        reportID,
        isPinnedChat,
        isUnreadChat,
        isThreadReportParentAction: false,
        isOffline: !!isOffline,
        isProduction,
        moneyRequestAction: undefined as ReportAction | undefined,
        areHoldRequirementsMet: false,
        isDebugModeEnabled,
        iouTransaction: undefined,
        transactions: undefined,
        moneyRequestReport: undefined,
        moneyRequestPolicy: undefined,
        isHarvestReport: false,
    };

    const getVisibleActionIDs = (): ActionID[] => getVisibleActionIDsFromConfig(shouldShowArgs, disabledActionIDs);

    return {
        report,
        originalReport,
        reportActions,
        reportAction,
        isArchivedRoom,
        isChronosReport,
        isPinnedChat,
        isUnreadChat,
        isProduction,
        isDebugModeEnabled,
        isOffline: !!isOffline,
        disabledActionIDs,
        translate,
        getLocalDateFromDatetime,
        interceptAnonymousUser,
        getVisibleActionIDs,
        type,
        reportID,
        originalReportID,
        draftMessage,
        selection,
        anchor,
    };
}

export default useReportContextMenuData;
export type {UseContextMenuDataParams, UseReportContextMenuDataReturn};
