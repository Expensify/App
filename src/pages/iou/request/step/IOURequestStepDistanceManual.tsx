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
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getMoneyRequestParticipantsFromReport, setMoneyRequestDistance, updateMoneyRequestDistance} from '@libs/actions/IOU';
import {handleMoneyRequestStepDistanceNavigation} from '@libs/actions/IOU/MoneyRequest';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {isArchivedReport, isPolicyExpenseChat as isPolicyExpenseChatUtils} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicyUtil from '@libs/shouldUseDefaultExpensePolicy';
import {getRateID} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import {isParticipantP2P} from './IOURequestStepAmount';
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
    const {isBetaEnabled} = usePermissions();

    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const textInput = useRef<BaseTextInputRef | null>(null);
    const numberFormRef = useRef<NumberWithSymbolFormRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [formError, setFormError] = useState<string>('');

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});
    const isArchived = isArchivedReport(reportNameValuePairs);
    const [selectedTab, selectedTabResult] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.DISTANCE_REQUEST_TYPE}`, {canBeMissing: true});
    const isLoadingSelectedTab = isLoadingOnyxValue(selectedTabResult);
    const policy = usePolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`, {canBeMissing: true});
    const personalPolicy = usePersonalPolicy();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`, {canBeMissing: true});
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {canBeMissing: true});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {canBeMissing: true});
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {canBeMissing: true});

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreatingNewRequest = !(backTo || isEditing);

    const isTransactionDraft = shouldUseTransactionDraft(action, iouType);
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';

    const shouldUseDefaultExpensePolicy = useMemo(() => shouldUseDefaultExpensePolicyUtil(iouType, defaultExpensePolicy), [iouType, defaultExpensePolicy]);

    const customUnitRateID = getRateID(transaction);
    const unit = DistanceRequestUtils.getRate({transaction, policy: shouldUseDefaultExpensePolicy ? defaultExpensePolicy : policy}).unit;
    const distance = typeof transaction?.comment?.customUnit?.quantity === 'number' ? roundToTwoDecimalPlaces(transaction.comment.customUnit.quantity) : undefined;
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    useEffect(() => {
        if (numberFormRef.current && numberFormRef.current?.getNumber() === distance?.toString()) {
            return;
        }
        numberFormRef.current?.updateNumber(distance?.toString() ?? '');
    }, [distance, selectedTab]);

    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (!skipConfirmation || !report?.reportID) {
            return false;
        }

        return !(isArchived || isPolicyExpenseChatUtils(report));
    }, [report, skipConfirmation, isArchived]);

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

    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS, {canBeMissing: true});

    const navigateToNextPage = useCallback(
        (amount: string) => {
            const distanceAsFloat = roundToTwoDecimalPlaces(parseFloat(amount));
            setMoneyRequestDistance(transactionID, distanceAsFloat, isTransactionDraft);

            if (action === CONST.IOU.ACTION.EDIT) {
                if (distance !== distanceAsFloat) {
                    updateMoneyRequestDistance({
                        transactionID: transaction?.transactionID,
                        transactionThreadReport: report,
                        parentReport,
                        distance: distanceAsFloat,
                        // Not required for manual distance request
                        transactionBackup: undefined,
                        policy,
                        policyTagList: policyTags,
                        policyCategories,
                        currentUserAccountIDParam,
                        currentUserEmailParam,
                        isASAPSubmitBetaEnabled,
                        parentReportNextStep,
                        recentWaypoints,
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
                currentUserLogin: currentUserEmailParam,
                currentUserAccountID: currentUserAccountIDParam,
                backTo,
                backToReport,
                shouldSkipConfirmation,
                defaultExpensePolicy,
                isArchivedExpenseReport: isArchived,
                isAutoReporting: !!personalPolicy?.autoReporting,
                isASAPSubmitBetaEnabled,
                transactionViolations,
                lastSelectedDistanceRates,
                translate,
                quickAction,
                policyRecentlyUsedCurrencies,
                introSelected,
                activePolicyID,
                privateIsArchived: reportNameValuePairs?.private_isArchived,
                policyTags,
            });
        },
        [
            transactionID,
            isTransactionDraft,
            action,
            iouType,
            report,
            policy,
            transaction,
            reportID,
            reportAttributesDerived,
            personalDetails,
            customUnitRateID,
            currentUserEmailParam,
            currentUserAccountIDParam,
            backTo,
            backToReport,
            shouldSkipConfirmation,
            defaultExpensePolicy,
            isArchived,
            personalPolicy?.autoReporting,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            lastSelectedDistanceRates,
            translate,
            quickAction,
            policyRecentlyUsedCurrencies,
            introSelected,
            activePolicyID,
            reportNameValuePairs?.private_isArchived,
            policyTags,
            distance,
            parentReport,
            policyCategories,
            parentReportNextStep,
            recentWaypoints,
        ],
    );

    const submitAndNavigateToNextPage = useCallback(() => {
        const value = numberFormRef.current?.getNumber() ?? '';
        const isP2P = isParticipantP2P(getMoneyRequestParticipantsFromReport(report, currentUserAccountIDParam).at(0));

        if (isBetaEnabled(CONST.BETAS.ZERO_EXPENSES)) {
            if (!value.length || parseFloat(value) < 0) {
                setFormError(translate('iou.error.invalidDistance'));
                return;
            }
        } else if (!value.length || parseFloat(value) <= 0) {
            setFormError(translate('iou.error.invalidDistance'));
            return;
        }

        if ((iouType === CONST.IOU.TYPE.REQUEST || iouType === CONST.IOU.TYPE.SUBMIT) && parseFloat(value) === 0 && isP2P) {
            setFormError(translate('iou.error.invalidDistance'));
            return;
        }

        navigateToNextPage(value);
    }, [navigateToNextPage, translate, report, iouType, currentUserAccountIDParam, isBetaEnabled]);

    useEffect(() => {
        if (isLoadingSelectedTab) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Clear form error when tab changes
        setFormError('');
    }, [selectedTab, isLoadingSelectedTab]);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={navigateBack}
            testID="IOURequestStepDistanceManual"
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
                touchableInputWrapperStyle={styles.heightUndefined}
                errorText={formError}
                accessibilityLabel={`${translate('common.distance')} (${translate(`common.${unit}`)})`}
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

const IOURequestStepDistanceManualWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceManual);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceManualWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceManualWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceManualWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceManualWithWritableReportOrNotFound);

export default IOURequestStepDistanceManualWithFullTransactionOrNotFound;
