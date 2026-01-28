import {useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import Button from '@components/Button';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultTimeTrackingRate} from '@libs/PolicyUtils';
import {computeTimeAmount, formatTimeMerchant} from '@libs/TimeTrackingUtils';
import variables from '@styles/variables';
import {setMoneyRequestAmount, setMoneyRequestMerchant, setMoneyRequestParticipantsFromReport, setMoneyRequestTimeCount, setMoneyRequestTimeRate} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepHoursProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE> & WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE>;

function IOURequestStepHours({
    report,
    route: {
        params: {iouType, reportID, transactionID = '-1', action, reportActionID},
    },
    transaction,
}: IOURequestStepHoursProps) {
    const policyID = report?.policyID;
    const isTransactionDraft = shouldUseTransactionDraft(action);
    const [selectedTab] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`, {canBeMissing: true});
    const {accountID} = useCurrentUserPersonalDetails();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const rate = policy ? getDefaultTimeTrackingRate(policy) : undefined;

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const canUseTouchScreen = canUseTouchScreenUtil();
    const textInputRef = useRef<BaseTextInputRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const moneyRequestTimeInputRef = useRef<NumberWithSymbolFormRef | null>(null);
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormError('');
        moneyRequestTimeInputRef.current?.updateNumber('');
    }, [selectedTab]);

    useFocusEffect(() => {
        focusTimeoutRef.current = setTimeout(() => textInputRef.current?.focus(), CONST.ANIMATED_TRANSITION);
        return () => {
            if (!focusTimeoutRef.current) {
                return;
            }
            clearTimeout(focusTimeoutRef.current);
        };
    });

    const saveTime = () => {
        if (rate === undefined) {
            return;
        }

        const count = parseFloat(moneyRequestTimeInputRef.current?.getNumber() ?? '');
        if (Number.isNaN(count) || count <= 0) {
            setFormError(translate('iou.error.quantityGreaterThanZero'));
            return;
        }

        setMoneyRequestAmount(transactionID, computeTimeAmount(rate, count), currency);
        setMoneyRequestMerchant(transactionID, formatTimeMerchant(count, rate, currency, translate), isTransactionDraft);
        setMoneyRequestTimeRate(transactionID, rate, isTransactionDraft);
        setMoneyRequestTimeCount(transactionID, count, isTransactionDraft);

        setMoneyRequestParticipantsFromReport(transactionID, report, accountID).then(() =>
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID)),
        );
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.time')}
            onBackButtonPress={Navigation.goBack}
            testID="IOURequestStepHours"
            shouldShowWrapper={false}
            includeSafeAreaPaddingBottom
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        >
            <NumberWithSymbolForm
                symbol={translate('iou.timeTracking.hrs')}
                symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX}
                isSymbolPressable={false}
                decimals={CONST.HOURS_DECIMAL_PLACES}
                autoGrowExtraSpace={variables.w80}
                shouldShowBigNumberPad={canUseTouchScreen}
                ref={textInputRef}
                numberFormRef={moneyRequestTimeInputRef}
                style={styles.iouAmountTextInput}
                containerStyle={styles.iouAmountTextInputContainer}
                errorText={formError}
                onInputChange={() => {
                    if (!formError) {
                        return;
                    }
                    setFormError('');
                }}
                footer={
                    <Button
                        success
                        pressOnEnter
                        medium={isExtraSmallScreenHeight}
                        large={!isExtraSmallScreenHeight}
                        style={[styles.w100, canUseTouchScreen ? styles.mt5 : styles.mt0]}
                        onPress={saveTime}
                        text={translate('common.next')}
                    />
                }
            />
        </StepScreenWrapper>
    );
}

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepHoursWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepHours);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepHoursWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepHoursWithWritableReportOrNotFound);

export default IOURequestStepHoursWithFullTransactionOrNotFound;
