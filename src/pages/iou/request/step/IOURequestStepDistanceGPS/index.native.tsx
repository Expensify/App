import React, {useState} from 'react';
import {View} from 'react-native';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import CONST from '@src/CONST';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import Disclaimer from './Disclaimer';
import DistanceCounter from './DistanceCounter';
import GPSButtons from './GPSButtons';
import type IOURequestStepDistanceGPSProps from './types';
import Waypoints from './Waypoints';

function IOURequestStepDistanceGPS({
    report,
    route: {
        params: {action, iouType, reportActionID},
    },
    transaction,
}: IOURequestStepDistanceGPSProps) {
    const styles = useThemeStyles();

    const {translate} = useLocalize();

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreatingNewRequest = !isEditing;
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);

    const [shouldShowStartError, setShouldShowStartError] = useState(false);
    const [shouldShowPermissionsError, setShouldShowPermissionsError] = useState(false);

    const getError = (): Errors => {
        if (shouldShowStartError) {
            return {startError: translate('gps.error.failedToStart')};
        }
        if (shouldShowPermissionsError) {
            return {permissionsError: translate('gps.error.failedToGetPermissions')};
        }
        return {};
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={() => Navigation.goBack()}
            testID="IOURequestStepDistanceGPS"
            shouldShowNotFoundPage={shouldShowNotFoundPage}
            shouldShowWrapper={!isCreatingNewRequest}
        >
            <DistanceCounter
                report={report}
                transaction={transaction}
            />
            <View style={[styles.w100, styles.pAbsolute, styles.b0, styles.r0, styles.l0]}>
                <Waypoints />
                <Disclaimer />
                <DotIndicatorMessage
                    style={[styles.ph5, styles.pb3]}
                    messages={getError()}
                    type="error"
                />
                <GPSButtons
                    // todo: next step navigation will be added in a separate PR
                    navigateToNextStep={() => {}}
                    setShouldShowStartError={setShouldShowStartError}
                    setShouldShowPermissionsError={setShouldShowPermissionsError}
                />
            </View>
        </StepScreenWrapper>
    );
}

const IOURequestStepDistanceGPSWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceGPS);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceGPSWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceGPSWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceGPSWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceGPSWithWritableReportOrNotFound);

export default IOURequestStepDistanceGPSWithFullTransactionOrNotFound;
