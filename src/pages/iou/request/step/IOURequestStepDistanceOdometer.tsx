import {useIsFocused} from '@react-navigation/native';
import lodashIsEmpty from 'lodash/isEmpty';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {InteractionManager, View} from 'react-native';
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
import useDistanceRateOriginalPolicy from '@hooks/useDistanceRateOriginalPolicy';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRestartOnOdometerImagesFailure from '@hooks/useRestartOnOdometerImagesFailure';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMoneyRequestDistance} from '@libs/actions/IOU';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestDistance} from '@libs/actions/IOU/UpdateMoneyRequest';
import {clearOdometerDraft, saveOdometerDraft, setMoneyRequestOdometerReading} from '@libs/actions/OdometerTransactionUtils';
import {restoreOriginalTransactionFromBackupWithImageCleanup} from '@libs/actions/TransactionEdit';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getOdometerImageUri} from '@libs/OdometerImageUtils';
import {isPolicyExpenseChat as isPolicyExpenseChatUtils} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicyUtil from '@libs/shouldUseDefaultExpensePolicy';
import {startSpan} from '@libs/telemetry/activeSpans';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useOdometerImageHandlers from './IOURequestStepDistance/hooks/useOdometerImageHandlers';
import useOdometerNavigation from './IOURequestStepDistance/hooks/useOdometerNavigation';
import useOdometerReadingsState from './IOURequestStepDistance/hooks/useOdometerReadingsState';
import useOdometerTransactionBackup from './IOURequestStepDistance/hooks/useOdometerTransactionBackup';
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
    const lastFocusedInputRef = useRef<BaseTextInputRef | null>(null);

    const [isDiscardModalVisible, setIsDiscardModalVisible] = useState(false);

    const didSaveEditingConfirmationRef = useRef(false);
    const shouldBypassDiscardConfirmationRef = useRef(false);
    const backupHandledManually = useRef(false);
    const userHasUnsavedTypingRef = useRef(false);

    const isArchived = useReportIsArchived(report?.reportID);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const reportAttributesDerived = useReportAttributes();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const policy = usePolicy(report?.policyID);
    const distanceOriginalPolicy = useDistanceRateOriginalPolicy(transaction?.comment?.customUnit?.customUnitRateID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);
    const personalPolicy = usePersonalPolicy();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const selfDMReport = useSelfDMReport();
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const [selectedTab, selectedTabResult] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.DISTANCE_REQUEST_TYPE}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
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
    const isFocused = useIsFocused();

    const shouldUseDefaultExpensePolicy = useMemo(
        () => shouldUseDefaultExpensePolicyUtil(iouType, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd),
        [iouType, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd],
    );

    const mileageRate = DistanceRequestUtils.getRate({transaction: currentTransaction, policy: shouldUseDefaultExpensePolicy ? defaultExpensePolicy : policy});
    const unit = mileageRate.unit;
    const rate = mileageRate.rate ?? 0;

    const shouldSkipConfirmation: boolean = !skipConfirmation || !report?.reportID ? false : !(isArchived || isPolicyExpenseChatUtils(report));

    const confirmationRoute = ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportID, backToReport);

    // Stable indirection so `useRestartOnOdometerImagesFailure` (called before the readings hook
    // returns) can call the latest reset function.
    const resetOdometerLocalStateRef = useRef<() => void>(() => {});

    const {hasVerifiedBlobs} = useRestartOnOdometerImagesFailure(transaction, reportID, iouType, backToReport, ({shouldResetLocalState}) => {
        if (shouldResetLocalState) {
            resetOdometerLocalStateRef.current();
        }
        backupHandledManually.current = true;
    });

    const [odometerDraft] = useOnyx(ONYXKEYS.ODOMETER_DRAFT);

    const {
        startReading,
        setStartReading,
        endReading,
        setEndReading,
        formError,
        setFormError,
        inputKey,
        startReadingRef,
        endReadingRef,
        initialStartReadingRef,
        initialEndReadingRef,
        initialStartImageRef,
        initialEndImageRef,
        resetOdometerLocalState,
        hasInitializedRefs,
    } = useOdometerReadingsState({currentTransaction, isEditing, selectedTab, isLoadingSelectedTab, hasVerifiedBlobs, odometerDraft});

    useEffect(() => {
        resetOdometerLocalStateRef.current = resetOdometerLocalState;
    }, [resetOdometerLocalState]);

    // Get odometer images from transaction (only for display, not for initialization)
    const odometerStartImage = transaction?.comment?.odometerStartImage;
    const odometerEndImage = transaction?.comment?.odometerEndImage;

    useOdometerTransactionBackup({
        transaction,
        isEditingConfirmation,
        isTransactionDraft,
        transactionID,
        didSaveEditingConfirmationRef,
        backupHandledManuallyRef: backupHandledManually,
    });

    const navigateToNextStep = useOdometerNavigation({
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
        backTo: undefined,
        shouldSkipConfirmation,
        defaultExpensePolicy,
        isArchived,
        isAutoReporting: !!personalPolicy?.autoReporting,
        translate,
        selfDMReport,
        policyForMovingExpenses,
        betas,
        recentWaypoints,
        introSelected,
        personalOutputCurrency: personalPolicy?.outputCurrency,
    });

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
        userHasUnsavedTypingRef.current = true;
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
        userHasUnsavedTypingRef.current = true;
        if (formError) {
            setFormError('');
        }
    };

    const navigateBack = useCallback(() => {
        if (isEditingConfirmation) {
            Navigation.goBack(confirmationRoute);
            return;
        }
        Navigation.goBack();
    }, [confirmationRoute, isEditingConfirmation]);

    const {handlePressStartImage, handlePressEndImage} = useOdometerImageHandlers({
        action,
        iouType,
        transactionID,
        reportID,
        isEditingConfirmation,
        backToReport,
        odometerStartImage,
        odometerEndImage,
    });

    // Navigate to next page following Manual tab pattern
    const navigateToNextPage = () => {
        const start = parseFloat(DistanceRequestUtils.normalizeOdometerText(startReading, fromLocaleDigit));
        const end = parseFloat(DistanceRequestUtils.normalizeOdometerText(endReading, fromLocaleDigit));
        setMoneyRequestOdometerReading(transactionID, start, end, isTransactionDraft);
        const distance = end - start;
        const calculatedDistance = roundToTwoDecimalPlaces(distance);
        setMoneyRequestDistance(transactionID, calculatedDistance, isTransactionDraft, unit);
        // Local state has just been persisted to the transaction thus the resync guard can be lowered
        userHasUnsavedTypingRef.current = false;

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
                    distanceOriginalPolicy,
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
            didSaveEditingConfirmationRef.current = true;
            // Sync the existing save-for-later draft with the just-edited values
            // Gated so we don't promote a non-save-for-later flow into one
            if (odometerDraft) {
                saveOdometerDraft({
                    startReading: Number.isNaN(start) ? undefined : start,
                    endReading: Number.isNaN(end) ? undefined : end,
                    startImage: transaction?.comment?.odometerStartImage,
                    endImage: transaction?.comment?.odometerEndImage,
                }).catch((error: unknown) => Log.warn('Failed to update odometer draft after edit-from-confirmation', {error}));
            }
            Navigation.goBack(confirmationRoute);
            return;
        }

        if (shouldSkipConfirmation) {
            // Skip-confirmation submit navigates away and should never be blocked by discard modal.
            shouldBypassDiscardConfirmationRef.current = true;
        }

        startSpan(CONST.TELEMETRY.SPAN_ODOMETER_TO_CONFIRMATION, {
            name: CONST.TELEMETRY.SPAN_ODOMETER_TO_CONFIRMATION,
            op: CONST.TELEMETRY.SPAN_ODOMETER_TO_CONFIRMATION,
            attributes: {
                [CONST.TELEMETRY.ATTRIBUTE_IOU_TYPE]: iouType,
                [CONST.TELEMETRY.ATTRIBUTE_HAS_RECEIPT]: !!(odometerStartImage ?? odometerEndImage),
            },
        });

        navigateToNextStep({
            odometerStart: start,
            odometerEnd: end,
            odometerDistance: calculatedDistance,
            unit,
            previousOdometerDraft: odometerDraft,
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

    const handleSaveForLater = useCallback(async () => {
        shouldBypassDiscardConfirmationRef.current = true;

        const normalizedStart = DistanceRequestUtils.normalizeOdometerText(startReading, fromLocaleDigit);
        const normalizedEnd = DistanceRequestUtils.normalizeOdometerText(endReading, fromLocaleDigit);
        const parsedStart = startReading ? parseFloat(normalizedStart) : undefined;
        const parsedEnd = endReading ? parseFloat(normalizedEnd) : undefined;
        const startReadingValue = parsedStart !== undefined && !Number.isNaN(parsedStart) ? parsedStart : undefined;
        const endReadingValue = parsedEnd !== undefined && !Number.isNaN(parsedEnd) ? parsedEnd : undefined;
        const hasAnyInput = startReadingValue !== undefined || endReadingValue !== undefined || !!odometerStartImage || !!odometerEndImage;

        if (!hasAnyInput) {
            await clearOdometerDraft();
            Navigation.closeRHPFlow();
            return;
        }

        try {
            await saveOdometerDraft({
                startReading: startReadingValue,
                endReading: endReadingValue,
                startImage: odometerStartImage,
                endImage: odometerEndImage,
            });
        } catch (error) {
            Log.warn('Failed to persist odometer draft for "Save for later"', {error});
            shouldBypassDiscardConfirmationRef.current = false;
            setFormError(translate('iou.error.failedToSaveOdometerDraft'));
            return;
        }
        Navigation.closeRHPFlow();
    }, [fromLocaleDigit, startReading, endReading, odometerStartImage, odometerEndImage, translate, setFormError]);

    useDiscardChangesConfirmation({
        onCancel: () => {
            InteractionManager.runAfterInteractions(() => {
                lastFocusedInputRef.current?.focus();
            });
        },
        getHasUnsavedChanges: () => {
            if (
                !isFocused ||
                isEditing ||
                shouldBypassDiscardConfirmationRef.current ||
                didSaveEditingConfirmationRef.current ||
                !hasInitializedRefs.current ||
                backupHandledManually.current
            ) {
                return false;
            }
            const hasReadingChanges = startReadingRef.current !== initialStartReadingRef.current || endReadingRef.current !== initialEndReadingRef.current;
            const hasImageChanges =
                getOdometerImageUri(transaction?.comment?.odometerStartImage) !== getOdometerImageUri(initialStartImageRef.current) ||
                getOdometerImageUri(transaction?.comment?.odometerEndImage) !== getOdometerImageUri(initialEndImageRef.current);
            return hasReadingChanges || hasImageChanges;
        },
        onConfirm: isEditingConfirmation
            ? async () => {
                  await restoreOriginalTransactionFromBackupWithImageCleanup(transactionID, isTransactionDraft);
                  backupHandledManually.current = true;
              }
            : undefined,
        onVisibilityChange: setIsDiscardModalVisible,
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
                                editable={!isDiscardModalVisible}
                                onFocus={() => {
                                    lastFocusedInputRef.current = startReadingInputRef.current;
                                }}
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
                                editable={!isDiscardModalVisible}
                                onFocus={() => {
                                    lastFocusedInputRef.current = endReadingInputRef.current;
                                }}
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
                    {/* Save for later Button */}
                    {isCreatingNewRequest && (
                        <Button
                            allowBubble
                            medium={isExtraSmallScreenHeight}
                            large={!isExtraSmallScreenHeight}
                            style={[styles.w100, styles.mb3]}
                            onPress={handleSaveForLater}
                            text={translate('distance.odometer.saveForLater')}
                            testID="save-for-later-button"
                            sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.DISTANCE_ODOMETER_SAVE_FOR_LATER_BUTTON}
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

const IOURequestStepDistanceOdometerWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceOdometerWithCurrentUserPersonalDetails, true);

const IOURequestStepDistanceOdometerWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceOdometerWithWritableReportOrNotFound);

export default IOURequestStepDistanceOdometerWithFullTransactionOrNotFound;
