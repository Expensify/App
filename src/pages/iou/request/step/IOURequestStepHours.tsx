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
import {setTransactionReport} from '@libs/actions/Transaction';
import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {getDefaultTimeTrackingRate} from '@libs/PolicyUtils';
import {getPolicyExpenseChat} from '@libs/ReportUtils';
import {computeTimeAmount, formatTimeMerchant} from '@libs/TimeTrackingUtils';
import variables from '@styles/variables';
import {setMoneyRequestAmount, setMoneyRequestMerchant, setMoneyRequestParticipantsFromReport, setMoneyRequestTimeCount, setMoneyRequestTimeRate} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepHoursProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE | typeof SCREENS.MONEY_REQUEST.STEP_HOURS> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE | typeof SCREENS.MONEY_REQUEST.STEP_HOURS> & {
        explicitPolicyID?: string;
    };

function IOURequestStepHours({report, route: {params, name: routeName}, transaction, explicitPolicyID}: IOURequestStepHoursProps) {
    const {iouType, reportID, transactionID = '-1', action, reportActionID} = params;
    const isEditingConfirmation = (params as MoneyRequestNavigatorParamList[typeof SCREENS.MONEY_REQUEST.STEP_HOURS])?.origin === CONST.IOU.HOURS_STEP_ORIGIN.CONFIRM;
    const isEmbeddedInStartPage = routeName === SCREENS.MONEY_REQUEST.CREATE;
    const policyID = explicitPolicyID ?? report?.policyID;
    const isTransactionDraft = shouldUseTransactionDraft(action);
    const [selectedTab] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`, {canBeMissing: true});
    const {accountID} = useCurrentUserPersonalDetails();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const defaultPolicyRate = policy ? getDefaultTimeTrackingRate(policy) : undefined;
    const rate = transaction?.comment?.units?.rate ?? defaultPolicyRate;

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
        moneyRequestTimeInputRef.current?.updateNumber(`${transaction?.comment?.units?.count ?? ''}`);
    }, [selectedTab, transaction?.comment?.units?.count]);

    useFocusEffect(() => {
        focusTimeoutRef.current = setTimeout(() => textInputRef.current?.focus(), CONST.ANIMATED_TRANSITION);
        return () => {
            if (!focusTimeoutRef.current) {
                return;
            }
            clearTimeout(focusTimeoutRef.current);
        };
    });

    const navigateBack = () => Navigation.goBack(isEditingConfirmation ? ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportID) : undefined);

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
        setMoneyRequestTimeCount(transactionID, count, isTransactionDraft);

        if (isEditingConfirmation) {
            navigateBack();
            return;
        }

        setMoneyRequestTimeRate(transactionID, rate, isTransactionDraft);

        if (isEmbeddedInStartPage) {
            if (explicitPolicyID) {
                const policyExpenseChat = getPolicyExpenseChat(accountID, policyID);
                if (!policyExpenseChat) {
                    console.error(`Couldn't find policy expense chat for policyID: ${policyID}`);
                    return;
                }

                setTransactionReport(transactionID, {reportID: policyExpenseChat.reportID}, isTransactionDraft);
                setMoneyRequestParticipantsFromReport(transactionID, policyExpenseChat, accountID);

                return Navigation.setNavigationActionToMicrotaskQueue(() =>
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, policyExpenseChat.reportID)),
                );
            }
            setMoneyRequestParticipantsFromReport(transactionID, report, accountID);
        }

        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
    };

    return (
        <StepScreenWrapper
            headerTitle={translate(isEditingConfirmation ? 'iou.timeTracking.hours' : 'iou.createExpense')}
            onBackButtonPress={navigateBack}
            testID="IOURequestStepHours"
            shouldShowWrapper={!isEmbeddedInStartPage}
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
                touchableInputWrapperStyle={styles.heightUndefined}
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
                        text={translate(isEditingConfirmation ? 'common.save' : 'common.next')}
                    />
                }
            />
        </StepScreenWrapper>
    );
}

export default withFullTransactionOrNotFound(withWritableReportOrNotFound(IOURequestStepHours));
