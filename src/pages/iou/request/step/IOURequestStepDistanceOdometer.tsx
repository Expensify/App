/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import Button from '@components/Button';
import Text from '@components/Text';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ReceiptImage from '@components/ReceiptImage';
import TextInput from '@components/TextInput';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import {Gallery} from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {setMoneyRequestOdometerReading, setMoneyRequestOdometerImage, setMoneyRequestDistance} from '@libs/actions/IOU';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import FormHelpMessage from '@components/FormHelpMessage';

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

    const startReadingInputRef = useRef<any>(null);
    const endReadingInputRef = useRef<any>(null);

    const [startReading, setStartReading] = useState<string>('');
    const [endReading, setEndReading] = useState<string>('');
    const [formError, setFormError] = useState<string>('');

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreatingNewRequest = !(backTo || isEditing);
    const isTransactionDraft = shouldUseTransactionDraft(action, iouType);

    // Get odometer readings from transaction
    const odometerStart = transaction?.comment?.odometerStart;
    const odometerEnd = transaction?.comment?.odometerEnd;
    const odometerStartImage = transaction?.comment?.odometerStartImage;
    const odometerEndImage = transaction?.comment?.odometerEndImage;

    // Initialize readings from transaction
    useEffect(() => {
        if (odometerStart !== undefined && odometerStart !== null) {
            setStartReading(odometerStart.toString());
        }
        if (odometerEnd !== undefined && odometerEnd !== null) {
            setEndReading(odometerEnd.toString());
        }
    }, [odometerStart, odometerEnd]);

    // Calculate total distance - updated live after every input change
    const totalDistance = useMemo(() => {
        const start = parseFloat(startReading);
        const end = parseFloat(endReading);
        if (isNaN(start) || isNaN(end) || !startReading || !endReading) {
            return null;
        }
        return end - start;
    }, [startReading, endReading]);

    // Get image source for web (blob URL) or native (URI string)
    const getImageSource = useCallback((image: File | string | undefined): string | undefined => {
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
            const digitsOnly = text.replace(/[^0-9]/g, '');
            setStartReading(digitsOnly);
            if (formError) {
                setFormError('');
            }
            // Save to transaction immediately
            const startValue = digitsOnly ? parseFloat(digitsOnly) : null;
            const endValue = endReading ? parseFloat(endReading) : null;
            if (startValue !== null && !isNaN(startValue)) {
                setMoneyRequestOdometerReading(transactionID, startValue, endValue ?? null, isTransactionDraft);
            }
        },
        [endReading, formError, transactionID, isTransactionDraft],
    );

    const handleEndReadingChange = useCallback(
        (text: string) => {
            // Only allow digits
            const digitsOnly = text.replace(/[^0-9]/g, '');
            setEndReading(digitsOnly);
            if (formError) {
                setFormError('');
            }
            // Save to transaction immediately
            const startValue = startReading ? parseFloat(startReading) : null;
            const endValue = digitsOnly ? parseFloat(digitsOnly) : null;
            if (endValue !== null && !isNaN(endValue)) {
                setMoneyRequestOdometerReading(transactionID, startValue ?? null, endValue, isTransactionDraft);
            }
        },
        [startReading, formError, transactionID, isTransactionDraft],
    );

    const handleCaptureImage = useCallback(
        (imageType: 'start' | 'end') => {
            // Navigate to AttachOdometerReading route
            // For now, we'll use a placeholder route - this will be implemented in a later step
            // Navigation.navigate(ROUTES.ODOMETER_IMAGE.getRoute(transactionID, imageType, Navigation.getActiveRouteWithoutParams()));
        },
        [transactionID],
    );

    const handleNext = useCallback(() => {
        // Validation
        if (!startReading || !endReading) {
            setFormError(translate('distance.odometer.readingRequired'));
            return;
        }

        const start = parseFloat(startReading);
        const end = parseFloat(endReading);

        if (isNaN(start) || isNaN(end)) {
            setFormError(translate('distance.odometer.readingRequired'));
            return;
        }

        const distance = end - start;
        if (distance <= 0) {
            setFormError(translate('distance.odometer.negativeDistanceNotAllowed'));
            return;
        }

        // Save readings
        setMoneyRequestOdometerReading(transactionID, start, end, isTransactionDraft);
        // Calculate and save total distance
        const distanceAsFloat = roundToTwoDecimalPlaces(distance);
        setMoneyRequestDistance(transactionID, distanceAsFloat, isTransactionDraft);

        if (isEditing) {
            // Update existing transaction
            // TODO: Implement update logic similar to updateMoneyRequestDistance
            Navigation.goBack(backTo);
            return;
        }

        // Navigate to confirmation page
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, backToReport));
    }, [startReading, endReading, transactionID, isTransactionDraft, isEditing, backTo, iouType, reportID, backToReport, translate]);

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
                                ref={startReadingInputRef}
                                label={translate('distance.odometer.startReading')}
                                value={startReading}
                                onChangeText={handleStartReadingChange}
                                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                inputMode={CONST.INPUT_MODE.NUMERIC}
                            />
                        </View>
                        <PressableWithFeedback
                            accessible={false}
                            onPress={() => handleCaptureImage('start')}
                            style={[
                                StyleUtils.getWidthAndHeightStyle(variables.h40, variables.w40),
                                StyleUtils.getBorderRadiusStyle(variables.componentBorderRadiusMedium),
                                styles.overflowHidden,
                                StyleUtils.getBackgroundColorStyle(theme.border),
                            ]}
                        >
                            <ReceiptImage
                                source={startImageSource ? startImageSource : ''}
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
                                ref={endReadingInputRef}
                                label={translate('distance.odometer.endReading')}
                                value={endReading}
                                onChangeText={handleEndReadingChange}
                                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                inputMode={CONST.INPUT_MODE.NUMERIC}
                            />
                        </View>
                        <PressableWithFeedback
                            accessible={false}
                            onPress={() => handleCaptureImage('end')}
                            style={[
                                StyleUtils.getWidthAndHeightStyle(variables.h40, variables.w40),
                                StyleUtils.getBorderRadiusStyle(variables.componentBorderRadiusMedium),
                                styles.overflowHidden,
                                StyleUtils.getBackgroundColorStyle(theme.border),
                            ]}
                        >
                            <ReceiptImage
                                source={endImageSource ? endImageSource : ''}
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
                    <View style={[styles.mb4, styles.p3, styles.borderRadiusComponentNormal, {backgroundColor: theme.componentBG}]}>
                        <Text style={[styles.textStrong]}>
                            {translate('distance.odometer.totalDistance')}:{' '}
                            {totalDistance !== null ? roundToTwoDecimalPlaces(totalDistance) : '—'}
                        </Text>
                    </View>
                </View>
                <View>
                    {/* Form Error Message */}
                    {formError && (
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
