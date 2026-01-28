import {useIsFocused} from '@react-navigation/native';
import reportsSelector from '@selectors/Attributes';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    createDistanceRequest,
    getMoneyRequestParticipantsFromReport,
    setCustomUnitRateID,
    setMoneyRequestDistance,
    setMoneyRequestMerchant,
    setMoneyRequestOdometerReading,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestPendingFields,
    trackExpense,
    updateMoneyRequestDistance,
} from '@libs/actions/IOU';
import {setTransactionReport} from '@libs/actions/Transaction';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {navigateToParticipantPage, shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {getPolicyExpenseChat, isArchivedReport, isPolicyExpenseChat as isPolicyExpenseChatUtils} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicyUtil from '@libs/shouldUseDefaultExpensePolicy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';
import type Transaction from '@src/types/onyx/Transaction';
import DiscardChangesConfirmation from './DiscardChangesConfirmation';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDistanceOdometerProps = WithCurrentUserPersonalDetailsProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_ODOMETER | typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE> & {
        /** The transaction object being modified in Onyx */
        transaction: OnyxEntry<Transaction>;
    };

function IOURequestStepDistanceOdometer({
    report,
    route: {
        params: {action, iouType, reportID, transactionID, backToReport},
        name: routeName,
    },
    transaction,
    currentUserPersonalDetails,
}: IOURequestStepDistanceOdometerProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const isFocused = useIsFocused();

    const startReadingInputRef = useRef<BaseTextInputRef | null>(null);
    const endReadingInputRef = useRef<BaseTextInputRef | null>(null);

    const [startReading, setStartReading] = useState<string>('');
    const [endReading, setEndReading] = useState<string>('');
    const [formError, setFormError] = useState<string>('');
    // Key to force TextInput remount when resetting state after tab switch
    const [inputKey, setInputKey] = useState<number>(0);

    // Track initial values for DiscardChangesConfirmation
    const initialStartReadingRef = useRef<string>('');
    const initialEndReadingRef = useRef<string>('');
    const hasInitializedRefs = useRef(false);
    // Track previous transaction values to detect when transaction is cleared (e.g., tab switch)
    const prevTransactionStartRef = useRef<number | null | undefined>(undefined);
    const prevTransactionEndRef = useRef<number | null | undefined>(undefined);
    // Track local state via refs to avoid including them in useEffect dependencies
    const startReadingRef = useRef<string>('');
    const endReadingRef = useRef<string>('');

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});
    const isArchived = isArchivedReport(reportNameValuePairs);
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`, {canBeMissing: true});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {canBeMissing: true});
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {canBeMissing: true});
    const policy = usePolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`, {canBeMissing: true});
    const personalPolicy = usePersonalPolicy();
    const defaultExpensePolicy = useDefaultExpensePolicy();

    // isEditing: we're changing an already existing odometer expense; isEditingConfirmation: we navigated here by pressing 'Distance' field from the confirmation step during the creation of a new odometer expense to adjust the input before submitting
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingConfirmation = routeName !== SCREENS.MONEY_REQUEST.DISTANCE_CREATE && !isEditing;
    const isCreatingNewRequest = !isEditingConfirmation && !isEditing;
    const isTransactionDraft = shouldUseTransactionDraft(action, iouType);
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const [shouldEnableDiscardConfirmation, setShouldEnableDiscardConfirmation] = useState(!isEditingConfirmation && !isEditing);

    const shouldUseDefaultExpensePolicy = useMemo(() => shouldUseDefaultExpensePolicyUtil(iouType, defaultExpensePolicy), [iouType, defaultExpensePolicy]);

    const unit = DistanceRequestUtils.getRate({transaction, policy: shouldUseDefaultExpensePolicy ? defaultExpensePolicy : policy}).unit;

    const shouldSkipConfirmation: boolean = !skipConfirmation || !report?.reportID ? false : !(isArchived || isPolicyExpenseChatUtils(report));

    const confirmationRoute = ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportID, backToReport);

    useEffect(() => {
        setShouldEnableDiscardConfirmation(!isEditingConfirmation && !isEditing);
    }, [isEditing, isEditingConfirmation]);

    // Reset component state when transaction has no odometer data (happens when switching tabs)
    // In Phase 1, we don't persist data from transaction since users can't save and exit
    useEffect(() => {
        if (!isFocused) {
            return;
        }

        const currentStart = transaction?.comment?.odometerStart;
        const currentEnd = transaction?.comment?.odometerEnd;

        // Check if transaction was cleared (had values before, now null/undefined)
        // This happens when switching tabs, not during normal typing
        const wasCleared =
            (prevTransactionStartRef.current !== null && prevTransactionStartRef.current !== undefined && (currentStart === null || currentStart === undefined)) ||
            (prevTransactionEndRef.current !== null && prevTransactionEndRef.current !== undefined && (currentEnd === null || currentEnd === undefined));

        const hasTransactionData = (currentStart !== null && currentStart !== undefined) || (currentEnd !== null && currentEnd !== undefined);

        // Reset if transaction was cleared (had values before, now null)
        // This happens when switching tabs - transaction data is cleared but local state persists
        // Also reset if transaction is empty (component remounted after tab switch)
        // Don't reset in edit mode as we want to preserve user's changes
        const shouldReset =
            hasInitializedRefs.current &&
            !isEditing &&
            !isEditingConfirmation &&
            !hasTransactionData &&
            (wasCleared || (prevTransactionStartRef.current === undefined && prevTransactionEndRef.current === undefined));

        if (shouldReset) {
            setStartReading('');
            setEndReading('');
            startReadingRef.current = '';
            endReadingRef.current = '';
            initialStartReadingRef.current = '';
            initialEndReadingRef.current = '';
            setFormError('');
            // Force TextInput remount to reset label position
            setInputKey((prev) => prev + 1);
        }

        // Update refs to track previous values
        prevTransactionStartRef.current = currentStart;
        prevTransactionEndRef.current = currentEnd;
    }, [isFocused, isEditing, isEditingConfirmation, transaction?.comment?.odometerStart, transaction?.comment?.odometerEnd]);

    // Initialize initial values refs on mount for DiscardChangesConfirmation
    // These should never be updated after mount - they represent the "baseline" state
    useEffect(() => {
        if (hasInitializedRefs.current) {
            return;
        }
        const currentStart = transaction?.comment?.odometerStart;
        const currentEnd = transaction?.comment?.odometerEnd;
        const startValue = currentStart !== null && currentStart !== undefined ? currentStart.toString() : '';
        const endValue = currentEnd !== null && currentEnd !== undefined ? currentEnd.toString() : '';
        initialStartReadingRef.current = startValue;
        initialEndReadingRef.current = endValue;
        hasInitializedRefs.current = true;
    }, [transaction?.comment?.odometerStart, transaction?.comment?.odometerEnd]);

    // Initialize values from transaction when editing or when transaction has data (but not when switching tabs)
    // This updates the current state, but NOT the initial refs (those are set only once on mount)
    useEffect(() => {
        const currentStart = transaction?.comment?.odometerStart;
        const currentEnd = transaction?.comment?.odometerEnd;

        // Only initialize if:
        // 1. We haven't initialized yet AND transaction has data, OR
        // 2. We're editing and transaction has data (to load existing values), OR
        // 3. Transaction has data but local state is empty (user navigated back from another page)
        const hasTransactionData = (currentStart !== null && currentStart !== undefined) || (currentEnd !== null && currentEnd !== undefined);
        const hasLocalState = startReadingRef.current || endReadingRef.current;
        const shouldInitialize =
            (!hasInitializedRefs.current && hasTransactionData) ||
            (isEditing && hasTransactionData && !hasLocalState) ||
            (hasTransactionData && !hasLocalState && hasInitializedRefs.current);

        if (shouldInitialize) {
            const startValue = currentStart !== null && currentStart !== undefined ? currentStart.toString() : '';
            const endValue = currentEnd !== null && currentEnd !== undefined ? currentEnd.toString() : '';

            if (startValue || endValue) {
                setStartReading(startValue);
                setEndReading(endValue);
                startReadingRef.current = startValue;
                endReadingRef.current = endValue;
            }
        }
    }, [transaction?.comment?.odometerStart, transaction?.comment?.odometerEnd, isEditing]);

    // Calculate total distance - updated live after every input change
    const totalDistance = (() => {
        const start = parseFloat(startReading);
        const end = parseFloat(endReading);
        if (Number.isNaN(start) || Number.isNaN(end) || !startReading || !endReading) {
            return null;
        }
        const distance = end - start;
        // Show 0 if distance is negative
        return distance <= 0 ? 0 : distance;
    })();

    const buttonText = (() => {
        if (shouldSkipConfirmation) {
            return translate('iou.createExpense');
        }
        const shouldShowSave = isEditing || isEditingConfirmation;
        return shouldShowSave ? translate('common.save') : translate('common.next');
    })();

    const cleanOdometerReading = (text: string): string => {
        // Allow digits and one decimal point or comma
        // Remove all characters except digits, dots, and commas
        let cleaned = text.replaceAll(/[^0-9.,]/g, '');
        // Replace comma with dot for consistency
        cleaned = cleaned.replaceAll(',', '.');
        // Allow only one decimal point
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = `${parts.at(0) ?? ''}.${parts.slice(1).join('')}`;
        }
        // Don't allow decimal point at the start
        if (cleaned.startsWith('.')) {
            cleaned = `0${cleaned}`;
        }
        return cleaned;
    };

    const handleStartReadingChange = (text: string) => {
        const cleaned = cleanOdometerReading(text);
        setStartReading(cleaned);
        startReadingRef.current = cleaned;
        if (formError) {
            setFormError('');
        }
    };

    const handleEndReadingChange = (text: string) => {
        const cleaned = cleanOdometerReading(text);
        setEndReading(cleaned);
        endReadingRef.current = cleaned;
        if (formError) {
            setFormError('');
        }
    };

    // Navigate to confirmation page helper - following Manual tab pattern
    const navigateToConfirmationPage = () => {
        if (!transactionID || !reportID) {
            return;
        }
        switch (iouType) {
            case CONST.IOU.TYPE.REQUEST:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID, backToReport));
                break;
            default:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, backToReport));
        }
    };

    const navigateBack = () => {
        if (isEditingConfirmation) {
            Navigation.goBack(confirmationRoute);
            return;
        }
        Navigation.goBack();
    };

    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS, {canBeMissing: true});

    // Navigate to next page following Manual tab pattern
    const navigateToNextPage = () => {
        const start = parseFloat(startReading);
        const end = parseFloat(endReading);

        // Store odometer readings in transaction.comment.odometerStart/odometerEnd
        setMoneyRequestOdometerReading(transactionID, start, end, isTransactionDraft);

        // Calculate total distance (endReading - startReading)
        const distance = end - start;
        const calculatedDistance = roundToTwoDecimalPlaces(distance);

        // Store total distance in transaction.comment.customUnit.quantity
        setMoneyRequestDistance(transactionID, calculatedDistance, isTransactionDraft);

        if (isEditing) {
            // Update existing transaction
            const previousDistance = transaction?.comment?.customUnit?.quantity;
            const previousStart = transaction?.comment?.odometerStart;
            const previousEnd = transaction?.comment?.odometerEnd;
            const hasChanges = previousDistance !== calculatedDistance || previousStart !== start || previousEnd !== end;

            if (hasChanges) {
                // Update distance (which will also update amount and merchant)
                updateMoneyRequestDistance({
                    transactionID: transaction?.transactionID,
                    transactionThreadReport: report,
                    parentReport,
                    distance: calculatedDistance,
                    odometerStart: start,
                    odometerEnd: end,
                    // Not required for odometer distance request
                    transactionBackup: undefined,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    currentUserAccountIDParam,
                    currentUserEmailParam,
                    isASAPSubmitBetaEnabled: false,
                    parentReportNextStep,
                    recentWaypoints,
                });
            }
            Navigation.goBack();
            return;
        }

        if (isEditingConfirmation) {
            Navigation.goBack(confirmationRoute);
            return;
        }

        // If a reportID exists in the report object, use it to set participants and navigate to confirmation
        // Following Manual tab pattern
        if (report?.reportID && !isArchived && iouType !== CONST.IOU.TYPE.CREATE) {
            const selectedParticipants = getMoneyRequestParticipantsFromReport(report, currentUserPersonalDetails.accountID);
            const derivedReports = (reportAttributesDerived as ReportAttributesDerivedValue | undefined)?.reports;
            const participants = selectedParticipants.map((participant) => {
                const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
                return participantAccountID
                    ? getParticipantsOption(participant, personalDetails)
                    : getReportOption(participant, reportNameValuePairs?.private_isArchived, policy, currentUserPersonalDetails.accountID, personalDetails, derivedReports);
            });

            if (shouldSkipConfirmation) {
                setShouldEnableDiscardConfirmation(false);
                setMoneyRequestPendingFields(transactionID, {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
                setMoneyRequestMerchant(transactionID, translate('iou.fieldPending'), false);

                const participant = participants.at(0);
                const customUnitRateID = DistanceRequestUtils.getCustomUnitRateID({
                    reportID: report.reportID,
                    isPolicyExpenseChat: !!participant?.isPolicyExpenseChat,
                    policy,
                    lastSelectedDistanceRates,
                });

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
                            distance: calculatedDistance,
                            currency: transaction?.currency ?? 'USD',
                            created: transaction?.created ?? '',
                            merchant: translate('iou.fieldPending'),
                            receipt: {},
                            billable: false,
                            customUnitRateID,
                            attendees: transaction?.comment?.attendees,
                            odometerStart: start,
                            odometerEnd: end,
                        },
                        isASAPSubmitBetaEnabled: false,
                        currentUserAccountIDParam,
                        currentUserEmailParam,
                        introSelected,
                        activePolicyID,
                        quickAction,
                    });
                    return;
                }

                createDistanceRequest({
                    report,
                    participants,
                    currentUserLogin: currentUserEmailParam,
                    currentUserAccountID: currentUserAccountIDParam,
                    iouType,
                    existingTransaction: transaction,
                    transactionParams: {
                        amount: 0,
                        distance: calculatedDistance,
                        comment: '',
                        created: transaction?.created ?? '',
                        currency: transaction?.currency ?? 'USD',
                        merchant: translate('iou.fieldPending'),
                        billable: !!policy?.defaultBillable,
                        customUnitRateID,
                        splitShares: transaction?.splitShares,
                        attendees: transaction?.comment?.attendees,
                        odometerStart: start,
                        odometerEnd: end,
                    },
                    backToReport,
                    isASAPSubmitBetaEnabled: false,
                    transactionViolations,
                    quickAction,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                });
                return;
            }

            setMoneyRequestParticipantsFromReport(transactionID, report, currentUserPersonalDetails.accountID).then(() => {
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
            setMoneyRequestParticipantsFromReport(transactionID, activePolicyExpenseChat, currentUserPersonalDetails.accountID).then(() => {
                Navigation.navigate(
                    ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                        CONST.IOU.ACTION.CREATE,
                        iouType === CONST.IOU.TYPE.CREATE ? CONST.IOU.TYPE.SUBMIT : iouType,
                        transactionID,
                        activePolicyExpenseChat?.reportID,
                    ),
                );
            });
        } else if (transactionID && reportID) {
            navigateToParticipantPage(iouType, transactionID, reportID);
        }
    };

    // Handle form submission with validation
    const handleNext = () => {
        // Validation: Start and end readings must not be empty
        if (!startReading || !endReading) {
            setFormError(translate('iou.error.invalidReadings'));
            return;
        }

        const start = parseFloat(startReading);
        const end = parseFloat(endReading);

        if (Number.isNaN(start) || Number.isNaN(end)) {
            setFormError(translate('iou.error.invalidReadings'));
            return;
        }

        // Validation: Calculated distance (end - start) must be > 0
        const distance = end - start;
        if (distance <= 0) {
            setFormError(translate('iou.error.negativeDistanceNotAllowed'));
            return;
        }

        // When validation passes, call navigateToNextPage
        navigateToNextPage();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepDistanceOdometer.displayName}
            shouldShowNotFoundPage={false}
            shouldShowWrapper={!isCreatingNewRequest}
            includeSafeAreaPaddingBottom
        >
            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentBetween, styles.ph5, styles.pt5, styles.mb5]}>
                <View>
                    {/* Start Reading */}
                    <View style={[styles.mb6, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                        <View style={[styles.flex1]}>
                            <TextInput
                                key={`start-${inputKey}`}
                                ref={startReadingInputRef}
                                label={translate('distance.odometer.startReading')}
                                accessibilityLabel={translate('distance.odometer.startReading')}
                                value={startReading}
                                onChangeText={handleStartReadingChange}
                                keyboardType={CONST.KEYBOARD_TYPE.DECIMAL_PAD}
                                inputMode={CONST.INPUT_MODE.DECIMAL}
                            />
                        </View>
                    </View>
                    {/* End Reading */}
                    <View style={[styles.mb6, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                        <View style={[styles.flex1]}>
                            <TextInput
                                key={`end-${inputKey}`}
                                ref={endReadingInputRef}
                                label={translate('distance.odometer.endReading')}
                                accessibilityLabel={translate('distance.odometer.endReading')}
                                value={endReading}
                                onChangeText={handleEndReadingChange}
                                keyboardType={CONST.KEYBOARD_TYPE.DECIMAL_PAD}
                                inputMode={CONST.INPUT_MODE.DECIMAL}
                            />
                        </View>
                    </View>

                    {/* Total Distance Display - always shown, updated live */}
                    <View style={[styles.borderRadiusComponentNormal, {backgroundColor: theme.componentBG}]}>
                        <Text style={[styles.textSupporting]}>
                            {`${translate('distance.odometer.totalDistance')}: ${totalDistance !== null ? roundToTwoDecimalPlaces(totalDistance) : 0} ${unit}`}
                        </Text>
                    </View>
                </View>
                <View>
                    {/* Form Error Message */}
                    {!!formError && (
                        <FormHelpMessage
                            style={[styles.mb4]}
                            message={formError}
                        />
                    )}

                    {/* Next/Save Button */}
                    <Button
                        success
                        allowBubble={!isEditing}
                        pressOnEnter
                        medium={isExtraSmallScreenHeight}
                        large={!isExtraSmallScreenHeight}
                        style={[styles.w100]}
                        onPress={handleNext}
                        text={buttonText}
                        testID="next-save-button"
                    />
                </View>
            </View>
            <DiscardChangesConfirmation
                isEnabled={shouldEnableDiscardConfirmation}
                getHasUnsavedChanges={() => {
                    const hasReadingChanges = startReadingRef.current !== initialStartReadingRef.current || endReadingRef.current !== initialEndReadingRef.current;
                    return hasReadingChanges;
                }}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepDistanceOdometer.displayName = 'IOURequestStepDistanceOdometer';

const IOURequestStepDistanceOdometerWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceOdometer);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceOdometerWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceOdometerWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceOdometerWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceOdometerWithWritableReportOrNotFound);

export default IOURequestStepDistanceOdometerWithFullTransactionOrNotFound;
