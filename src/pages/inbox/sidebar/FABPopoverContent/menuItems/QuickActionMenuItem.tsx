import React, {useCallback} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
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
import FABMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABMenuItem';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {QuickActionName} from '@src/types/onyx/QuickAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import getEmptyArray from '@src/types/utils/getEmptyArray';

const sessionSelector = (session: OnyxEntry<OnyxTypes.Session>) => ({email: session?.email, accountID: session?.accountID});

type QuickActionMenuItemProps = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
    reportID: string;
};

function QuickActionMenuItem({shouldUseNarrowLayout, icons, reportID}: QuickActionMenuItemProps) {
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
    const [policyChats = getEmptyArray<OnyxTypes.Report>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: workspaceChatsSelector, canBeMissing: true});
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

    const policyChatForActivePolicy: OnyxTypes.Report =
        !isEmptyObject(activePolicy) && activePolicy?.isPolicyExpenseChatEnabled && policyChats.length > 0 ? (policyChats.at(0) ?? ({} as OnyxTypes.Report)) : ({} as OnyxTypes.Report);

    const quickActionReportPolicyID = quickActionReport?.policyID;
    const selectOption = useCallback(
        (onSelected: () => void, shouldRestrictAction: boolean) => {
            if (shouldRestrictAction && quickActionReportPolicyID && shouldRestrictUserBillableActions(quickActionReportPolicyID)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(quickActionReportPolicyID));
                return;
            }
            onSelected();
        },
        [quickActionReportPolicyID],
    );

    let quickActionAvatars: ReturnType<typeof getIcons> = [];
    if (isValidReport) {
        const avatars = getIcons(quickActionReport, formatPhoneNumber, personalDetails, null, undefined, undefined, undefined, undefined, isReportArchived);
        quickActionAvatars = avatars.length <= 1 || isPolicyExpenseChat(quickActionReport) ? avatars : avatars.filter((avatar) => avatar.id !== session?.accountID);
    } else if (!isEmptyObject(policyChatForActivePolicy)) {
        quickActionAvatars = getIcons(policyChatForActivePolicy, formatPhoneNumber, personalDetails, null, undefined, undefined, undefined, undefined, isReportArchived);
    }

    let quickActionTitle = '';
    if (!isEmptyObject(quickActionReport)) {
        if (quickAction?.action === CONST.QUICK_ACTIONS.SEND_MONEY && quickActionAvatars.length > 0) {
            const accountID = quickActionAvatars.at(0)?.id ?? CONST.DEFAULT_NUMBER_ID;
            const name = getDisplayNameForParticipant({accountID: Number(accountID), shouldUseShortForm: true, formatPhoneNumber}) ?? '';
            quickActionTitle = translate('quickAction.paySomeone', name);
        } else {
            const titleKey = getQuickActionTitle(quickAction?.action ?? ('' as QuickActionName));
            quickActionTitle = titleKey ? translate(titleKey) : '';
        }
    }

    let hideQABSubtitle = true;
    if (isValidReport) {
        if (quickActionAvatars.length === 0) {
            hideQABSubtitle = false;
        } else {
            const displayName = personalDetails?.[quickActionAvatars.at(0)?.id ?? CONST.DEFAULT_NUMBER_ID]?.firstName ?? '';
            hideQABSubtitle = quickAction?.action === CONST.QUICK_ACTIONS.SEND_MONEY && displayName.length === 0;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const quickActionSubtitle = !hideQABSubtitle ? (getReportName(quickActionReport, quickActionPolicy, undefined, personalDetails) ?? translate('quickAction.updateDestination')) : '';

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
            return null;
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
        return (
            <FABMenuItem
                registryId={CONST.SENTRY_LABEL.FAB_MENU.QUICK_ACTION}
                label={baseQuickAction.label}
                labelStyle={baseQuickAction.labelStyle}
                isLabelHoverable={baseQuickAction.isLabelHoverable}
                numberOfLinesDescription={baseQuickAction.numberOfLinesDescription}
                tooltipAnchorAlignment={baseQuickAction.tooltipAnchorAlignment}
                shouldTeleportPortalToModalLayer={baseQuickAction.shouldTeleportPortalToModalLayer}
                icon={getQuickActionIcon(icons as Parameters<typeof getQuickActionIcon>[0], quickAction?.action)}
                text={quickActionTitle}
                rightIconAccountID={quickActionAvatars.at(0)?.id ?? CONST.DEFAULT_NUMBER_ID}
                description={quickActionSubtitle}
                onSelected={onSelected}
                shouldCallAfterModalHide={shouldUseNarrowLayout}
                rightIconReportID={quickActionReport?.reportID}
                sentryLabel={CONST.SENTRY_LABEL.FAB_MENU.QUICK_ACTION}
            />
        );
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

        return (
            <FABMenuItem
                registryId={CONST.SENTRY_LABEL.FAB_MENU.QUICK_ACTION}
                label={baseQuickAction.label}
                labelStyle={baseQuickAction.labelStyle}
                isLabelHoverable={baseQuickAction.isLabelHoverable}
                numberOfLinesDescription={baseQuickAction.numberOfLinesDescription}
                tooltipAnchorAlignment={baseQuickAction.tooltipAnchorAlignment}
                shouldTeleportPortalToModalLayer={baseQuickAction.shouldTeleportPortalToModalLayer}
                icon={icons.ReceiptScan}
                text={translate('quickAction.scanReceipt')}
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                description={getReportName(policyChatForActivePolicy)}
                shouldCallAfterModalHide={shouldUseNarrowLayout}
                onSelected={onSelected}
                rightIconReportID={policyChatForActivePolicy?.reportID}
                sentryLabel={CONST.SENTRY_LABEL.FAB_MENU.QUICK_ACTION}
            />
        );
    }

    return null;
}

export default QuickActionMenuItem;
