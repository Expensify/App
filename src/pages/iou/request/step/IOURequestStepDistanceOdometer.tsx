import lodashIsEmpty from 'lodash/isEmpty';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ReceiptImage from '@components/ReceiptImage';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useDiscardChangesConfirmation from '@hooks/useDiscardChangesConfirmation';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMoneyRequestDistance, setMoneyRequestOdometerReading} from '@libs/actions/IOU';
import {handleMoneyRequestStepDistanceNavigation} from '@libs/actions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestDistance} from '@libs/actions/IOU/UpdateMoneyRequest';
import {createBackupTransaction, removeBackupTransactionWithImageCleanup, restoreOriginalTransactionFromBackupWithImageCleanup} from '@libs/actions/TransactionEdit';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {isPolicyExpenseChat as isPolicyExpenseChatUtils} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicyUtil from '@libs/shouldUseDefaultExpensePolicy';
import {startSpan} from '@libs/telemetry/activeSpans';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {OdometerImageType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
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
    const {translate, fromLocaleDigit, numberFormat} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['GalleryPlus']);

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
    // Track local state via refs to avoid including them in useEffect dependencies
    const startReadingRef = useRef<string>('');
    const endReadingRef = useRef<string>('');
    const initialStartImageRef = useRef<FileObject | string | undefined>(undefined);
    const initialEndImageRef = useRef<FileObject | string | undefined>(undefined);
    const prevSelectedTabRef = useRef<string | undefined>(undefined);
    const transactionWasSaved = useRef(false);
    const backupHandledManually = useRef(false);

    const isArchived = useReportIsArchived(report?.reportID);
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const reportAttributesDerived = useReportAttributes();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const policy = usePolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);
    const personalPolicy = usePersonalPolicy();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const selfDMReport = useSelfDMReport();
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [selectedTab, selectedTabResult] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.DISTANCE_REQUEST_TYPE}`);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isLoadingSelectedTab = isLoadingOnyxValue(selectedTabResult);

    // isEditing: we're changing an already existing odometer expense; isEditingConfirmation: we navigated here by pressing 'Distance' field from the confirmation step during the creation of a new odometer expense to adjust the input before submitting
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplit = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) && isEditing;
    const currentTransaction = isEditingSplit && !lodashIsEmpty(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const isEditingConfirmation = routeName !== SCREENS.MONEY_REQUEST.DISTANCE_CREATE && !isEditing;
    const isCreatingNewRequest = !isEditingConfirmation && !isEditing;
    const isTransactionDraft = shouldUseTransactionDraft(action, iouType);
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const [shouldEnableDiscardConfirmation, setShouldEnableDiscardConfirmation] = useState(!isEditingConfirmation && !isEditing);

    const shouldUseDefaultExpensePolicy = useMemo(
        () => shouldUseDefaultExpensePolicyUtil(iouType, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd),
        [iouType, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd],
    );

    const mileageRate = DistanceRequestUtils.getRate({transaction: currentTransaction, policy: shouldUseDefaultExpensePolicy ? defaultExpensePolicy : policy});
    const unit = mileageRate.unit;
    const rate = mileageRate.rate ?? 0;

    const shouldSkipConfirmation: boolean = !skipConfirmation || !report?.reportID ? false : !(isArchived || isPolicyExpenseChatUtils(report));

    const confirmationRoute = ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportID, backToReport);

    useEffect(() => {
        setShouldEnableDiscardConfirmation(!isEditingConfirmation && !isEditing);
    }, [isEditing, isEditingConfirmation]);

    // Get odometer images from transaction (only for display, not for initialization)
    const odometerStartImage = transaction?.comment?.odometerStartImage;
    const odometerEndImage = transaction?.comment?.odometerEndImage;

    // Reset component state when switching away from the odometer tab
    useEffect(() => {
        if (isLoadingSelectedTab) {
            return;
        }

        const prevSelectedTab = prevSelectedTabRef.current;
        if (prevSelectedTab === CONST.TAB_REQUEST.DISTANCE_ODOMETER && selectedTab !== CONST.TAB_REQUEST.DISTANCE_ODOMETER) {
            setStartReading('');
            setEndReading('');
            startReadingRef.current = '';
            endReadingRef.current = '';
            initialStartReadingRef.current = '';
            initialEndReadingRef.current = '';
            initialStartImageRef.current = undefined;
            initialEndImageRef.current = undefined;
            setFormError('');
            // Force TextInput remount to reset label position
            setInputKey((prev) => prev + 1);
        }

        prevSelectedTabRef.current = selectedTab;
    }, [selectedTab, isLoadingSelectedTab]);

    // Initialize initial values refs on mount for DiscardChangesConfirmation
    // These should never be updated after mount - they represent the "baseline" state
    useEffect(() => {
        if (hasInitializedRefs.current) {
            return;
        }
        const currentStart = currentTransaction?.comment?.odometerStart;
        const currentEnd = currentTransaction?.comment?.odometerEnd;
        const startValue = currentStart !== null && currentStart !== undefined ? currentStart.toString() : '';
        const endValue = currentEnd !== null && currentEnd !== undefined ? currentEnd.toString() : '';
        initialStartReadingRef.current = startValue;
        initialEndReadingRef.current = endValue;
        initialStartImageRef.current = currentTransaction?.comment?.odometerStartImage;
        initialEndImageRef.current = currentTransaction?.comment?.odometerEndImage;
        hasInitializedRefs.current = true;
    }, [
        currentTransaction?.comment?.odometerStart,
        currentTransaction?.comment?.odometerEnd,
        currentTransaction?.comment?.odometerStartImage,
        currentTransaction?.comment?.odometerEndImage,
    ]);

    // Initialize values from transaction when editing or when transaction has data (but not when switching tabs)
    // This updates the current state, but NOT the initial refs (those are set only once on mount)
    useEffect(() => {
        const currentStart = currentTransaction?.comment?.odometerStart;
        const currentEnd = currentTransaction?.comment?.odometerEnd;

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
    }, [currentTransaction?.comment?.odometerStart, currentTransaction?.comment?.odometerEnd, isEditing]);

    useEffect(() => {
        if (!isEditingConfirmation) {
            return () => {};
        }
        createBackupTransaction(transaction, isTransactionDraft, true);

        return () => {
            if (backupHandledManually.current) {
                return;
            }
            if (transactionWasSaved.current) {
                removeBackupTransactionWithImageCleanup(transactionID, isTransactionDraft);
                return;
            }
            restoreOriginalTransactionFromBackupWithImageCleanup(transactionID, isTransactionDraft);
        };
        // We only want to create the backup once on mount and restore/remove it on unmount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Calculate total distance - updated live after every input change
    const totalDistance = (() => {
        const start = parseFloat(DistanceRequestUtils.normalizeOdometerText(startReading, fromLocaleDigit));
        const end = parseFloat(DistanceRequestUtils.normalizeOdometerText(endReading, fromLocaleDigit));
        if (Number.isNaN(start) || Number.isNaN(end) || !startReading || !endReading) {
            return null;
        }
        const distance = end - start;
        // Show 0 if distance is negative
        return distance <= 0 ? 0 : distance;
    })();

    // Get image source for web (blob URL) or native (URI string)
    const getImageSource = useCallback((image: FileObject | string | {uri?: string} | undefined): string | undefined => {
        if (!image) {
            return undefined;
        }

        // Native: URI string, use directly
        if (typeof image === 'string') {
            return image;
        }
        // Web: File object, reuse existing blob URL if present
        if (image instanceof File) {
            if (typeof image.uri === 'string' && image.uri.length > 0) {
                return image.uri;
            }
            return URL.createObjectURL(image);
        }
        // Native: Object with uri property (fallback)
        return image?.uri;
    }, []);

    const startImageSource = useMemo(() => getImageSource(odometerStartImage), [getImageSource, odometerStartImage]);
    const endImageSource = useMemo(() => getImageSource(odometerEndImage), [getImageSource, odometerEndImage]);

    const buttonText = (() => {
        if (shouldSkipConfirmation) {
            return translate('iou.createExpense');
        }
        const shouldShowSave = isEditing || isEditingConfirmation;
        return shouldShowSave ? translate('common.save') : translate('common.next');
    })();

    // Per-keystroke validation: enforce format constraints and cap the max value.
    // The max-value check allows edits that *reduce* the value (e.g. backspacing
    // a legacy over-max reading) but rejects keystrokes that would increase
    // beyond ODOMETER_MAX_VALUE.  Submit-time validation in handleNext is the
    // final safety net.
    const isOdometerInputValid = (text: string, previousText: string): boolean => {
        if (!text) {
            return true;
        }
        const stripped = DistanceRequestUtils.normalizeOdometerText(text, fromLocaleDigit);
        const parts = stripped.split('.');
        if (parts.length > 2) {
            return false;
        }
        if (parts.length === 2 && (parts.at(1) ?? '').length > 1) {
            return false;
        }
        const value = parseFloat(stripped);

        // Allow edits that reduce the value (e.g. backspacing a legacy over-max reading),
        // but reject keystrokes that would increase beyond the max.
        if (!Number.isNaN(value) && value > CONST.IOU.ODOMETER_MAX_VALUE) {
            const previousValue = parseFloat(DistanceRequestUtils.normalizeOdometerText(previousText, fromLocaleDigit));
            if (Number.isNaN(previousValue) || value >= previousValue) {
                return false;
            }
        }
        return true;
    };

    const handleStartReadingChange = (text: string) => {
        if (!isOdometerInputValid(text, startReading)) {
            return;
        }
        const textForDisplay = DistanceRequestUtils.prepareTextForDisplay(text);
        setStartReading(textForDisplay);
        startReadingRef.current = textForDisplay;
        if (formError) {
            setFormError('');
        }
    };

    const handleEndReadingChange = (text: string) => {
        if (!isOdometerInputValid(text, endReading)) {
            return;
        }
        const textForDisplay = DistanceRequestUtils.prepareTextForDisplay(text);
        setEndReading(textForDisplay);
        endReadingRef.current = textForDisplay;
        if (formError) {
            setFormError('');
        }
    };

    const handleCaptureImage = useCallback(
        (imageType: OdometerImageType) => {
            Navigation.navigate(ROUTES.ODOMETER_IMAGE.getRoute(action, iouType, transactionID, reportID, imageType, isEditingConfirmation, backToReport));
        },
        [action, iouType, transactionID, reportID, isEditingConfirmation, backToReport],
    );

    const handleViewOdometerImage = useCallback(
        (imageType: OdometerImageType) => {
            if (!reportID || !transactionID) {
                return;
            }
            Navigation.navigate(ROUTES.MONEY_REQUEST_ODOMETER_PREVIEW.getRoute(reportID, transactionID, action, iouType, imageType, isEditingConfirmation, backToReport));
        },
        [reportID, transactionID, isEditingConfirmation, action, iouType, backToReport],
    );

    const navigateBack = useCallback(() => {
        if (isEditingConfirmation) {
            backupHandledManually.current = true;
            restoreOriginalTransactionFromBackupWithImageCleanup(transactionID, isTransactionDraft, () => {
                Navigation.goBack(confirmationRoute);
            });
            return;
        }
        Navigation.goBack();
    }, [isEditingConfirmation, confirmationRoute, transactionID, isTransactionDraft]);

    const handlePressStartImage = useCallback(() => {
        if (odometerStartImage) {
            handleViewOdometerImage(CONST.IOU.ODOMETER_IMAGE_TYPE.START);
        } else {
            handleCaptureImage(CONST.IOU.ODOMETER_IMAGE_TYPE.START);
        }
    }, [odometerStartImage, handleViewOdometerImage, handleCaptureImage]);

    const handlePressEndImage = useCallback(() => {
        if (odometerEndImage) {
            handleViewOdometerImage(CONST.IOU.ODOMETER_IMAGE_TYPE.END);
        } else {
            handleCaptureImage(CONST.IOU.ODOMETER_IMAGE_TYPE.END);
        }
    }, [odometerEndImage, handleViewOdometerImage, handleCaptureImage]);

    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    // Navigate to next page following Manual tab pattern
    const navigateToNextPage = () => {
        const start = parseFloat(DistanceRequestUtils.normalizeOdometerText(startReading, fromLocaleDigit));
        const end = parseFloat(DistanceRequestUtils.normalizeOdometerText(endReading, fromLocaleDigit));
        setMoneyRequestOdometerReading(transactionID, start, end, isTransactionDraft);
        const distance = end - start;
        const calculatedDistance = roundToTwoDecimalPlaces(distance);
        setMoneyRequestDistance(transactionID, calculatedDistance, isTransactionDraft, unit);

        if (isEditing) {
            // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
            if (isEditingSplit && transaction) {
                setDraftSplitTransaction(
                    transaction.transactionID,
                    splitDraftTransaction,
                    {
                        distance: calculatedDistance,
                        odometerStart: start,
                        odometerEnd: end,
                    },
                    policy,
                );
                Navigation.goBack();
                return;
            }

            // Update existing transaction
            const previousDistance = transaction?.comment?.customUnit?.quantity;
            const previousStart = transaction?.comment?.odometerStart;
            const previousEnd = transaction?.comment?.odometerEnd;
            const hasChanges = previousDistance !== calculatedDistance || previousStart !== start || previousEnd !== end;

            if (hasChanges) {
                // Update distance (which will also update amount and merchant)
                updateMoneyRequestDistance({
                    transaction,
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
            transactionWasSaved.current = true;
            Navigation.goBack(confirmationRoute);
            return;
        }

        if (shouldSkipConfirmation) {
            setShouldEnableDiscardConfirmation(false);
        }

        startSpan(CONST.TELEMETRY.SPAN_ODOMETER_TO_CONFIRMATION, {
            name: CONST.TELEMETRY.SPAN_ODOMETER_TO_CONFIRMATION,
            op: CONST.TELEMETRY.SPAN_ODOMETER_TO_CONFIRMATION,
            attributes: {
                [CONST.TELEMETRY.ATTRIBUTE_IOU_TYPE]: iouType,
                [CONST.TELEMETRY.ATTRIBUTE_HAS_RECEIPT]: !!(odometerStartImage ?? odometerEndImage),
            },
        });

        handleMoneyRequestStepDistanceNavigation({
            iouType,
            report,
            policy,
            transaction,
            reportID,
            transactionID,
            reportAttributesDerived,
            personalDetails,
            currentUserLogin: currentUserEmailParam,
            currentUserAccountID: currentUserAccountIDParam,
            backToReport,
            shouldSkipConfirmation,
            defaultExpensePolicy,
            isArchivedExpenseReport: isArchived,
            isAutoReporting: !!personalPolicy?.autoReporting,
            isASAPSubmitBetaEnabled: false,
            transactionViolations,
            lastSelectedDistanceRates,
            translate,
            quickAction,
            policyRecentlyUsedCurrencies,
            introSelected,
            activePolicyID,
            privateIsArchived: isArchived,
            selfDMReport,
            policyForMovingExpenses,
            odometerStart: start,
            odometerEnd: end,
            odometerDistance: calculatedDistance,
            betas,
            recentWaypoints,
            unit,
            personalOutputCurrency: personalPolicy?.outputCurrency,
            draftTransactionIDs,
            isSelfTourViewed: !!isSelfTourViewed,
            amountOwed,
            userBillingGracePeriodEnds,
            ownerBillingGracePeriodEnd,
            conciergeReportID,
        });
    };

    // Handle form submission with validation
    const handleNext = () => {
        // Validation: Start and end readings must not be empty
        if (!startReading || !endReading) {
            setFormError(translate('iou.error.invalidReadings'));
            return;
        }

        const start = parseFloat(DistanceRequestUtils.normalizeOdometerText(startReading, fromLocaleDigit));
        const end = parseFloat(DistanceRequestUtils.normalizeOdometerText(endReading, fromLocaleDigit));

        if (Number.isNaN(start) || Number.isNaN(end)) {
            setFormError(translate('iou.error.invalidReadings'));
            return;
        }

        if (start > CONST.IOU.ODOMETER_MAX_VALUE || end > CONST.IOU.ODOMETER_MAX_VALUE) {
            setFormError(translate('iou.error.odometerReadingTooLarge', numberFormat(CONST.IOU.ODOMETER_MAX_VALUE, {maximumFractionDigits: 1})));
            return;
        }

        const distance = end - start;
        if (distance <= 0) {
            setFormError(translate('iou.error.negativeDistanceNotAllowed'));
            return;
        }

        // Validation: Check that distance * rate doesn't exceed the backend's safe amount limit
        if (!DistanceRequestUtils.isDistanceAmountWithinLimit(distance, rate)) {
            setFormError(translate('iou.error.distanceAmountTooLargeReduceDistance'));
            return;
        }

        // When validation passes, call navigateToNextPage
        navigateToNextPage();
    };

    useDiscardChangesConfirmation({
        isEnabled: shouldEnableDiscardConfirmation,
        getHasUnsavedChanges: () => {
            const hasReadingChanges = startReadingRef.current !== initialStartReadingRef.current || endReadingRef.current !== initialEndReadingRef.current;
            const hasImageChanges = transaction?.comment?.odometerStartImage !== initialStartImageRef.current || transaction?.comment?.odometerEndImage !== initialEndImageRef.current;
            return hasReadingChanges || hasImageChanges;
        },
    });

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
                    <View style={[styles.mb6, styles.flexRow, !isEditing && [styles.alignItemsCenter, styles.gap3]]}>
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
                        {!isEditing && (
                            <PressableWithFeedback
                                accessibilityRole="button"
                                accessibilityLabel={translate('distance.odometer.startTitle')}
                                sentryLabel={CONST.SENTRY_LABEL.ODOMETER_EXPENSE.CAPTURE_IMAGE_START}
                                onPress={handlePressStartImage}
                                style={[
                                    StyleUtils.getWidthAndHeightStyle(variables.inputHeight, variables.inputHeight),
                                    StyleUtils.getBorderRadiusStyle(variables.componentBorderRadiusMedium),
                                    styles.overflowHidden,
                                    StyleUtils.getBackgroundColorStyle(theme.border),
                                ]}
                            >
                                <ReceiptImage
                                    source={startImageSource ?? ''}
                                    shouldUseThumbnailImage
                                    thumbnailContainerStyles={styles.bgTransparent}
                                    isAuthTokenRequired
                                    fallbackIcon={icons.GalleryPlus}
                                    fallbackIconSize={variables.iconSizeNormal}
                                    fallbackIconColor={theme.icon}
                                    iconSize="x-small"
                                    loadingIconSize="small"
                                    shouldUseInitialObjectPosition
                                />
                            </PressableWithFeedback>
                        )}
                    </View>
                    {/* End Reading */}
                    <View style={[styles.mb6, styles.flexRow, !isEditing && [styles.alignItemsCenter, styles.gap3]]}>
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
                        {!isEditing && (
                            <PressableWithFeedback
                                accessibilityRole="button"
                                accessibilityLabel={translate('distance.odometer.endTitle')}
                                sentryLabel={CONST.SENTRY_LABEL.ODOMETER_EXPENSE.CAPTURE_IMAGE_END}
                                onPress={handlePressEndImage}
                                style={[
                                    StyleUtils.getWidthAndHeightStyle(variables.inputHeight, variables.inputHeight),
                                    StyleUtils.getBorderRadiusStyle(variables.componentBorderRadiusMedium),
                                    styles.overflowHidden,
                                    StyleUtils.getBackgroundColorStyle(theme.border),
                                ]}
                            >
                                <ReceiptImage
                                    source={endImageSource ?? ''}
                                    shouldUseThumbnailImage
                                    thumbnailContainerStyles={styles.bgTransparent}
                                    isAuthTokenRequired
                                    fallbackIcon={icons.GalleryPlus}
                                    fallbackIconSize={variables.iconSizeNormal}
                                    fallbackIconColor={theme.icon}
                                    iconSize="x-small"
                                    loadingIconSize="small"
                                    shouldUseInitialObjectPosition
                                />
                            </PressableWithFeedback>
                        )}
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
                        sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.DISTANCE_ODOMETER_NEXT_BUTTON}
                    />
                </View>
            </View>
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
