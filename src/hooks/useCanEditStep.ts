import {useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import {canEditFieldOfMoneyRequest} from '@libs/ReportUtils';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxInputOrEntry, Report} from '@src/types/onyx';
import useOnyx from './useOnyx';

const useCanEditStep = (action: IOUAction, iouType: IOUType, report: OnyxInputOrEntry<Report>, fieldToEdit: ValueOf<typeof CONST.EDIT_REQUEST_FIELD>) => {
    const reportActionsReportID = useMemo(() => {
        let actionsReportID;
        if (action === CONST.IOU.ACTION.EDIT) {
            actionsReportID = iouType === CONST.IOU.TYPE.SPLIT ? report?.reportID : report?.parentReportID;
        }
        return actionsReportID;
    }, [action, iouType, report?.reportID, report?.parentReportID]);

    const [reportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportActionsReportID}`, {
        canEvict: false,
        canBeMissing: true,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        selector: (reportActions) => reportActions?.[`${report?.parentReportActionID}`],
    });
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const canEdit = isEditing && canEditFieldOfMoneyRequest(reportAction, fieldToEdit);
    return [canEdit];
};

export default useCanEditStep;
