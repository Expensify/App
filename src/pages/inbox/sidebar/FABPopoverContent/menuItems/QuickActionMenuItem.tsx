import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {startMoneyRequest} from '@libs/actions/IOU';
import {navigateToQuickAction} from '@libs/actions/QuickActionNavigation';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {getQuickActionIcon, getQuickActionTitle, isQuickActionAllowed} from '@libs/QuickActionUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {getDisplayNameForParticipant, getIcons, getWorkspaceChats, isPolicyExpenseChat} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {sessionEmailAndAccountIDSelector} from '@src/selectors/Session';
import type * as OnyxTypes from '@src/types/onyx';
import type {QuickActionName} from '@src/types/onyx/QuickAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import getEmptyArray from '@src/types/utils/getEmptyArray';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.QUICK_ACTION;

type QuickActionMenuItemProps = {
    reportID: string;
};

function QuickActionMenuItem({reportID}: QuickActionMenuItemProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate, formatPhoneNumber} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['CalendarSolid', 'ReceiptScan', 'Car', 'Task', 'Clock', 'MoneyCircle', 'Coins', 'Receipt', 'Cash', 'Transfer'] as const);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: sessionEmailAndAccountIDSelector});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT);
    const workspaceChatsSelector = (reports: OnyxCollection<OnyxTypes.Report>) => getWorkspaceChats(activePolicyID, [session?.accountID ?? CONST.DEFAULT_NUMBER_ID], reports);
    const [policyChats = getEmptyArray<OnyxTypes.Report>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: workspaceChatsSelector});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [quickActionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${quickAction?.chatReportID}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const isReportArchived = useReportIsArchived(quickActionReport?.reportID);
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();
    const quickActionPolicyID = quickAction?.action === CONST.QUICK_ACTIONS.TRACK_PER_DIEM && quickAction?.perDiemPolicyID ? quickAction?.perDiemPolicyID : quickActionReport?.policyID;
    const [quickActionPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${quickActionPolicyID}`);
    const reportAttributesSelector = (attributes: OnyxEntry<OnyxTypes.ReportAttributesDerivedValue>) => attributes?.reports;
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: reportAttributesSelector});

    const isValidReport = !(isEmptyObject(quickActionReport) || isReportArchived);

    const policyChatForActivePolicy: OnyxTypes.Report =
        !isEmptyObject(activePolicy) && activePolicy?.isPolicyExpenseChatEnabled && policyChats.length > 0 ? (policyChats.at(0) ?? ({} as OnyxTypes.Report)) : ({} as OnyxTypes.Report);

    const isVisible =
        (quickAction?.action && quickActionReport
            ? isQuickActionAllowed(quickAction, quickActionReport, quickActionPolicy, isReportArchived, allBetas, isRestrictedToPreferredPolicy)
            : false) ||
        (!quickAction?.action && !isEmptyObject(policyChatForActivePolicy));

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

    const quickActionSubtitle = !hideQABSubtitle ? getReportName(quickActionReport, reportAttributes) || translate('quickAction.updateDestination') : '';

    const quickActionReportPolicyID = quickActionReport?.policyID;
    const selectOption = (onSelected: () => void, shouldRestrictAction: boolean) => {
        if (shouldRestrictAction && quickActionReportPolicyID && shouldRestrictUserBillableActions(quickActionReportPolicyID)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(quickActionReportPolicyID));
            return;
        }
        onSelected();
    };

    if (quickAction?.action && quickActionReport) {
        return (
            <FABFocusableMenuItem
                itemId={ITEM_ID}
                isVisible={isVisible}
                pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.QUICK_ACTION}
                label={translate('quickAction.header')}
                labelStyle={[styles.pt3, styles.pb2]}
                isLabelHoverable={false}
                numberOfLinesDescription={1}
                tooltipAnchorAlignment={{
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                }}
                shouldTeleportPortalToModalLayer
                icon={getQuickActionIcon(icons, quickAction?.action)}
                title={quickActionTitle}
                rightIconAccountID={quickActionAvatars.at(0)?.id ?? CONST.DEFAULT_NUMBER_ID}
                description={quickActionSubtitle}
                rightIconReportID={quickActionReport?.reportID}
                onPress={() =>
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
                    })
                }
                shouldCallAfterModalHide={shouldUseNarrowLayout}
            />
        );
    }

    return (
        <FABFocusableMenuItem
            itemId={ITEM_ID}
            isVisible={isVisible}
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.QUICK_ACTION}
            label={translate('quickAction.header')}
            labelStyle={[styles.pt3, styles.pb2]}
            isLabelHoverable={false}
            numberOfLinesDescription={1}
            tooltipAnchorAlignment={{
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
            }}
            shouldTeleportPortalToModalLayer
            icon={icons.ReceiptScan}
            title={translate('quickAction.scanReceipt')}
            description={getReportName(policyChatForActivePolicy, reportAttributes)}
            rightIconReportID={policyChatForActivePolicy?.reportID}
            onPress={() =>
                interceptAnonymousUser(() => {
                    if (policyChatForActivePolicy?.policyID && shouldRestrictUserBillableActions(policyChatForActivePolicy.policyID)) {
                        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyChatForActivePolicy.policyID));
                        return;
                    }

                    const quickActionReportID = policyChatForActivePolicy?.reportID || reportID;
                    startMoneyRequest(CONST.IOU.TYPE.SUBMIT, quickActionReportID, CONST.IOU.REQUEST_TYPE.SCAN, true, undefined, allTransactionDrafts, true);
                })
            }
            shouldCallAfterModalHide={shouldUseNarrowLayout}
        />
    );
}

export default QuickActionMenuItem;
