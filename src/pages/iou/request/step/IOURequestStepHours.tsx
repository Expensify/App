import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import ScrollView from '@components/ScrollView';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultTimeTrackingRate} from '@libs/PolicyUtils';
import {computeTimeAmount, formatTimeMerchant} from '@libs/TimeTrackingUtils';
import variables from '@styles/variables';
import {
    setMoneyRequestAmount,
    setMoneyRequestMerchant,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestTimeCount,
    setMoneyRequestTimeRate,
    setMoneyRequestTimeType,
} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepHoursProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_HOURS | typeof SCREENS.MONEY_REQUEST.CREATE> & {
    /** The transaction object being modified in Onyx */
    transaction: OnyxEntry<Transaction>;

    /** Whether the user input should be kept or not */
    shouldKeepUserInput?: boolean;
};

function IOURequestStepTimeHours({
    report,
    route: {
        params: {iouType, reportID, transactionID = '-1', action, reportActionID},
    },
    transaction,
    shouldKeepUserInput = false,
}: IOURequestStepHoursProps) {
    const {translate} = useLocalize();
    const textInput = useRef<BaseTextInputRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const policyID = report?.policyID;
    const {accountID} = useCurrentUserPersonalDetails();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const rate = policy ? (getDefaultTimeTrackingRate(policy) ?? 0) : 0;
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => textInput.current?.focus(), CONST.ANIMATED_TRANSITION);
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    const saveTime = (count: number) => {
        setMoneyRequestAmount(transactionID, computeTimeAmount(rate, count), currency, shouldKeepUserInput);
        setMoneyRequestMerchant(transactionID, formatTimeMerchant(count, rate, currency, translate), shouldKeepUserInput);
        setMoneyRequestTimeType(transactionID, shouldKeepUserInput);
        setMoneyRequestTimeRate(transactionID, rate, shouldKeepUserInput);
        setMoneyRequestTimeCount(transactionID, count, shouldKeepUserInput);

        setMoneyRequestParticipantsFromReport(transactionID, report, accountID).then(() => {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
        });
    };

    const styles = useThemeStyles();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const canUseTouchScreen = canUseTouchScreenUtil();
    const moneyRequestTimeInputRef = useRef<NumberWithSymbolFormRef | null>(null);

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.time')}
            onBackButtonPress={() => Navigation.goBack()}
            testID={IOURequestStepTimeHours.displayName}
            shouldShowWrapper={false}
            includeSafeAreaPaddingBottom
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <NumberWithSymbolForm
                    symbol={translate('iou.hrs')}
                    symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX}
                    decimals={2}
                    autoGrowExtraSpace={variables.w80}
                    shouldShowBigNumberPad={canUseTouchScreen}
                    ref={textInput}
                    numberFormRef={moneyRequestTimeInputRef}
                    style={styles.iouAmountTextInput}
                    containerStyle={styles.iouAmountTextInputContainer}
                    touchableInputWrapperStyle={styles.heightUndefined}
                    testID="moneyRequestTimeFormInput"
                    footer={
                        <View style={styles.w100}>
                            <Button
                                success
                                pressOnEnter
                                medium={isExtraSmallScreenHeight}
                                large={!isExtraSmallScreenHeight}
                                style={[styles.w100, canUseTouchScreen ? styles.mt5 : styles.mt0]}
                                onPress={() => saveTime(parseFloat(moneyRequestTimeInputRef.current?.getNumber() ?? ''))}
                                text={translate('common.next')}
                            />
                        </View>
                    }
                />
            </ScrollView>
        </StepScreenWrapper>
    );
}

IOURequestStepTimeHours.displayName = 'IOURequestStepTimeHours';

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepHoursWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepTimeHours, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepHoursWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepHoursWithWritableReportOrNotFound);

export default IOURequestStepHoursWithFullTransactionOrNotFound;
