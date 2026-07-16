import Button from '@components/Button';
import Text from '@components/Text';
import WorkspaceCardLabel, {useWorkspaceCardLabelPopover} from '@components/WorkspaceCardLabel';

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

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import {queueExpensifyCardForBilling} from '@userActions/Card';
import {requestExpensifyCardLimitIncrease} from '@userActions/Policy/Policy';
import {navigateToConciergeChat} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {useRoute} from '@react-navigation/native';
import {hasSeenTourSelector} from '@selectors/Onboarding';
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
                text={text}
                style={buttonStyle}
            />
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
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

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

    const isCurrentBalanceType = type === CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE;
    const settlementFrequency = settings?.monthlySettlementDate ? CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY : CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
    const isSettleBalanceButtonDisplayed = settlementFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY && !cardManualBilling && isCurrentBalanceType;
    const isSettleDateTextDisplayed = !!cardManualBilling && isCurrentBalanceType;

    const settlementDate = isSettleDateTextDisplayed ? format(addDays(new Date(), 1), CONST.DATE.FNS_FORMAT_STRING) : '';

    const handleSettleBalanceButtonClick = () => {
        queueExpensifyCardForBilling(CONST.COUNTRY.US, defaultFundID);
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
                            text={translate('workspace.expensifyCard.settleBalance')}
                            innerStyles={[styles.buttonSmall]}
                            textStyles={[styles.buttonSmallText]}
                        />
                    </View>
                )
            }
            footer={isSettleDateTextDisplayed && <Text style={[styles.mutedNormalTextLabel, styles.mt1]}>{translate('workspace.expensifyCard.balanceWillBeSettledOn', settlementDate)}</Text>}
        >
            {isLimitIncreaseDisplayed && (
                <RequestLimitIncreaseButton
                    text={translate('workspace.expensifyCard.requestLimitIncrease')}
                    buttonStyle={shouldUseNarrowLayout && styles.flex1}
                    onRequest={(closePopover) => {
                        requestExpensifyCardLimitIncrease(settings?.paymentBankAccountID);
                        closePopover();
                        navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, false);
                    }}
                />
            )}
        </WorkspaceCardLabel>
    );
}

export default WorkspaceCardsListLabel;
