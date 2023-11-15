import lodashGet from 'lodash/get';
import React, {useCallback, useEffect, useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyTemporaryForRefactorRequestParticipantsSelector';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import StepScreenWrapper from './StepScreenWrapper';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /* Onyx Props */
    /** The report the transaction belongs to */
    report: reportPropTypes,

    /** The transaction object being modified in Onyx */
    transaction: transactionPropTypes,
};

const defaultProps = {
    report: {},
    transaction: {},
};

function IOURequestStepParticipants({
    route: {
        params: {iouType, reportID, transactionID},
    },
    report,
    transaction,
    transaction: {participants = []},
}) {
    const {translate} = useLocalize();
    const optionsSelectorRef = useRef();
    const selectedReportID = useRef(reportID);
    const numberOfParticipants = useRef(participants.length);
    const iouRequestType = TransactionUtils.getRequestType(transaction);
    const headerTitle = translate(TransactionUtils.getHeaderTitleTranslationKey(transaction));
    const receiptFilename = lodashGet(transaction, 'filename');
    const receiptPath = lodashGet(transaction, 'receipt.source');

    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    // This is because until the request is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the request process.
    useEffect(() => {
        IOUUtils.navigateToStartStepIfScanFileCannotBeRead(receiptFilename, receiptPath, () => {}, iouRequestType, iouType, transactionID, reportID);
    }, [receiptPath, receiptFilename, iouRequestType, iouType, transactionID, reportID]);

    const addParticipant = useCallback(
        (val) => {
            IOU.setMoneyRequestParticipants_temporaryForRefactor(transactionID, val);
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

    const goToNextStep = useCallback(() => {
        const nextStepIOUType = numberOfParticipants.current === 1 ? iouType : CONST.IOU.TYPE.SPLIT;
        Navigation.navigate(ROUTES.MONEYTEMPORARYFORREFACTOR_REQUEST_STEP_CONFIRMATION.getRoute(nextStepIOUType, transactionID, selectedReportID.current || reportID));
    }, [iouType, transactionID, reportID]);

    const navigateBack = useCallback(() => {
        IOUUtils.navigateToStartMoneyRequestStep(iouRequestType, iouType, transactionID, reportID);
    }, [iouRequestType, iouType, transactionID, reportID]);

    const iouTypeParamIsInvalid = !_.contains(_.values(CONST.IOU.TYPE), iouType);
    const canUserPerformWriteAction = ReportUtils.canUserPerformWriteAction(report);
    if (iouTypeParamIsInvalid || !canUserPerformWriteAction) {
        return <FullPageNotFoundView shouldShow />;
    }

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
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '0')}`,
    },
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${lodashGet(route, 'params.transactionID')}`,
    },
})(IOURequestStepParticipants);
