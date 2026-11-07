import {isDynamicExternalWorkflowApproveFailedAction} from '@libs/ReportActionTypeGuards';

import CONST from '@src/CONST';
import type ReportAction from '@src/types/onyx/ReportAction';

import createRandomReportAction from '../utils/collections/reportActions';

describe('isDynamicExternalWorkflowApproveFailedAction', () => {
    it('returns true for a DEW_APPROVE_FAILED action', () => {
        const action: ReportAction = {
            ...createRandomReportAction(0),
            actionName: CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED,
            created: '2025-11-21',
            reportActionID: '1',
            message: [],
            previousMessage: [],
        };

        expect(isDynamicExternalWorkflowApproveFailedAction(action)).toBe(true);
    });

    it('returns false for a non DEW_APPROVE_FAILED action', () => {
        const action: ReportAction = {
            ...createRandomReportAction(0),
            actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
            created: '2025-11-21',
            reportActionID: '1',
            message: [],
            previousMessage: [],
        };

        expect(isDynamicExternalWorkflowApproveFailedAction(action)).toBe(false);
    });

    it('returns false for a null action', () => {
        expect(isDynamicExternalWorkflowApproveFailedAction(null)).toBe(false);
    });
});
