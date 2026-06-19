import {renderHook} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import type {SearchTextFilterKeys} from '@components/Search/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {translateLocal} from '../../utils/TestHelper';

function wrapper({children}: {children: React.ReactNode}) {
    return React.createElement(LocaleContextProvider, null, children);
}

function renderValidationHook(filterKey: SearchTextFilterKeys, value: string | undefined, onError?: (error: string | undefined) => void) {
    return renderHook(({key, val}: {key: SearchTextFilterKeys; val: string | undefined}) => useTextFilterValidation(key, val, onError), {
        wrapper,
        initialProps: {key: filterKey, val: value},
    });
}

const expectedError = (length: number, limit: number) => translateLocal('common.error.characterLimitExceedCounter', length, limit);

describe('useTextFilterValidation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('returns undefined when the value is within the limit', () => {
        const {result} = renderValidationHook(CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION, 'short value');
        expect(result.current).toBeUndefined();
    });

    it('returns undefined for an undefined value', () => {
        const {result} = renderValidationHook(CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION, undefined);
        expect(result.current).toBeUndefined();
    });

    it('returns an error when the description value exceeds DESCRIPTION_LIMIT', () => {
        const length = CONST.DESCRIPTION_LIMIT + 1;
        const value = 'x'.repeat(length);
        const {result} = renderValidationHook(CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION, value);
        expect(result.current).toBe(expectedError(length, CONST.DESCRIPTION_LIMIT));
    });

    it('uses MERCHANT_NAME_MAX_BYTES for the merchant filter', () => {
        const length = CONST.MERCHANT_NAME_MAX_BYTES + 1;
        const value = 'x'.repeat(length);
        const {result} = renderValidationHook(CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT, value);
        expect(result.current).toBe(expectedError(length, CONST.MERCHANT_NAME_MAX_BYTES));
    });

    it('uses TASK_TITLE_CHARACTER_LIMIT for the title filter', () => {
        const length = CONST.TASK_TITLE_CHARACTER_LIMIT + 1;
        const value = 'x'.repeat(length);
        const {result} = renderValidationHook(CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE, value);
        expect(result.current).toBe(expectedError(length, CONST.TASK_TITLE_CHARACTER_LIMIT));
    });

    it('falls back to MAX_COMMENT_LENGTH for filters without a specific limit', () => {
        const length = CONST.MAX_COMMENT_LENGTH + 1;
        const value = 'x'.repeat(length);
        const {result} = renderValidationHook(CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD, value);
        expect(result.current).toBe(expectedError(length, CONST.MAX_COMMENT_LENGTH));
    });

    it('trims the value before measuring its length', () => {
        // The trimmed value is exactly at the limit, so the surrounding whitespace should be ignored.
        const value = `  ${'x'.repeat(CONST.DESCRIPTION_LIMIT)}  `;
        const {result} = renderValidationHook(CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION, value);
        expect(result.current).toBeUndefined();
    });

    it('measures byte length for multi-byte characters', () => {
        // Each "😀" is 4 UTF-8 bytes, so DESCRIPTION_LIMIT / 4 + 1 emojis exceed the byte limit.
        const emojiCount = Math.floor(CONST.DESCRIPTION_LIMIT / 4) + 1;
        const value = '😀'.repeat(emojiCount);
        const {result} = renderValidationHook(CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION, value);
        expect(result.current).toBe(expectedError(emojiCount * 4, CONST.DESCRIPTION_LIMIT));
    });

    it('calls onError with the error message when the value is invalid', () => {
        const onError = jest.fn();
        const length = CONST.DESCRIPTION_LIMIT + 1;
        renderValidationHook(CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION, 'x'.repeat(length), onError);
        expect(onError).toHaveBeenCalledWith(expectedError(length, CONST.DESCRIPTION_LIMIT));
    });

    it('calls onError with undefined when the value is valid', () => {
        const onError = jest.fn();
        renderValidationHook(CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION, 'short value', onError);
        expect(onError).toHaveBeenCalledWith(undefined);
    });

    it('calls onError again when the error changes from valid to invalid', () => {
        const onError = jest.fn();
        const length = CONST.DESCRIPTION_LIMIT + 1;
        const {rerender} = renderValidationHook(CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION, 'short value', onError);

        expect(onError).toHaveBeenLastCalledWith(undefined);

        rerender({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION, val: 'x'.repeat(length)});

        expect(onError).toHaveBeenLastCalledWith(expectedError(length, CONST.DESCRIPTION_LIMIT));
    });
});
