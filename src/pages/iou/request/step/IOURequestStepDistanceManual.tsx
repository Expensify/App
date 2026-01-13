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
import {
    createDistanceRequest,
    getMoneyRequestParticipantsFromReport,
    setCustomUnitRateID,
    setMoneyRequestDistance,
    setMoneyRequestMerchant,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestPendingFields,
    trackExpense,
    updateMoneyRequestDistance,
} from '@libs/actions/IOU';
import {setTransactionReport} from '@libs/actions/Transaction';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {navigateToParticipantPage, shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {getPolicyExpenseChat, isArchivedReport, isPolicyExpenseChat as isPolicyExpenseChatUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {getRateID} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
    const {isBetaEnabled} = usePermissions();

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
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {canBeMissing: true});

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreatingNewRequest = !(backTo || isEditing);

    const isTransactionDraft = shouldUseTransactionDraft(action, iouType);
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';

    const shouldUseDefaultExpensePolicy = useMemo(
        () =>
            iouType === CONST.IOU.TYPE.CREATE &&
            isPaidGroupPolicy(defaultExpensePolicy) &&
            defaultExpensePolicy?.isPolicyExpenseChatEnabled &&
            !shouldRestrictUserBillableActions(defaultExpensePolicy.id),
        [iouType, defaultExpensePolicy],
    );

    const customUnitRateID = getRateID(transaction);
    const unit = DistanceRequestUtils.getRate({transaction, policy: shouldUseDefaultExpensePolicy ? defaultExpensePolicy : policy}).unit;
    const distance = transaction?.comment?.customUnit?.quantity ? roundToTwoDecimalPlaces(transaction.comment.customUnit.quantity) : undefined;
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

    const navigateToConfirmationPage = useCallback(() => {
        switch (iouType) {
            case CONST.IOU.TYPE.REQUEST:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID, backToReport));
                break;
            default:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, backToReport));
        }
    }, [iouType, transactionID, reportID, backToReport]);

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
                        currentUserAccountIDParam,
                        currentUserEmailParam,
                        isASAPSubmitBetaEnabled,
                    });
                }
                Navigation.goBack(backTo);
                return;
            }

            if (backTo) {
                Navigation.goBack(backTo);
                return;
            }

            if (report?.reportID && !isArchivedReport(reportNameValuePairs) && iouType !== CONST.IOU.TYPE.CREATE) {
                const selectedParticipants = getMoneyRequestParticipantsFromReport(report, currentUserAccountIDParam);
                const participants = selectedParticipants.map((participant) => {
                    const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
                    return participantAccountID ? getParticipantsOption(participant, personalDetails) : getReportOption(participant, reportAttributesDerived);
                });
                if (shouldSkipConfirmation) {
                    setMoneyRequestPendingFields(transactionID, {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
                    setMoneyRequestMerchant(transactionID, translate('iou.fieldPending'), false);
                    const participant = participants.at(0);
                    if (iouType === CONST.IOU.TYPE.TRACK && participant) {
                        trackExpense({
                            report,
                            isDraftPolicy: false,
                            participantParams: {
                                payeeEmail: currentUserEmailParam,
                                payeeAccountID: currentUserAccountIDParam,
                                participant,
                            },
                            policyParams: {
                                policy,
                            },
                            transactionParams: {
                                amount: 0,
                                distance: distanceAsFloat,
                                currency: transaction?.currency ?? 'USD',
                                created: transaction?.created ?? '',
                                merchant: translate('iou.fieldPending'),
                                receipt: {},
                                billable: false,
                                customUnitRateID,
                                attendees: transaction?.comment?.attendees,
                            },
                            isASAPSubmitBetaEnabled,
                            currentUserAccountIDParam,
                            currentUserEmailParam,
                            introSelected,
                            activePolicyID,
                            quickAction,
                        });
                        return;
                    }

                    const isPolicyExpenseChat = !!participant?.isPolicyExpenseChat;

                    createDistanceRequest({
                        report,
                        participants,
                        currentUserLogin: currentUserEmailParam,
                        currentUserAccountID: currentUserAccountIDParam,
                        iouType,
                        existingTransaction: transaction,
                        transactionParams: {
                            amount: 0,
                            distance: distanceAsFloat,
                            comment: '',
                            created: transaction?.created ?? '',
                            currency: transaction?.currency ?? 'USD',
                            merchant: translate('iou.fieldPending'),
                            billable: !!policy?.defaultBillable,
                            customUnitRateID: DistanceRequestUtils.getCustomUnitRateID({reportID: report.reportID, isPolicyExpenseChat, policy, lastSelectedDistanceRates}),
                            splitShares: transaction?.splitShares,
                            attendees: transaction?.comment?.attendees,
                        },
                        backToReport,
                        isASAPSubmitBetaEnabled,
                        transactionViolations,
                        quickAction,
                        policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                    });
                    return;
                }
                setMoneyRequestParticipantsFromReport(transactionID, report, currentUserAccountIDParam).then(() => {
                    navigateToConfirmationPage();
                });
                return;
            }

            // If there was no reportID, then that means the user started this flow from the global menu
            // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
            if (shouldUseDefaultExpensePolicy) {
                const activePolicyExpenseChat = getPolicyExpenseChat(currentUserAccountIDParam, defaultExpensePolicy?.id);
                const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || !!personalPolicy?.autoReporting;
                const transactionReportID = shouldAutoReport ? activePolicyExpenseChat?.reportID : CONST.REPORT.UNREPORTED_REPORT_ID;
                const rateID = DistanceRequestUtils.getCustomUnitRateID({
                    reportID: transactionReportID,
                    isPolicyExpenseChat: true,
                    policy: defaultExpensePolicy,
                    lastSelectedDistanceRates,
                });
                setTransactionReport(transactionID, {reportID: transactionReportID}, true);
                setCustomUnitRateID(transactionID, rateID);
                setMoneyRequestParticipantsFromReport(transactionID, activePolicyExpenseChat, currentUserAccountIDParam).then(() => {
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                            CONST.IOU.ACTION.CREATE,
                            iouType === CONST.IOU.TYPE.CREATE ? CONST.IOU.TYPE.SUBMIT : iouType,
                            transactionID,
                            activePolicyExpenseChat?.reportID,
                        ),
                    );
                });
            } else {
                navigateToParticipantPage(iouType, transactionID, reportID);
            }
        },
        [
            transactionID,
            isTransactionDraft,
            action,
            backTo,
            report,
            reportNameValuePairs,
            iouType,
            shouldUseDefaultExpensePolicy,
            distance,
            transaction,
            parentReport,
            policy,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            shouldSkipConfirmation,
            personalDetails,
            reportAttributesDerived,
            translate,
            lastSelectedDistanceRates,
            backToReport,
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
            customUnitRateID,
            introSelected,
            activePolicyID,
            navigateToConfirmationPage,
            defaultExpensePolicy,
            personalPolicy?.autoReporting,
            reportID,
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

const IOURequestStepDistanceManualWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceManual);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceManualWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceManualWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceManualWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceManualWithWritableReportOrNotFound);

export default IOURequestStepDistanceManualWithFullTransactionOrNotFound;
