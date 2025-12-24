import {useRoute} from '@react-navigation/native';
import {addDays} from 'date-fns';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {Info} from '@components/Icon/Expensicons';
import Popover from '@components/Popover';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useCurrencyForExpensifyCard from '@hooks/useCurrencyForExpensifyCard';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import getClickedTargetLocation from '@libs/getClickedTargetLocation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import {queueExpensifyCardForBilling} from '@userActions/Card';
import {requestExpensifyCardLimitIncrease} from '@userActions/Policy/Policy';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST, {DATE_TIME_FORMAT_OPTIONS} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type WorkspaceCardsListLabelProps = {
    /** Label type */
    type: ValueOf<typeof CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE>;

    /** Label value */
    value: number;

    /** Additional style props */
    style?: StyleProp<ViewStyle>;
};

function WorkspaceCardsListLabel({type, value, style}: WorkspaceCardsListLabelProps) {
    const route = useRoute<PlatformStackRouteProp<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>>();
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const theme = useTheme();
    const {translate, preferredLocale} = useLocalize();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [isVisible, setVisible] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({top: 0, left: 0});
    const anchorRef = useRef(null);

    const defaultFundID = useDefaultFundID(policyID);

    const settlementCurrency = useCurrencyForExpensifyCard({policyID});
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`, {canBeMissing: true});
    const [cardManualBilling] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_MANUAL_BILLING}${defaultFundID}`, {canBeMissing: true});
    const paymentBankAccountID = cardSettings?.paymentBankAccountID;

    const isLessThanMediumScreen = isMediumScreenWidth || shouldUseNarrowLayout;

    const isConnectedWithPlaid = useMemo(() => {
        const bankAccountData = bankAccountList?.[paymentBankAccountID ?? CONST.DEFAULT_NUMBER_ID]?.accountData;

        // TODO: remove the extra check when plaidAccountID storing is aligned in https://github.com/Expensify/App/issues/47944
        // Right after adding a bank account plaidAccountID is stored inside the accountData and not in the additionalData
        return !!bankAccountData?.plaidAccountID || !!bankAccountData?.additionalData?.plaidAccountID;
    }, [bankAccountList, paymentBankAccountID]);

    useEffect(() => {
        if (!anchorRef.current || !isVisible) {
            return;
        }

        const position = getClickedTargetLocation(anchorRef.current);
        const BOTTOM_MARGIN_OFFSET = 3;

        setAnchorPosition({
            top: position.top + position.height + BOTTOM_MARGIN_OFFSET,
            left: position.left,
        });
    }, [isVisible, windowWidth]);

    const requestLimitIncrease = () => {
        requestExpensifyCardLimitIncrease(cardSettings?.paymentBankAccountID);
        setVisible(false);
        navigateToConciergeChat();
    };

    const isCurrentBalanceType = type === CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE;
    const isSettleBalanceButtonDisplayed = !!cardSettings?.isMonthlySettlementAllowed && !cardManualBilling && isCurrentBalanceType;
    const isSettleDateTextDisplayed = !!cardManualBilling && isCurrentBalanceType;

    const settlementDate = useMemo(() => {
        if (!isSettleDateTextDisplayed) {
            return '';
        }
        const formatter = Intl.DateTimeFormat(preferredLocale, DATE_TIME_FORMAT_OPTIONS[CONST.DATE.FNS_FORMAT_STRING]);
        return formatter.format(addDays(new Date(), 1));
    }, [isSettleDateTextDisplayed, preferredLocale]);

    const handleSettleBalanceButtonClick = () => {
        queueExpensifyCardForBilling(CONST.COUNTRY.US, defaultFundID);
    };

    return (
        <View style={styles.flex1}>
            <View style={styles.flex1}>
                <View
                    ref={anchorRef}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.mb1, style]}
                >
                    <Text style={[styles.mutedNormalTextLabel, styles.mr1]}>{translate(`workspace.expensifyCard.${type}`)}</Text>
                    <PressableWithFeedback
                        accessibilityLabel={translate(`workspace.expensifyCard.${type}`)}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        onPress={() => setVisible(true)}
                    >
                        <Icon
                            src={Info}
                            width={variables.iconSizeExtraSmall}
                            height={variables.iconSizeExtraSmall}
                            fill={theme.icon}
                        />
                    </PressableWithFeedback>
                </View>
                <View style={[styles.flexRow, styles.flexWrap]}>
                    <Text style={[styles.shortTermsHeadline, isSettleBalanceButtonDisplayed && [styles.mb2, styles.mr3]]}>{convertToDisplayString(value, settlementCurrency)}</Text>
                    {isSettleBalanceButtonDisplayed && (
                        <View style={[styles.mr2, isLessThanMediumScreen && styles.mb3]}>
                            <Button
                                onPress={handleSettleBalanceButtonClick}
                                text={translate('workspace.expensifyCard.settleBalance')}
                                innerStyles={[styles.buttonSmall]}
                                textStyles={[styles.buttonSmallText]}
                            />
                        </View>
                    )}
                </View>
            </View>
            {isSettleDateTextDisplayed && <Text style={[styles.mutedNormalTextLabel, styles.mt1]}>{translate('workspace.expensifyCard.balanceWillBeSettledOn', {settlementDate})}</Text>}
            <Popover
                onClose={() => setVisible(false)}
                isVisible={isVisible}
                outerStyle={!shouldUseNarrowLayout ? styles.pr5 : undefined}
                innerContainerStyle={!shouldUseNarrowLayout ? {maxWidth: variables.modalContentMaxWidth} : undefined}
                anchorRef={anchorRef}
                anchorPosition={anchorPosition}
            >
                <View style={styles.p4}>
                    <Text
                        numberOfLines={1}
                        style={[styles.optionDisplayName, styles.textStrong, styles.mb2]}
                    >
                        {translate(`workspace.expensifyCard.${type}`)}
                    </Text>
                    <Text style={[styles.textLabelSupporting, styles.lh16]}>{translate(`workspace.expensifyCard.${type}Description`)}</Text>

                    {!isConnectedWithPlaid && type === CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT && (
                        <View style={[styles.flexRow, styles.mt3]}>
                            <Button
                                onPress={requestLimitIncrease}
                                text={translate('workspace.expensifyCard.requestLimitIncrease')}
                                style={shouldUseNarrowLayout && styles.flex1}
                            />
                        </View>
                    )}
                </View>
            </Popover>
        </View>
    );
}

export default WorkspaceCardsListLabel;
