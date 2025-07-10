/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import NumberWithUnitForm from '@components/NumberWithUnitForm';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {isArchivedReport, isPolicyExpenseChat} from '@libs/ReportUtils';
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
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreatingNewRequest = !(backTo || isEditing);
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`, {canBeMissing: true});
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});

    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (isSplitBill || !skipConfirmation || !report?.reportID) {
            return false;
        }

        return !(isArchivedReport(reportNameValuePairs) || isPolicyExpenseChat(report));
    }, [report, isSplitBill, skipConfirmation, reportNameValuePairs]);

    const navigateBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepDistanceManual.displayName}
            shouldShowNotFoundPage={false}
            shouldShowWrapper={!isCreatingNewRequest}
        >
            <NumberWithUnitForm
                policyID={report?.policyID}
                iouType={iouType}
                isEditing={!!backTo || isEditing}
                skipConfirmation={shouldSkipConfirmation ?? false}
                unit="KM"
                onSubmitButtonPress={() => {}}
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
