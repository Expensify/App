/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import {Gallery} from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ReceiptImage from '@components/ReceiptImage';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMoneyRequestDistance, setMoneyRequestOdometerImage, setMoneyRequestOdometerReading, setMoneyRequestParticipantsFromReport} from '@libs/actions/IOU';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {navigateToParticipantPage, shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {isArchivedReport} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {getRateID} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
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
        params: {action, iouType, reportID, transactionID, backTo, backToReport},
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
    const initialStartImageRef = useRef<File | string | undefined>(undefined);
    const initialEndImageRef = useRef<File | string | undefined>(undefined);
    const isSavedRef = useRef(false);
    const hasInitializedRefs = useRef(false);
    // Track previous transaction values to detect when transaction is cleared (e.g., tab switch)
    const prevTransactionStartRef = useRef<number | null | undefined>(undefined);
    const prevTransactionEndRef = useRef<number | null | undefined>(undefined);
    // Track local state via refs to avoid including them in useEffect dependencies
    const startReadingRef = useRef<string>('');
    const endReadingRef = useRef<string>('');

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});
    const policy = usePolicy(report?.policyID);
    const personalPolicy = usePersonalPolicy();
    const defaultExpensePolicy = useDefaultExpensePolicy();

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreatingNewRequest = !(backTo || isEditing);
    const isTransactionDraft = shouldUseTransactionDraft(action, iouType);

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

    // Get odometer images from transaction (only for display, not for initialization)
    const odometerStartImage = transaction?.comment?.odometerStartImage;
    const odometerEndImage = transaction?.comment?.odometerEndImage;

    // Reset component state when transaction has no odometer data (happens when switching tabs)
    // In Phase 1, we don't persist data from transaction since users can't save and exit
    useEffect(() => {
        const currentStart = transaction?.comment?.odometerStart;
        const currentEnd = transaction?.comment?.odometerEnd;

        // Check if transaction was cleared (had values before, now null/undefined)
        // This happens when switching tabs, not during normal typing
        const wasCleared =
            (prevTransactionStartRef.current !== null && prevTransactionStartRef.current !== undefined && (currentStart === null || currentStart === undefined)) ||
            (prevTransactionEndRef.current !== null && prevTransactionEndRef.current !== undefined && (currentEnd === null || currentEnd === undefined));

        const hasTransactionData = (currentStart !== null && currentStart !== undefined) || (currentEnd !== null && currentEnd !== undefined);

        // Only reset if transaction was cleared (not just null initially) and we have local state
        // We check local state via refs to avoid including them in dependencies
        const hasLocalState = startReadingRef.current || endReadingRef.current;
        if (wasCleared && !hasTransactionData && hasLocalState && !isSavedRef.current && hasInitializedRefs.current) {
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

        // Update refs to track previous values
        prevTransactionStartRef.current = currentStart;
        prevTransactionEndRef.current = currentEnd;
    }, [transaction?.comment?.odometerStart, transaction?.comment?.odometerEnd]);

    // Initialize initial values refs on mount for DiscardChangesConfirmation
    useEffect(() => {
        if (hasInitializedRefs.current) {
            return;
        }
        initialStartReadingRef.current = '';
        initialEndReadingRef.current = '';
        initialStartImageRef.current = transaction?.comment?.odometerStartImage;
        initialEndImageRef.current = transaction?.comment?.odometerEndImage;
        hasInitializedRefs.current = true;
    }, [transaction?.comment?.odometerStartImage, transaction?.comment?.odometerEndImage]);

    // Update refs after saving to mark current state as "saved"
    useEffect(() => {
        if (!isSavedRef.current) {
            return;
        }
        initialStartReadingRef.current = startReading;
        initialEndReadingRef.current = endReading;
        initialStartImageRef.current = transaction?.comment?.odometerStartImage;
        initialEndImageRef.current = transaction?.comment?.odometerEndImage;
        isSavedRef.current = false;
    }, [startReading, endReading, transaction?.comment?.odometerStartImage, transaction?.comment?.odometerEndImage]);

    // Calculate total distance - updated live after every input change
    const totalDistance = useMemo(() => {
        const start = parseFloat(startReading);
        const end = parseFloat(endReading);
        if (Number.isNaN(start) || Number.isNaN(end) || !startReading || !endReading) {
            return null;
        }
        const distance = end - start;
        // Show 0 if distance is negative
        return distance <= 0 ? 0 : distance;
    }, [startReading, endReading]);

    // Get image source for web (blob URL) or native (URI string)
    const getImageSource = useCallback((image: File | string | {uri?: string} | undefined): string | undefined => {
        if (!image) {
            return undefined;
        }
        // Web: File object, create blob URL
        if (typeof image !== 'string' && image instanceof File) {
            return URL.createObjectURL(image);
        }
        // Native: URI string, use directly
        if (typeof image === 'string') {
            return image;
        }
        // Native: Object with uri property (fallback for compatibility)
        if (typeof image === 'object' && 'uri' in image && typeof image.uri === 'string') {
            return image.uri;
        }
        return undefined;
    }, []);

    const startImageSource = getImageSource(odometerStartImage);
    const endImageSource = getImageSource(odometerEndImage);

    const navigateBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    const buttonText = useMemo(() => {
        return isEditing ? translate('common.save') : translate('common.next');
    }, [isEditing, translate]);

    const handleStartReadingChange = useCallback(
        (text: string) => {
            // Only allow digits
            const digitsOnly = text.replaceAll(/[^0-9]/g, '');
            setStartReading(digitsOnly);
            startReadingRef.current = digitsOnly;
            if (formError) {
                setFormError('');
            }
            // Save to transaction immediately
            const startValue = digitsOnly ? parseFloat(digitsOnly) : null;
            const endValue = endReading ? parseFloat(endReading) : null;
            if (startValue !== null && !Number.isNaN(startValue)) {
                setMoneyRequestOdometerReading(transactionID, startValue, endValue ?? null, isTransactionDraft);
            }
        },
        [endReading, formError, transactionID, isTransactionDraft],
    );

    const handleEndReadingChange = useCallback(
        (text: string) => {
            // Only allow digits
            const digitsOnly = text.replaceAll(/[^0-9]/g, '');
            setEndReading(digitsOnly);
            endReadingRef.current = digitsOnly;
            if (formError) {
                setFormError('');
            }
            // Save to transaction immediately
            const startValue = startReading ? parseFloat(startReading) : null;
            const endValue = digitsOnly ? parseFloat(digitsOnly) : null;
            if (endValue !== null && !Number.isNaN(endValue)) {
                setMoneyRequestOdometerReading(transactionID, startValue ?? null, endValue, isTransactionDraft);
            }
        },
        [startReading, formError, transactionID, isTransactionDraft],
    );

    const handleCaptureImage = useCallback(
        (imageType: 'start' | 'end') => {
            Navigation.navigate(ROUTES.ODOMETER_IMAGE.getRoute(transactionID, imageType, Navigation.getActiveRouteWithoutParams()));
        },
        [transactionID],
    );

    const handleViewOdometerImage = useCallback(
        (imageType: 'start' | 'end') => {
            // Navigate to receipt modal with imageType parameter
            Navigation.navigate(ROUTES.TRANSACTION_RECEIPT.getRoute(reportID, transactionID, false, false, undefined, imageType));
        },
        [reportID, transactionID],
    );

    // Navigate to confirmation page helper - following Manual tab pattern
    const navigateToConfirmationPage = useCallback(() => {
        switch (iouType) {
            case CONST.IOU.TYPE.REQUEST:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID, backToReport));
                break;
            default:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, backToReport));
        }
    }, [iouType, transactionID, reportID, backToReport]);

    // Navigate to next page following Manual tab pattern
    const navigateToNextPage = useCallback(() => {
        const start = parseFloat(startReading);
        const end = parseFloat(endReading);

        // Mark as saved to prevent DiscardChangesConfirmation from showing
        isSavedRef.current = true;

        // Store odometer readings in transaction.comment.odometerStart/odometerEnd
        setMoneyRequestOdometerReading(transactionID, start, end, isTransactionDraft);

        // Calculate total distance (endReading - startReading)
        const distance = end - start;
        const calculatedDistance = roundToTwoDecimalPlaces(distance);

        // Store total distance in transaction.comment.customUnit.quantity
        setMoneyRequestDistance(transactionID, calculatedDistance, isTransactionDraft);

        if (isEditing) {
            // Update existing transaction
            // TODO: Implement update logic similar to updateMoneyRequestDistance
            Navigation.goBack(backTo);
            return;
        }

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // If a reportID exists in the report object, use it to set participants and navigate to confirmation
        // Following Manual tab pattern
        if (report?.reportID && !isArchivedReport(reportNameValuePairs) && iouType !== CONST.IOU.TYPE.CREATE) {
            setMoneyRequestParticipantsFromReport(transactionID, report, currentUserPersonalDetails.accountID).then(() => {
                navigateToConfirmationPage();
            });
            return;
        }

        // If there was no reportID, navigate to participant page
        navigateToParticipantPage(iouType, transactionID, reportID);
    }, [
        startReading,
        endReading,
        transactionID,
        isTransactionDraft,
        isEditing,
        backTo,
        report,
        reportNameValuePairs,
        iouType,
        currentUserPersonalDetails.accountID,
        navigateToConfirmationPage,
        reportID,
    ]);

    // Handle form submission with validation
    const handleNext = useCallback(() => {
        // Validation: Start and end readings must not be empty
        if (!startReading || !endReading) {
            setFormError(translate('distance.odometer.readingRequired'));
            return;
        }

        const start = parseFloat(startReading);
        const end = parseFloat(endReading);

        if (Number.isNaN(start) || Number.isNaN(end)) {
            setFormError(translate('distance.odometer.readingRequired'));
            return;
        }

        // Validation: Calculated distance (end - start) must be > 0
        const distance = end - start;
        if (distance <= 0) {
            setFormError(translate('distance.odometer.negativeDistanceNotAllowed'));
            return;
        }

        // When validation passes, call navigateToNextPage
        navigateToNextPage();
    }, [startReading, endReading, navigateToNextPage, translate]);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepDistanceOdometer.displayName}
            shouldShowNotFoundPage={false}
            shouldShowWrapper={!isCreatingNewRequest}
            includeSafeAreaPaddingBottom
        >
            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentBetween, styles.ph5, styles.mb5]}>
                <View>
                    {/* Start Reading */}
                    <View style={[styles.mb4, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                        <View style={[styles.flex1]}>
                            <TextInput
                                key={`start-${inputKey}`}
                                ref={startReadingInputRef}
                                label={translate('distance.odometer.startReading')}
                                accessibilityLabel={translate('distance.odometer.startReading')}
                                value={startReading}
                                onChangeText={handleStartReadingChange}
                                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                inputMode={CONST.INPUT_MODE.NUMERIC}
                            />
                        </View>
                        <PressableWithFeedback
                            accessible={false}
                            accessibilityRole="button"
                            onPress={() => {
                                if (odometerStartImage) {
                                    handleViewOdometerImage('start');
                                } else {
                                    handleCaptureImage('start');
                                }
                            }}
                            style={[
                                StyleUtils.getWidthAndHeightStyle(variables.h40, variables.w40),
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
                                fallbackIcon={Gallery}
                                fallbackIconSize={20}
                                fallbackIconColor={theme.icon}
                                iconSize="x-small"
                                loadingIconSize="small"
                                shouldUseInitialObjectPosition
                            />
                        </PressableWithFeedback>
                    </View>

                    {/* End Reading */}
                    <View style={[styles.mb4, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                        <View style={[styles.flex1]}>
                            <TextInput
                                key={`end-${inputKey}`}
                                ref={endReadingInputRef}
                                label={translate('distance.odometer.endReading')}
                                accessibilityLabel={translate('distance.odometer.endReading')}
                                value={endReading}
                                onChangeText={handleEndReadingChange}
                                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                inputMode={CONST.INPUT_MODE.NUMERIC}
                            />
                        </View>
                        <PressableWithFeedback
                            accessible={false}
                            accessibilityRole="button"
                            onPress={() => {
                                if (odometerEndImage) {
                                    handleViewOdometerImage('end');
                                } else {
                                    handleCaptureImage('end');
                                }
                            }}
                            style={[
                                StyleUtils.getWidthAndHeightStyle(variables.h40, variables.w40),
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
                                fallbackIcon={Gallery}
                                fallbackIconSize={20}
                                fallbackIconColor={theme.icon}
                                iconSize="x-small"
                                loadingIconSize="small"
                                shouldUseInitialObjectPosition
                            />
                        </PressableWithFeedback>
                    </View>

                    {/* Total Distance Display - always shown, updated live */}
                    <View style={[styles.mb4, styles.borderRadiusComponentNormal, {backgroundColor: theme.componentBG}]}>
                        <Text style={[styles.textSupporting]}>
                            {`${translate('distance.odometer.totalDistance')}: ${totalDistance !== null ? roundToTwoDecimalPlaces(totalDistance) : '0'} ${unit}`}
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
                getHasUnsavedChanges={() => {
                    if (isSavedRef.current) {
                        return false;
                    }
                    const hasReadingChanges = startReading !== initialStartReadingRef.current || endReading !== initialEndReadingRef.current;
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
