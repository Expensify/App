import {getTaskTitle} from '../../../src/libs/TaskUtils';
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
});
