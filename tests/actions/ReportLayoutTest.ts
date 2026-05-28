import {getReportLayoutGroupBy, setReportLayout} from '@libs/actions/ReportLayout';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';

jest.mock('@libs/API');

const mockAPI = API as jest.Mocked<typeof API>;

describe('getReportLayoutGroupBy', () => {
    it('returns CATEGORY when storedValue is null', () => {
        expect(getReportLayoutGroupBy(null)).toBe(CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY);
    });

    it('returns CATEGORY when storedValue is undefined', () => {
        expect(getReportLayoutGroupBy(undefined)).toBe(CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY);
    });

    it('returns CATEGORY when storedValue is empty string', () => {
        expect(getReportLayoutGroupBy('')).toBe(CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY);
    });

    it('returns the stored value when it is CATEGORY', () => {
        expect(getReportLayoutGroupBy(CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY)).toBe(CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY);
    });

    it('returns the stored value when it is TAG', () => {
        expect(getReportLayoutGroupBy(CONST.REPORT_LAYOUT.GROUP_BY.TAG)).toBe(CONST.REPORT_LAYOUT.GROUP_BY.TAG);
    });

    it('returns the stored value as-is for any non-empty string', () => {
        expect(getReportLayoutGroupBy('customValue')).toBe('customValue');
    });
});

describe('setReportLayout', () => {
    beforeEach(() => {
        mockAPI.write.mockClear();
    });

    it('sets matrix layout and removes the group-by field when None is selected', () => {
        setReportLayout(CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX, null, CONST.REPORT_LAYOUT.GROUP_BY.TAG);

        expect(mockAPI.write).toHaveBeenCalledWith(WRITE_COMMANDS.SET_NAME_VALUE_PAIR, {name: 'expensify_layoutOption', value: CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX}, expect.any(Object));
        expect(mockAPI.write).toHaveBeenCalledWith(WRITE_COMMANDS.SET_NAME_VALUE_PAIR, {name: 'expensify_groupByOption', value: ''}, expect.any(Object));
    });

    it('sets the group-by field when Category or Tag is selected', () => {
        setReportLayout(CONST.REPORT_LAYOUT.GROUP_BY.TAG, null, null);

        expect(mockAPI.write).toHaveBeenCalledWith(WRITE_COMMANDS.SET_NAME_VALUE_PAIR, {name: 'expensify_groupByOption', value: CONST.REPORT_LAYOUT.GROUP_BY.TAG}, expect.any(Object));
    });

    it('does not touch the layout option when switching group-by without a matrix layout', () => {
        setReportLayout(CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY, null, CONST.REPORT_LAYOUT.GROUP_BY.TAG);

        expect(mockAPI.write).not.toHaveBeenCalledWith(WRITE_COMMANDS.SET_NAME_VALUE_PAIR, expect.objectContaining({name: 'expensify_layoutOption'}), expect.any(Object));
    });

    it('clears the matrix layout when switching from None to Category or Tag', () => {
        setReportLayout(CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY, CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX, null);

        expect(mockAPI.write).toHaveBeenCalledWith(WRITE_COMMANDS.SET_NAME_VALUE_PAIR, {name: 'expensify_groupByOption', value: CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY}, expect.any(Object));
        expect(mockAPI.write).toHaveBeenCalledWith(WRITE_COMMANDS.SET_NAME_VALUE_PAIR, {name: 'expensify_layoutOption', value: ''}, expect.any(Object));
    });
});
