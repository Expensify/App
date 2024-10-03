import React, {useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import * as ReportUtils from '@libs/ReportUtils';
import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

// type ShareTabOnyxProps = {
//     transaction?: OnyxEntry<Transaction>;
// };

// type ShareTabProps = ShareTabOnyxProps;

// eslint-disable-next-line rulesdir/no-negated-variables
function SubmitTab({transaction}: {transaction: OnyxEntry<Transaction>}) {
    const optimisticReportID = ReportUtils.generateReportID();
    const selectedReportID = useRef(optimisticReportID);
    const numberOfParticipants = useRef(transaction?.participants?.length);

    // const goToNextStep = useCallback(() => {
    //     const nextStepIOUType = numberOfParticipants.current === 1 ? CONST.IOU.TYPE.REQUEST : CONST.IOU.TYPE.SPLIT;
    //     IOU.initMoneyRequest(optimisticReportID, false, CONST.IOU.REQUEST_TYPE.SCAN);
    //     IOU.setMoneyRequestTag(transactionID, '');
    //     IOU.setMoneyRequestCategory(transactionID, '');
    //     IOU.setMoneyRequestParticipants_temporaryForRefactor(transactionID, transaction?.participants ?? []);
    //     Navigation.navigate(ROUTES.SHARE_SCAN_CONFIRM.getRoute(nextStepIOUType, transactionID, selectedReportID.current || optimisticReportID));
    // }, [transactionID, optimisticReportID]);

    // const addParticipant = useCallback(
    //     (val: Participant[]) => {
    //         IOU.setMoneyRequestParticipants_temporaryForRefactor(transactionID, val);
    //         numberOfParticipants.current = val.length;

    //         // When multiple participants are selected, the reportID is generated at the end of the confirmation step.
    //         // So we are resetting selectedReportID ref to the reportID coming from params.
    //         if (val.length !== 1) {
    //             selectedReportID.current = optimisticReportID;
    //             return;
    //         }

    //         // When a participant is selected, the reportID needs to be saved because that's the reportID that will be used in the confirmation step.
    //         selectedReportID.current = val?.[0].reportID ?? optimisticReportID;
    //     },
    //     [optimisticReportID, transactionID],
    // );

    return (
        <MoneyRequestParticipantsSelector
            participants={transaction?.participants ?? []}
            iouType={CONST.IOU.TYPE.SUBMIT}
            onFinish={function (value?: string | undefined): void {
                throw new Error('Function not implemented.');
            }}
            onParticipantsAdded={function (value: Participant[]): void {
                throw new Error('Function not implemented.');
            }}
            iouRequestType="manual"
            action="create" // isScanRequest
        />
    );
}

export default SubmitTab;
