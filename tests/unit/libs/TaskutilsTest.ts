import Navigation from '../../../src/libs/Navigation/Navigation';
import {getTaskTitle, isActiveTaskEditRoute} from '../../../src/libs/TaskUtils';
import {createRegularTaskReport} from '../../utils/collections/reports';

jest.mock('../../../src/libs/Localize');
jest.mock('../../../src/libs/Navigation/Navigation', () => ({
    default: {
        getActiveRoute: jest.fn(),
    },
}));

const mockGetActiveRoute = jest.mocked(Navigation.getActiveRoute);

describe('TaskUtils', () => {
    describe('isActiveTaskEditRoute', () => {
        beforeEach(() => {
            mockGetActiveRoute.mockReset();
        });

        it('returns false when reportID is undefined', () => {
            mockGetActiveRoute.mockReturnValue('r/123/title');
            expect(isActiveTaskEditRoute(undefined)).toBe(false);
            expect(mockGetActiveRoute).not.toHaveBeenCalled();
        });

        it('returns false when reportID is an empty string', () => {
            mockGetActiveRoute.mockReturnValue('r/123/title');
            expect(isActiveTaskEditRoute('')).toBe(false);
            expect(mockGetActiveRoute).not.toHaveBeenCalled();
        });

        it('returns false when getActiveRoute returns undefined', () => {
            mockGetActiveRoute.mockReturnValue(undefined);
            expect(isActiveTaskEditRoute('123')).toBe(false);
        });

        it('returns false when getActiveRoute returns an empty string', () => {
            mockGetActiveRoute.mockReturnValue('');
            expect(isActiveTaskEditRoute('123')).toBe(false);
        });

        it('returns true for canonical task title path', () => {
            mockGetActiveRoute.mockReturnValue('r/123/title');
            expect(isActiveTaskEditRoute('123')).toBe(true);
        });

        it('returns true when path has a leading slash', () => {
            mockGetActiveRoute.mockReturnValue('/r/123/title');
            expect(isActiveTaskEditRoute('123')).toBe(true);
        });

        it('returns true when path has query params (stripped before matching)', () => {
            mockGetActiveRoute.mockReturnValue('r/123/title?backTo=r%2F456');
            expect(isActiveTaskEditRoute('123')).toBe(true);
        });

        it('returns true when path has a trailing slash', () => {
            mockGetActiveRoute.mockReturnValue('r/123/title/');
            expect(isActiveTaskEditRoute('123')).toBe(true);
        });

        it('returns true for search report path with dynamic title suffix', () => {
            mockGetActiveRoute.mockReturnValue('search/view/123/title');
            expect(isActiveTaskEditRoute('123')).toBe(true);
        });

        it('returns true for task description path', () => {
            mockGetActiveRoute.mockReturnValue('r/123/description');
            expect(isActiveTaskEditRoute('123')).toBe(true);
        });

        it('returns true for task assignee path', () => {
            mockGetActiveRoute.mockReturnValue('r/123/assignee');
            expect(isActiveTaskEditRoute('123')).toBe(true);
        });

        it('returns false when reportID in path does not match', () => {
            mockGetActiveRoute.mockReturnValue('r/456/title');
            expect(isActiveTaskEditRoute('123')).toBe(false);
        });

        it('returns false for unrelated routes', () => {
            mockGetActiveRoute.mockReturnValue('inbox');
            expect(isActiveTaskEditRoute('123')).toBe(false);
        });

        it('returns false when path has extra segments after the task edit suffix', () => {
            mockGetActiveRoute.mockReturnValue('r/123/title/extra');
            expect(isActiveTaskEditRoute('123')).toBe(false);
        });
    });

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
