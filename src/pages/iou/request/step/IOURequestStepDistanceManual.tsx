/* eslint-disable @typescript-eslint/no-unused-vars */
import {useFocusEffect} from '@react-navigation/native';
import reportsSelector from '@selectors/Attributes';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {handleMoneyRequestStepDistanceNavigation, setMoneyRequestDistance, updateMoneyRequestDistance} from '@libs/actions/IOU';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {isArchivedReport, isPolicyExpenseChat as isPolicyExpenseChatUtils} from '@libs/ReportUtils';
import {getRateID} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDistanceManualProps = WithCurrentUserPersonalDetailsProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_MANUAL | typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE> & {
        /** The transaction object being modified in Onyx */
        transaction: OnyxEntry<Transaction>;
    };

function IOURequestStepDistanceManual({
    report,
    route: {
        params: {action, iouType, reportID, transactionID, backTo, backToReport},
    },
    transaction,
    currentUserPersonalDetails,
}: IOURequestStepDistanceManualProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const textInput = useRef<BaseTextInputRef | null>(null);
    const numberFormRef = useRef<NumberWithSymbolFormRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [formError, setFormError] = useState<string>('');

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});
    const [selectedTab, selectedTabResult] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.DISTANCE_REQUEST_TYPE}`, {canBeMissing: true});
    const isLoadingSelectedTab = isLoadingOnyxValue(selectedTabResult);
    const policy = usePolicy(report?.policyID);
    const personalPolicy = usePersonalPolicy();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`, {canBeMissing: true});
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {canBeMissing: true});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreatingNewRequest = !(backTo || isEditing);

    const isTransactionDraft = shouldUseTransactionDraft(action, iouType);

    const customUnitRateID = getRateID(transaction);
    const unit = DistanceRequestUtils.getRate({transaction, policy}).unit;
    const distance = transaction?.comment?.customUnit?.quantity ? roundToTwoDecimalPlaces(transaction.comment.customUnit.quantity) : undefined;

    useEffect(() => {
        if (numberFormRef.current && numberFormRef.current?.getNumber() === distance?.toString()) {
            return;
        }
        numberFormRef.current?.updateNumber(distance?.toString() ?? '');
    }, [distance]);

    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (!skipConfirmation || !report?.reportID) {
            return false;
        }

        return !(isArchivedReport(reportNameValuePairs) || isPolicyExpenseChatUtils(report));
    }, [report, skipConfirmation, reportNameValuePairs]);

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

    const navigateBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    const buttonText = useMemo(() => {
        if (shouldSkipConfirmation) {
            return translate('iou.createExpense');
        }

        return isCreatingNewRequest ? translate('common.next') : translate('common.save');
    }, [shouldSkipConfirmation, translate, isCreatingNewRequest]);

    const navigateToNextPage = useCallback(
        (amount: string) => {
            const distanceAsFloat = roundToTwoDecimalPlaces(parseFloat(amount));
            setMoneyRequestDistance(transactionID, distanceAsFloat, isTransactionDraft);

            if (action === CONST.IOU.ACTION.EDIT) {
                if (distance !== distanceAsFloat) {
                    updateMoneyRequestDistance({
                        transactionID: transaction?.transactionID,
                        transactionThreadReportID: reportID,
                        distance: distanceAsFloat,
                        // Not required for manual distance request
                        transactionBackup: undefined,
                        policy,
                    });
                }
                Navigation.goBack(backTo);
                return;
            }

            handleMoneyRequestStepDistanceNavigation({
                iouType,
                report,
                policy,
                transaction,
                reportID,
                transactionID,
                reportAttributesDerived,
                personalDetails,
                customUnitRateID,
                manualDistance: distanceAsFloat,
                currentUserLogin: currentUserPersonalDetails.login,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                backTo,
                backToReport,
                shouldSkipConfirmation,
                defaultExpensePolicy,
                isArchivedExpenseReport: isArchivedReport(reportNameValuePairs),
                isAutoReporting: !!personalPolicy?.autoReporting,
                lastSelectedDistanceRates,
            });
        },
        [
            transactionID,
            reportID,
            transaction,
            report,
            backTo,
            backToReport,
            iouType,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            reportNameValuePairs,
            isTransactionDraft,
            personalPolicy?.autoReporting,
            defaultExpensePolicy,
            shouldSkipConfirmation,
            personalDetails,
            reportAttributesDerived,
            policy,
            lastSelectedDistanceRates,
            customUnitRateID,
            action,
            distance,
        ],
    );

    const submitAndNavigateToNextPage = useCallback(() => {
        const value = numberFormRef.current?.getNumber() ?? '';
        if (!value.length || parseFloat(value) < 0.01) {
            setFormError(translate('iou.error.invalidDistance'));
            return;
        }

        navigateToNextPage(value);
    }, [navigateToNextPage, translate]);

    useEffect(() => {
        if (isLoadingSelectedTab) {
            return;
        }
        setFormError('');
    }, [selectedTab, isLoadingSelectedTab]);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepDistanceManual.displayName}
            shouldShowNotFoundPage={false}
            shouldShowWrapper={!isCreatingNewRequest}
            includeSafeAreaPaddingBottom
        >
            <NumberWithSymbolForm
                ref={textInput}
                numberFormRef={numberFormRef}
                value={distance?.toString()}
                onInputChange={() => {
                    if (!formError) {
                        return;
                    }
                    setFormError('');
                }}
                decimals={CONST.DISTANCE_DECIMAL_PLACES}
                symbol={unit}
                symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX}
                isSymbolPressable={false}
                symbolTextStyle={styles.textSupporting}
                style={styles.iouAmountTextInput}
                containerStyle={styles.iouAmountTextInputContainer}
                autoGrowExtraSpace={variables.w80}
                errorText={formError}
                footer={
                    <Button
                        success
                        // Prevent bubbling on edit amount Page to prevent double page submission when two CTA are stacked.
                        allowBubble={!isEditing}
                        pressOnEnter
                        medium={isExtraSmallScreenHeight}
                        large={!isExtraSmallScreenHeight}
                        style={[styles.w100, canUseTouchScreen() ? styles.mt5 : styles.mt0]}
                        onPress={submitAndNavigateToNextPage}
                        text={buttonText}
                        testID="next-button"
                    />
                }
            />
        </StepScreenWrapper>
    );
}

IOURequestStepDistanceManual.displayName = 'IOURequestStepDistanceManual';

const IOURequestStepDistanceManualWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceManual);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceManualWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceManualWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceManualWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceManualWithWritableReportOrNotFound);

export default IOURequestStepDistanceManualWithFullTransactionOrNotFound;
