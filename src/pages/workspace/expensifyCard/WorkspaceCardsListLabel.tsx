import Button from '@components/ButtonComposed';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import WorkspaceCardLabel, {useWorkspaceCardLabelPopover} from '@components/WorkspaceCardLabel';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrencyForExpensifyCard from '@hooks/useCurrencyForExpensifyCard';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {getCardSettings} from '@libs/CardUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {isSupportedInviteOnboardingChoice, isSupportedPendingInviteOnboarding} from '@libs/OnboardingUtils';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';

import Navigation from '@navigation/Navigation';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import {queueExpensifyCardForBilling} from '@userActions/Card';
import {requestExpensifyCardLimitIncrease} from '@userActions/Policy/Policy';
import {navigateToConciergeChat, openReport} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {useRoute} from '@react-navigation/native';
import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import {addDays, format} from 'date-fns';
import React, {useMemo} from 'react';
import {View} from 'react-native';

type WorkspaceCardsListLabelProps = {
    /** Label type */
    type: ValueOf<typeof CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE>;

    /** Label value */
    value: number;

    /** Additional style props */
    style?: StyleProp<ViewStyle>;
};

type RequestLimitIncreaseButtonProps = {
    /** Localized button text */
    text: string;

    /** Optional style applied to the button */
    buttonStyle?: StyleProp<ViewStyle>;

    /** Invoked with a callback to close the popover when the button is pressed */
    onRequest: (closePopover: () => void) => void;
};

function RequestLimitIncreaseButton({text, buttonStyle, onRequest}: RequestLimitIncreaseButtonProps) {
    const styles = useThemeStyles();
    const {closePopover} = useWorkspaceCardLabelPopover();

    return (
        <View style={[styles.flexRow, styles.mt3]}>
            <Button
                onPress={() => onRequest(closePopover)}
                style={buttonStyle}
            >
                <Button.Text>{text}</Button.Text>
            </Button>
        </View>
    );
}

function WorkspaceCardsListLabel({type, value, style}: WorkspaceCardsListLabelProps) {
    const route = useRoute<PlatformStackRouteProp<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>>();
    const policyID = route.params.policyID;
    const {convertToDisplayString} = useCurrencyListActions();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [hasReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${conciergeReportID}`, {selector: Boolean});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const isSelfTourViewed = guidedSetupAndTourStatus?.isSelfTourViewed;
    const hasCompletedGuidedSetupFlow = guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow;
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    // Mirror ReportFetchHandler's onboarding-pending logic so we can detect when Concierge still has a pending guided
    // setup (welcome message + tasks) that OpenReport will create. See https://github.com/Expensify/App/issues/99396.
    const isOnboardingCompleted = hasCompletedGuidedSetupFlow ?? false;
    const isRegularOnboardingPending = !!introSelected && !introSelected.inviteType && isSupportedInviteOnboardingChoice(introSelected.choice) && !isOnboardingCompleted;
    const isPendingInviteOnboarding = isSupportedPendingInviteOnboarding(introSelected);
    const isGuidedSetupPending = isRegularOnboardingPending || isPendingInviteOnboarding;

    const defaultFundID = useDefaultFundID(policyID);

    const settlementCurrency = useCurrencyForExpensifyCard({policyID, fundID: defaultFundID});
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const settings = getCardSettings(cardSettings);
    const [cardManualBilling] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_MANUAL_BILLING}${defaultFundID}`);
    const paymentBankAccountID = settings?.paymentBankAccountID;

    const isLessThanMediumScreen = isMediumScreenWidth || shouldUseNarrowLayout;

    const isConnectedWithPlaid = useMemo(() => {
        const bankAccountData = bankAccountList?.[paymentBankAccountID ?? CONST.DEFAULT_NUMBER_ID]?.accountData;

        // TODO: remove the extra check when plaidAccountID storing is aligned in https://github.com/Expensify/App/issues/47944
        // Right after adding a bank account plaidAccountID is stored inside the accountData and not in the additionalData
        return !!bankAccountData?.plaidAccountID || !!bankAccountData?.additionalData?.plaidAccountID;
    }, [bankAccountList, paymentBankAccountID]);

    const requestLimitIncrease = (closePopover: () => void) => {
        closePopover();

        // The Concierge onboarding welcome message + tasks are created by OpenReport's guidedSetupData, and the request
        // queue is a blocking FIFO, so an OpenReport carrying that onboarding data must be enqueued BEFORE the limit-increase
        // write for Concierge's reply to be stamped last. getGuidedSetupData de-dupes, so ReportFetchHandler's later mount
        // OpenReport won't duplicate the onboarding. See https://github.com/Expensify/App/issues/99396.
        if (isGuidedSetupPending && !conciergeReportID) {
            // No Concierge chat exists yet: navigateToConciergeChat creates it and enqueues the onboarding OpenReport on
            // its create path. Wait for that promise so the limit-increase write lands after it in the queue.
            navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, false).then(() => {
                requestExpensifyCardLimitIncrease(settings?.paymentBankAccountID, defaultFundID);
            });
            return;
        }

        // Concierge chat already exists but onboarding is still pending. ReportFetchHandler's onboarding OpenReport only
        // fires on its mount effect, which runs after this handler, so we enqueue the same OpenReport ourselves first to win
        // the ordering. We mirror ReportFetchHandler's isLoadingApp guard because guided-setup tasks need loaded policies to
        // resolve their deep links (https://github.com/Expensify/App/issues/71742). When isLoadingApp is true we skip and let
        // ReportFetchHandler's deferred OpenReport run instead. Keep this guard as-is.
        if (isGuidedSetupPending && !isLoadingApp) {
            openReport({
                reportID: conciergeReportID,
                introSelected,
                conciergeChat,
                betas,
                hasReportActions,
                currentUserAccountID,
                isSelfTourViewed,
                hasCompletedGuidedSetupFlow,
            });
        }
        requestExpensifyCardLimitIncrease(settings?.paymentBankAccountID, defaultFundID);
        navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, false);
    };

    const isCurrentBalanceType = type === CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE;
    const settlementFrequency = settings?.monthlySettlementDate ? CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY : CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
    const isSettleBalanceButtonDisplayed = settlementFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY && !cardManualBilling && isCurrentBalanceType;
    const isSettleDateTextDisplayed = !!cardManualBilling && isCurrentBalanceType;

    const settlementDate = isSettleDateTextDisplayed ? format(addDays(new Date(), 1), CONST.DATE.FNS_FORMAT_STRING) : '';

    const handleSettleBalanceButtonClick = () => {
        showConfirmModal({
            title: translate('workspace.expensifyCard.settleBalanceConfirmationTitle'),
            prompt: translate('workspace.expensifyCard.settleBalanceConfirmationPrompt'),
            confirmText: translate('workspace.expensifyCard.settleBalance'),
            cancelText: translate('common.cancel'),
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            queueExpensifyCardForBilling(CONST.COUNTRY.US, defaultFundID);
        });
    };

    const handleViewTransactionsPress = () => {
        const fundIDForFeedKey = defaultFundID === CONST.DEFAULT_NUMBER_ID ? undefined : String(defaultFundID);
        const feedKey = fundIDForFeedKey ? `${fundIDForFeedKey}_${CONST.EXPENSIFY_CARD.BANK}` : CONST.EXPENSIFY_CARD.BANK;
        const query = buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            feed: [feedKey],
            withdrawalStatus: [CONST.SEARCH.SETTLEMENT_STATUS.NEVER, CONST.SEARCH.SETTLEMENT_STATUS.PENDING],
        });
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}));
    };

    const isLimitIncreaseDisplayed = !isConnectedWithPlaid && type === CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT;

    return (
        <WorkspaceCardLabel
            style={style}
            containerStyle={styles.flex1}
            title={translate(`workspace.expensifyCard.${type}`)}
            description={translate(`workspace.expensifyCard.${type}Description`)}
            displayValue={convertToDisplayString(value, settlementCurrency)}
            valueStyle={isSettleBalanceButtonDisplayed && [styles.mb2, styles.mr3]}
            valueAccessory={
                isSettleBalanceButtonDisplayed && (
                    <View style={[styles.mr2, isLessThanMediumScreen && styles.mb3]}>
                        <Button
                            onPress={handleSettleBalanceButtonClick}
                            innerStyles={[styles.buttonSmall]}
                        >
                            <Button.Text style={[styles.buttonSmallText]}>{translate('workspace.expensifyCard.settleBalance')}</Button.Text>
                        </Button>
                    </View>
                )
            }
            footer={
                <>
                    {isCurrentBalanceType && (
                        <TextLink
                            onPress={handleViewTransactionsPress}
                            style={styles.mt1}
                        >
                            {translate('workspace.common.viewTransactions')}
                        </TextLink>
                    )}
                    {isSettleDateTextDisplayed && (
                        <Text style={[styles.mutedNormalTextLabel, styles.mt1]}>{translate('workspace.expensifyCard.balanceWillBeSettledOn', settlementDate)}</Text>
                    )}
                </>
            }
        >
            {isLimitIncreaseDisplayed && (
                <RequestLimitIncreaseButton
                    text={translate('workspace.expensifyCard.requestLimitIncrease')}
                    buttonStyle={shouldUseNarrowLayout && styles.flex1}
                    onRequest={requestLimitIncrease}
                />
            )}
        </WorkspaceCardLabel>
    );
}

export default WorkspaceCardsListLabel;
