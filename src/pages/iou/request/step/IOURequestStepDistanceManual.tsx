/* eslint-disable @typescript-eslint/no-unused-vars */
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useMemo, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {isArchivedReport, isPolicyExpenseChat} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
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
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`, {canBeMissing: true});
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreatingNewRequest = !(backTo || isEditing);

    const unit = DistanceRequestUtils.getDistanceUnit(transaction);
    const distance = transaction?.comment?.customUnit?.quantity ? roundToTwoDecimalPlaces(transaction.comment.customUnit.quantity) : undefined;

    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (isSplitBill || !skipConfirmation || !report?.reportID) {
            return false;
        }

        return !(isArchivedReport(reportNameValuePairs) || isPolicyExpenseChat(report));
    }, [report, isSplitBill, skipConfirmation, reportNameValuePairs]);

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
            if (iouType === CONST.IOU.TYPE.SPLIT) {
                return translate('iou.split');
            }
            return translate('iou.createExpense');
        }

        return isCreatingNewRequest ? translate('common.next') : translate('common.save');
    }, [shouldSkipConfirmation, translate, isCreatingNewRequest, iouType]);

    const submitAndNavigateToNextPage = useCallback(() => {
        // TODO: Implement submit and navigate to next page
    }, []);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepDistanceManual.displayName}
            shouldShowNotFoundPage={false}
            shouldShowWrapper={!isCreatingNewRequest}
        >
            <NumberWithSymbolForm
                ref={textInput}
                value={distance?.toString()}
                decimals={CONST.DISTANCE_DECIMAL_PLACES}
                symbol={unit}
                symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX}
                isSymbolPressable={false}
                symbolTextStyle={styles.textSupporting}
                style={styles.iouAmountTextInput}
                containerStyle={styles.iouAmountTextInputContainer}
                touchableInputWrapperStyle={styles.heightUndefined}
                autoGrowExtraSpace={variables.w80}
                footer={
                    <Button
                        success
                        // Prevent bubbling on edit amount Page to prevent double page submission when two CTA are stacked.
                        allowBubble={!isEditing}
                        pressOnEnter
                        medium={isExtraSmallScreenHeight}
                        large={!isExtraSmallScreenHeight}
                        style={[styles.w100, canUseTouchScreen() ? styles.mt5 : styles.mt0]}
                        onPress={() => submitAndNavigateToNextPage()}
                        text={buttonText}
                        testID="next-button"
                    />
                }
            />
        </StepScreenWrapper>
    );
}

IOURequestStepDistanceManual.displayName = 'IOURequestStepDistanceManual';

const IOURequestStepDistanceManualWithOnyx = IOURequestStepDistanceManual;

const IOURequestStepDistanceManualWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceManualWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceManualWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceManualWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceManualWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceManualWithWritableReportOrNotFound);

export default IOURequestStepDistanceManualWithFullTransactionOrNotFound;
