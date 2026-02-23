import {useCallback, useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import {startMoneyRequest} from '@libs/actions/IOU';
import {navigateToQuickAction} from '@libs/actions/QuickActionNavigation';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {getQuickActionIcon, getQuickActionTitle, isQuickActionAllowed} from '@libs/QuickActionUtils';
import {
    getDisplayNameForParticipant,
    getIcons,
    // Will be fixed in https://github.com/Expensify/App/issues/76852
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    getReportName,
    getWorkspaceChats,
    isPolicyExpenseChat,
} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {QuickActionName} from '@src/types/onyx/QuickAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const sessionSelector = (session: OnyxEntry<OnyxTypes.Session>) => ({email: session?.email, accountID: session?.accountID});

type UseQuickActionMenuItemParams = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
    reportID: string;
};

function useQuickActionMenuItem({shouldUseNarrowLayout, icons, reportID}: UseQuickActionMenuItemParams): PopoverMenuItem[] {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: sessionSelector});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const workspaceChatsSelector = useCallback(
        (reports: OnyxCollection<OnyxTypes.Report>) => getWorkspaceChats(activePolicyID, [session?.accountID ?? CONST.DEFAULT_NUMBER_ID], reports),
        [activePolicyID, session?.accountID],
    );
    const [policyChats = []] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: workspaceChatsSelector, canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const [quickActionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${quickAction?.chatReportID}`, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE, {canBeMissing: true});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const isReportArchived = useReportIsArchived(quickActionReport?.reportID);
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();

    const quickActionPolicyID = quickAction?.action === CONST.QUICK_ACTIONS.TRACK_PER_DIEM && quickAction?.perDiemPolicyID ? quickAction?.perDiemPolicyID : quickActionReport?.policyID;
    const [quickActionPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${quickActionPolicyID}`, {canBeMissing: true});

    const isValidReport = !(isEmptyObject(quickActionReport) || isReportArchived);

    const policyChatForActivePolicy = useMemo(() => {
        if (isEmptyObject(activePolicy) || !activePolicy?.isPolicyExpenseChatEnabled) {
            return {} as OnyxTypes.Report;
        }
        return policyChats.length > 0 ? policyChats.at(0) : ({} as OnyxTypes.Report);
    }, [activePolicy, policyChats]);

    const selectOption = useCallback(
        (onSelected: () => void, shouldRestrictAction: boolean) => {
            if (shouldRestrictAction && quickActionReport?.policyID && shouldRestrictUserBillableActions(quickActionReport.policyID)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(quickActionReport.policyID));
                return;
            }
            onSelected();
        },
        [quickActionReport?.policyID],
    );

    const quickActionAvatars = useMemo(() => {
        if (isValidReport) {
            const avatars = getIcons(quickActionReport, formatPhoneNumber, personalDetails, null, undefined, undefined, undefined, undefined, isReportArchived);
            return avatars.length <= 1 || isPolicyExpenseChat(quickActionReport) ? avatars : avatars.filter((avatar) => avatar.id !== session?.accountID);
        }
        if (!isEmptyObject(policyChatForActivePolicy)) {
            return getIcons(policyChatForActivePolicy, formatPhoneNumber, personalDetails, null, undefined, undefined, undefined, undefined, isReportArchived);
        }
        return [];
        // Policy is needed as a dependency in order to update the shortcut details when the workspace changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [personalDetails, session?.accountID, quickActionReport, quickActionPolicy, policyChatForActivePolicy, isReportArchived, isValidReport]);

    const quickActionTitle = useMemo(() => {
        if (isEmptyObject(quickActionReport)) {
            return '';
        }
        if (quickAction?.action === CONST.QUICK_ACTIONS.SEND_MONEY && quickActionAvatars.length > 0) {
            const accountID = quickActionAvatars.at(0)?.id ?? CONST.DEFAULT_NUMBER_ID;
            const name = getDisplayNameForParticipant({accountID: Number(accountID), shouldUseShortForm: true, formatPhoneNumber}) ?? '';
            return translate('quickAction.paySomeone', name);
        }
        const titleKey = getQuickActionTitle(quickAction?.action ?? ('' as QuickActionName));
        return titleKey ? translate(titleKey) : '';
    }, [quickAction?.action, translate, quickActionAvatars, quickActionReport, formatPhoneNumber]);

    const hideQABSubtitle = useMemo(() => {
        if (!isValidReport) {
            return true;
        }
        if (quickActionAvatars.length === 0) {
            return false;
        }
        const displayName = personalDetails?.[quickActionAvatars.at(0)?.id ?? CONST.DEFAULT_NUMBER_ID]?.firstName ?? '';
        return quickAction?.action === CONST.QUICK_ACTIONS.SEND_MONEY && displayName.length === 0;
    }, [isValidReport, quickActionAvatars, personalDetails, quickAction?.action]);

    const quickActionSubtitle = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return !hideQABSubtitle ? (getReportName(quickActionReport, quickActionPolicy, undefined, personalDetails) ?? translate('quickAction.updateDestination')) : '';
        // Intentionally using property accessors (quickAction?.action, quickActionPolicy?.name) instead of the
        // full objects to prevent recomputation when unrelated properties on those objects change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hideQABSubtitle, personalDetails, quickAction?.action, quickActionPolicy?.name, quickActionReport, translate]);

    return useMemo(() => {
        const baseQuickAction = {
            label: translate('quickAction.header'),
            labelStyle: [styles.pt3, styles.pb2],
            isLabelHoverable: false,
            numberOfLinesDescription: 1,
            tooltipAnchorAlignment: {
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
            },
            shouldTeleportPortalToModalLayer: true,
        };

        if (quickAction?.action && quickActionReport) {
            if (!isQuickActionAllowed(quickAction, quickActionReport, quickActionPolicy, isReportArchived, allBetas, isRestrictedToPreferredPolicy)) {
                return [];
            }
            const onSelected = () => {
                interceptAnonymousUser(() => {
                    if (quickAction?.action === CONST.QUICK_ACTIONS.SEND_MONEY && isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }
                    const targetAccountPersonalDetails = {
                        ...personalDetails?.[quickAction.targetAccountID ?? CONST.DEFAULT_NUMBER_ID],
                        accountID: quickAction.targetAccountID ?? CONST.DEFAULT_NUMBER_ID,
                    };

                    navigateToQuickAction({
                        isValidReport,
                        quickAction,
                        selectOption,
                        lastDistanceExpenseType,
                        targetAccountPersonalDetails,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        isFromFloatingActionButton: true,
                    });
                });
            };
            return [
                {
                    ...baseQuickAction,
                    icon: getQuickActionIcon(icons as Parameters<typeof getQuickActionIcon>[0], quickAction?.action),
                    text: quickActionTitle,
                    rightIconAccountID: quickActionAvatars.at(0)?.id ?? CONST.DEFAULT_NUMBER_ID,
                    description: quickActionSubtitle,
                    onSelected,
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    rightIconReportID: quickActionReport?.reportID,
                    sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.QUICK_ACTION,
                },
            ];
        }
        if (!isEmptyObject(policyChatForActivePolicy)) {
            const onSelected = () => {
                interceptAnonymousUser(() => {
                    if (policyChatForActivePolicy?.policyID && shouldRestrictUserBillableActions(policyChatForActivePolicy.policyID)) {
                        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyChatForActivePolicy.policyID));
                        return;
                    }

                    const quickActionReportID = policyChatForActivePolicy?.reportID || reportID;
                    startMoneyRequest(CONST.IOU.TYPE.SUBMIT, quickActionReportID, CONST.IOU.REQUEST_TYPE.SCAN, true, undefined, allTransactionDrafts, true);
                });
            };

            return [
                {
                    ...baseQuickAction,
                    icon: icons.ReceiptScan,
                    text: translate('quickAction.scanReceipt'),
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    description: getReportName(policyChatForActivePolicy),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    onSelected,
                    rightIconReportID: policyChatForActivePolicy?.reportID,
                    sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.QUICK_ACTION,
                },
            ];
        }

        return [];
    }, [
        icons,
        translate,
        styles.pt3,
        styles.pb2,
        quickAction,
        policyChatForActivePolicy,
        quickActionReport,
        quickActionPolicy,
        isReportArchived,
        isRestrictedToPreferredPolicy,
        quickActionTitle,
        quickActionAvatars,
        quickActionSubtitle,
        shouldUseNarrowLayout,
        isDelegateAccessRestricted,
        isValidReport,
        selectOption,
        lastDistanceExpenseType,
        personalDetails,
        currentUserPersonalDetails.accountID,
        showDelegateNoAccessModal,
        reportID,
        allTransactionDrafts,
        allBetas,
    ]);
}

export default useQuickActionMenuItem;
