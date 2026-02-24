import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import {GalleryPlus} from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ReceiptImage from '@components/ReceiptImage';
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
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportAttributes from '@hooks/useReportAttributes';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMoneyRequestDistance, setMoneyRequestOdometerReading, updateMoneyRequestDistance} from '@libs/actions/IOU';
import {handleMoneyRequestStepDistanceNavigation} from '@libs/actions/IOU/MoneyRequest';
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
import type {OdometerImageType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
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
    const StyleUtils = useStyleUtils();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();

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

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});
    const isArchived = isArchivedReport(reportNameValuePairs);
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const reportAttributesDerived = useReportAttributes();
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
    const selfDMReport = useSelfDMReport();
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const [selectedTab, selectedTabResult] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.DISTANCE_REQUEST_TYPE}`, {canBeMissing: true});
    const isLoadingSelectedTab = isLoadingOnyxValue(selectedTabResult);

    // isEditing: we're changing an already existing odometer expense; isEditingConfirmation: we navigated here by pressing 'Distance' field from the confirmation step during the creation of a new odometer expense to adjust the input before submitting
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingConfirmation = routeName !== SCREENS.MONEY_REQUEST.DISTANCE_CREATE && !isEditing;
    const isCreatingNewRequest = !isEditingConfirmation && !isEditing;
    const isTransactionDraft = shouldUseTransactionDraft(action, iouType);
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const [shouldEnableDiscardConfirmation, setShouldEnableDiscardConfirmation] = useState(!isEditingConfirmation && !isEditing);

    const shouldUseDefaultExpensePolicy = useMemo(() => shouldUseDefaultExpensePolicyUtil(iouType, defaultExpensePolicy), [iouType, defaultExpensePolicy]);
    const customUnitRateID = getRateID(transaction);

    const unit = DistanceRequestUtils.getRate({transaction, policy: shouldUseDefaultExpensePolicy ? defaultExpensePolicy : policy}).unit;

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
        const currentStart = transaction?.comment?.odometerStart;
        const currentEnd = transaction?.comment?.odometerEnd;
        const startValue = currentStart !== null && currentStart !== undefined ? currentStart.toString() : '';
        const endValue = currentEnd !== null && currentEnd !== undefined ? currentEnd.toString() : '';
        initialStartReadingRef.current = startValue;
        initialEndReadingRef.current = endValue;
        initialStartImageRef.current = transaction?.comment?.odometerStartImage;
        initialEndImageRef.current = transaction?.comment?.odometerEndImage;
        hasInitializedRefs.current = true;
    }, [transaction?.comment?.odometerStart, transaction?.comment?.odometerEnd, transaction?.comment?.odometerStartImage, transaction?.comment?.odometerEndImage]);

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

    useEffect(() => {
        return () => {
            if (!startImageSource?.startsWith('blob:')) {
                return;
            }
            URL.revokeObjectURL(startImageSource);
        };
    }, [startImageSource]);

    useEffect(() => {
        return () => {
            if (!endImageSource?.startsWith('blob:')) {
                return;
            }
            URL.revokeObjectURL(endImageSource);
        };
    }, [endImageSource]);

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

    const handleCaptureImage = useCallback(
        (imageType: OdometerImageType) => {
            Navigation.navigate(ROUTES.ODOMETER_IMAGE.getRoute(action, iouType, transactionID, reportID, imageType));
        },
        [action, iouType, transactionID, reportID],
    );

    const handleViewOdometerImage = useCallback(
        (imageType: OdometerImageType) => {
            if (!reportID || !transactionID) {
                return;
            }
            Navigation.navigate(ROUTES.MONEY_REQUEST_RECEIPT_PREVIEW.getRoute(reportID, transactionID, action, iouType, imageType));
        },
        [reportID, transactionID, action, iouType],
    );

    const navigateBack = () => {
        if (isEditingConfirmation) {
            Navigation.goBack(confirmationRoute);
            return;
        }
        Navigation.goBack();
    };

    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS, {canBeMissing: true});
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
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
        setMoneyRequestDistance(transactionID, calculatedDistance, isTransactionDraft, unit);

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

        if (shouldSkipConfirmation) {
            setShouldEnableDiscardConfirmation(false);
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
            privateIsArchived: reportNameValuePairs?.private_isArchived,
            selfDMReport,
            policyForMovingExpenses,
            odometerStart: start,
            odometerEnd: end,
            odometerDistance: calculatedDistance,
            betas,
            unit,
            personalOutputCurrency: personalPolicy?.outputCurrency,
        });
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
                                onPress={() => {
                                    if (odometerStartImage) {
                                        handleViewOdometerImage(CONST.IOU.ODOMETER_IMAGE_TYPE.START);
                                    } else {
                                        handleCaptureImage(CONST.IOU.ODOMETER_IMAGE_TYPE.START);
                                    }
                                }}
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
                                    fallbackIcon={GalleryPlus}
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
                                onPress={() => {
                                    if (odometerEndImage) {
                                        handleViewOdometerImage(CONST.IOU.ODOMETER_IMAGE_TYPE.END);
                                    } else {
                                        handleCaptureImage(CONST.IOU.ODOMETER_IMAGE_TYPE.END);
                                    }
                                }}
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
                                    fallbackIcon={GalleryPlus}
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
            <DiscardChangesConfirmation
                isEnabled={shouldEnableDiscardConfirmation}
                getHasUnsavedChanges={() => {
                    const hasReadingChanges = startReadingRef.current !== initialStartReadingRef.current || endReadingRef.current !== initialEndReadingRef.current;
                    const hasImageChanges =
                        transaction?.comment?.odometerStartImage !== initialStartImageRef.current || transaction?.comment?.odometerEndImage !== initialEndImageRef.current;
                    return hasReadingChanges || hasImageChanges;
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
