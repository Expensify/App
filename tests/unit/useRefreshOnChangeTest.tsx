import {act, renderHook} from '@testing-library/react-native';

import type {DynamicFormValues} from '@components/DynamicForm/types';
import useRefreshOnChange, {REFRESH_DEBOUNCE_MS} from '@components/DynamicForm/useRefreshOnChange';

import {setDraftValues} from '@userActions/FormActions';

import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormField} from '@src/types/onyx';

import refreshAfter from '../fixtures/dynamicForm/refreshAfter';
import refreshBefore from '../fixtures/dynamicForm/refreshBefore';

jest.mock('@userActions/FormActions', () => ({
    setDraftValues: jest.fn(),
}));

const FORM_ID = ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM;
const COUNTRY_KEY = 'address.country';

const STATE_KEY = 'address.state';

const initialValues: DynamicFormValues = {sortCode: '401276', accountNumber: '12345678', [COUNTRY_KEY]: 'GB'};

function renderRefreshHook(fields: DynamicFormField[], values: DynamicFormValues) {
    const fetch = jest.fn();
    const resetToPage = jest.fn();
    const hook = renderHook(
        (props: {fields: DynamicFormField[]; values: DynamicFormValues}) => useRefreshOnChange({...props, fetch, formID: FORM_ID, currentPageName: 'account-details', resetToPage}),
        {
            initialProps: {fields, values},
        },
    );
    return {...hook, fetch, resetToPage};
}

describe('useRefreshOnChange', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.mocked(setDraftValues).mockClear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('calls fetch with current values when a refreshOnChange field changes', () => {
        const {rerender, fetch} = renderRefreshHook(refreshBefore, initialValues);

        act(() => jest.advanceTimersByTime(REFRESH_DEBOUNCE_MS));
        expect(fetch).not.toHaveBeenCalled();

        rerender({fields: refreshBefore, values: {...initialValues, sortCode: '000000'}});
        act(() => jest.advanceTimersByTime(REFRESH_DEBOUNCE_MS));
        expect(fetch).not.toHaveBeenCalled();

        const changedValues = {...initialValues, [COUNTRY_KEY]: 'US'};
        rerender({fields: refreshBefore, values: changedValues});
        expect(fetch).not.toHaveBeenCalled();
        act(() => jest.advanceTimersByTime(REFRESH_DEBOUNCE_MS));
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(changedValues);
    });

    it('debounces rapid changes into one fetch', () => {
        const {rerender, fetch} = renderRefreshHook(refreshBefore, initialValues);

        rerender({fields: refreshBefore, values: {...initialValues, [COUNTRY_KEY]: 'US'}});
        act(() => jest.advanceTimersByTime(REFRESH_DEBOUNCE_MS / 2));
        rerender({fields: refreshBefore, values: {...initialValues, [COUNTRY_KEY]: 'DE'}});
        act(() => jest.advanceTimersByTime(REFRESH_DEBOUNCE_MS));

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith({...initialValues, [COUNTRY_KEY]: 'DE'});
    });

    it('after a schema replace, keeps drafts for surviving keys and clears removed ones', () => {
        const usValues = {...initialValues, [COUNTRY_KEY]: 'US', [STATE_KEY]: 'CA'};
        const {rerender, resetToPage} = renderRefreshHook(refreshAfter, usValues);

        rerender({fields: refreshBefore, values: usValues});

        expect(setDraftValues).toHaveBeenCalledTimes(1);
        expect(setDraftValues).toHaveBeenCalledWith(FORM_ID, {[STATE_KEY]: null});
        expect(resetToPage).toHaveBeenCalledWith('account-details');
    });

    it('after a schema replace that only adds fields, clears nothing', () => {
        const {rerender} = renderRefreshHook(refreshBefore, initialValues);

        rerender({fields: refreshAfter, values: {...initialValues, [COUNTRY_KEY]: 'US'}});

        expect(setDraftValues).not.toHaveBeenCalled();
    });

    it('returns to the first page when the current group disappears from the schema', () => {
        const {rerender, resetToPage} = renderRefreshHook(refreshBefore, initialValues);

        rerender({fields: refreshAfter.filter((field) => field.group !== 'Account details'), values: initialValues});

        expect(resetToPage).toHaveBeenCalledWith(undefined);
    });
});
