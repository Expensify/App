import React, {useRef, useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneeRequestParticipantsSelector';
import Navigation from '@libs/Navigation/Navigation';
import * as IOU from '@userActions/IOU';
import useLocalize from '@hooks/useLocalize';
import transactionPropTypes from '@components/transactionPropTypes';
import * as TransactionUtils from '@libs/TransactionUtils';
import StepScreenWrapper from './StepScreenWrapper';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /* Onyx Props */
    /** The transaction object being modified in Onyx */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

function IOURequestStepParticipants({
    route: {
        params: {iouType, reportID, transactionID},
    },
    transaction,
    transaction: {participants = []},
}) {
    const {translate} = useLocalize();
    const optionsSelectorRef = useRef();
    const selectedReportID = useRef(reportID);
    const numberOfParticipants = useRef(participants.length);
    const iouRequestType = TransactionUtils.getRequestType(transaction);
    const headerTitle = translate(TransactionUtils.getHeaderTitle(transaction));

    const addParticipant = useCallback(
        (val) => {
            IOU.setMoneeRequestParticipants_temporaryForRefactor(transactionID, val);
            numberOfParticipants.current = val.length;

            // When multiple participants are selected, the reportID is generated at the end of the confirmation step.
            if (val.length !== 1) {
                return;
            }

            // When a participant is selected, the reportID needs to be saved because that's the reportID that will be used in the confirmation step.
            selectedReportID.current = lodashGet(val, '[0].reportID', reportID);
        },
        [reportID, transactionID],
    );

    const goToNextStep = () => {
        const nextStepIOUType = numberOfParticipants.current === 1 ? iouType : CONST.IOU.TYPE.SPLIT;
        Navigation.navigate(ROUTES.MONEE_REQUEST_STEP.getRoute(nextStepIOUType, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, selectedReportID.current || reportID), true);
    };

    const navigateBack = () => {
        Navigation.goBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={headerTitle}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepParticipants.displayName}
            onEntryTransitionEnd={() => optionsSelectorRef.current && optionsSelectorRef.current.focus()}
        >
            <MoneyRequestParticipantsSelector
                ref={(el) => (optionsSelectorRef.current = el)}
                participants={participants}
                onParticipantsAdded={addParticipant}
                onFinish={goToNextStep}
                iouType={iouType}
                iouRequestType={iouRequestType}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepParticipants.displayName = 'IOURequestStepParticipants';
IOURequestStepParticipants.propTypes = propTypes;
IOURequestStepParticipants.defaultProps = defaultProps;

export default withOnyx({
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID')}`,
    },
})(IOURequestStepParticipants);
