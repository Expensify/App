import {getReportLayoutGroupBy, getReportLayoutSelection, isMatrixLayout, setReportLayout} from '@libs/actions/ReportLayout';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';

jest.mock('@libs/API');

const mockWrite = jest.mocked(API.write);

const LAYOUT_OPTION_NVP_NAME = 'expensify_layoutOption';
const GROUP_BY_OPTION_NVP_NAME = 'expensify_groupByOption';
const NAME_VALUE_PAIRS_KEY_PREFIX = 'nameValuePairs[';

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
    return typeof value === 'object' && value !== null;
}

function isStringRecord(value: unknown): value is Record<string, string> {
    return isRecord(value) && Object.values(value).every((entry) => typeof entry === 'string');
}

const getWrittenNameValuePairs = (callIndex = 0): Record<string, string> => {
    const params = mockWrite.mock.calls.at(callIndex)?.[1];
    if (!isStringRecord(params)) {
        return {};
    }

    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
        if (!key.startsWith(NAME_VALUE_PAIRS_KEY_PREFIX) || !key.endsWith(']')) {
            continue;
        }
        const nvpName = key.slice(NAME_VALUE_PAIRS_KEY_PREFIX.length, -1);
        result[nvpName] = value;
    }
    return result;
};

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
        mockWrite.mockClear();
    });

    it('writes layoutOption=matrix and clears groupByOption atomically when None is selected', () => {
        setReportLayout(CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX, null, CONST.REPORT_LAYOUT.GROUP_BY.TAG);

        expect(mockWrite).toHaveBeenCalledTimes(1);
        expect(mockWrite.mock.calls.at(0)?.[0]).toBe(WRITE_COMMANDS.SET_NAME_VALUE_PAIRS);
        expect(getWrittenNameValuePairs()).toEqual({
            [LAYOUT_OPTION_NVP_NAME]: CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX,
            [GROUP_BY_OPTION_NVP_NAME]: '',
        });
    });

    it('writes only groupByOption when Category or Tag is selected without a prior matrix layout', () => {
        setReportLayout(CONST.REPORT_LAYOUT.GROUP_BY.TAG, null, null);

        expect(mockWrite).toHaveBeenCalledTimes(1);
        expect(mockWrite.mock.calls.at(0)?.[0]).toBe(WRITE_COMMANDS.SET_NAME_VALUE_PAIRS);
        expect(getWrittenNameValuePairs()).toEqual({[GROUP_BY_OPTION_NVP_NAME]: CONST.REPORT_LAYOUT.GROUP_BY.TAG});
    });

    it('clears the matrix layout atomically when switching from None back to Category or Tag', () => {
        setReportLayout(CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY, CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX, null);

        expect(mockWrite).toHaveBeenCalledTimes(1);
        expect(mockWrite.mock.calls.at(0)?.[0]).toBe(WRITE_COMMANDS.SET_NAME_VALUE_PAIRS);
        expect(getWrittenNameValuePairs()).toEqual({
            [GROUP_BY_OPTION_NVP_NAME]: CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY,
            [LAYOUT_OPTION_NVP_NAME]: '',
        });
    });

    it('never falls back to the singular SetNameValuePair command', () => {
        setReportLayout(CONST.REPORT_LAYOUT.GROUP_BY.TAG, null, null);

        expect(mockWrite).not.toHaveBeenCalledWith(WRITE_COMMANDS.SET_NAME_VALUE_PAIR, expect.any(Object), expect.any(Object));
    });

    it('sends each NVP as its own nameValuePairs[<name>] form field so PHP parses it as an associative array', () => {
        setReportLayout(CONST.REPORT_LAYOUT.GROUP_BY.TAG, null, null);

        expect(mockWrite.mock.calls.at(0)?.[1]).toEqual({
            [`nameValuePairs[${GROUP_BY_OPTION_NVP_NAME}]`]: CONST.REPORT_LAYOUT.GROUP_BY.TAG,
        });
    });
});

describe('isMatrixLayout', () => {
    it('returns true when storedValue is matrix', () => {
        expect(isMatrixLayout(CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX)).toBe(true);
    });

    it('returns false when storedValue is detailed', () => {
        expect(isMatrixLayout(CONST.REPORT_LAYOUT.LAYOUT_OPTION.DETAILED)).toBe(false);
    });

    it('returns false when storedValue is null or undefined', () => {
        expect(isMatrixLayout(null)).toBe(false);
        expect(isMatrixLayout(undefined)).toBe(false);
    });

    it('returns false for any other value', () => {
        expect(isMatrixLayout('something-else')).toBe(false);
    });
});

describe('getReportLayoutSelection', () => {
    it('returns MATRIX when the layout option is matrix, regardless of group-by', () => {
        expect(getReportLayoutSelection(CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX, CONST.REPORT_LAYOUT.GROUP_BY.TAG)).toBe(CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX);
        expect(getReportLayoutSelection(CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX, null)).toBe(CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX);
    });

    it('returns the group-by value when the layout option is not matrix', () => {
        expect(getReportLayoutSelection(null, CONST.REPORT_LAYOUT.GROUP_BY.TAG)).toBe(CONST.REPORT_LAYOUT.GROUP_BY.TAG);
        expect(getReportLayoutSelection(CONST.REPORT_LAYOUT.LAYOUT_OPTION.DETAILED, CONST.REPORT_LAYOUT.GROUP_BY.TAG)).toBe(CONST.REPORT_LAYOUT.GROUP_BY.TAG);
    });

    it('defaults to CATEGORY when neither NVP is set', () => {
        expect(getReportLayoutSelection(null, null)).toBe(CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY);
        expect(getReportLayoutSelection(undefined, undefined)).toBe(CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY);
    });
});
