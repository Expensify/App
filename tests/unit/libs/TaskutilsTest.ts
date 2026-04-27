import CONST from '../../../src/CONST';
import {getTaskTitle, isTaskCompleted} from '../../../src/libs/TaskUtils';
import type ReportAction from '../../../src/types/onyx/ReportAction';
import {createRegularTaskReport} from '../../utils/collections/reports';

jest.mock('../../../src/libs/Localize');

describe('TaskUtils', () => {
    describe('getTaskTitle', () => {
        it('should return the task title from the report', () => {
            const taskReport = createRegularTaskReport(1, 123);
            taskReport.reportName = '<b>Task</b> Title';
            expect(getTaskTitle(taskReport)).toBe('Task Title');
        });

        it('should return the fallback title if reportName is not present', () => {
            const taskReport = {reportID: '123'};
            expect(getTaskTitle(taskReport, 'Fallback Title')).toBe('Fallback Title');
        });

        it('should return the fallback title if reportID is not present', () => {
            const taskReport = createRegularTaskReport(1, 123);
            taskReport.reportID = '';
            expect(getTaskTitle(taskReport, 'Fallback Title')).toBe('Fallback Title');
        });

        it('should return the title in markdown if shouldReturnMarkdown is true', () => {
            const taskReport = createRegularTaskReport(1, 123);
            taskReport.reportName = '<b>Task</b> Title';
            expect(getTaskTitle(taskReport, '', true)).toBe('*Task* Title');
        });
    });

    describe('isTaskCompleted', () => {
        it('should return true when both childStateNum and childStatusNum indicate completion', () => {
            const reportAction = {
                childStateNum: CONST.REPORT.STATE_NUM.APPROVED,
                childStatusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            } as ReportAction;

            expect(isTaskCompleted(reportAction)).toBe(true);
        });

        it('should return false when childStateNum is not APPROVED', () => {
            const reportAction = {
                childStateNum: CONST.REPORT.STATE_NUM.OPEN,
                childStatusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            } as ReportAction;

            expect(isTaskCompleted(reportAction)).toBe(false);
        });

        it('should return false when childStatusNum is not APPROVED', () => {
            const reportAction = {
                childStateNum: CONST.REPORT.STATE_NUM.APPROVED,
                childStatusNum: CONST.REPORT.STATUS_NUM.OPEN,
            } as ReportAction;

            expect(isTaskCompleted(reportAction)).toBe(false);
        });

        it('should return false for undefined reportAction', () => {
            expect(isTaskCompleted(undefined)).toBe(false);
        });
    });
});
