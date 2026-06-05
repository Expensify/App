import {render} from '@testing-library/react-native';
import React from 'react';
import FormValueWatcher from '@components/Form/FormValueWatcher';
import type {FormOnyxValues} from '@components/Form/types';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';

type TestFormID = typeof ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM;
type TestValues = FormOnyxValues<TestFormID>;

function makeValues(overrides: Partial<TestValues> = {}): TestValues {
    return {
        name: '',
        type: CONST.REPORT_FIELD_TYPES.TEXT,
        initialValue: '',
        listValues: [],
        disabledListValues: [],
        valueName: '',
        newValueName: '',
        ...overrides,
    };
}

describe('FormValueWatcher', () => {
    it('renders nothing (returns null)', () => {
        const onValuesChange = jest.fn();
        const {toJSON} = render(
            <FormValueWatcher<TestFormID>
                values={makeValues()}
                onValuesChange={onValuesChange}
            />,
        );
        expect(toJSON()).toBeNull();
    });

    it('does not fire on initial mount', () => {
        const onValuesChange = jest.fn();
        render(
            <FormValueWatcher<TestFormID>
                values={makeValues()}
                onValuesChange={onValuesChange}
            />,
        );
        expect(onValuesChange).not.toHaveBeenCalled();
    });

    it('fires with (current, previous) when the values reference changes', () => {
        const onValuesChange = jest.fn();
        const initial = makeValues({type: CONST.REPORT_FIELD_TYPES.TEXT});
        const next = makeValues({type: CONST.REPORT_FIELD_TYPES.DATE});
        const {rerender} = render(
            <FormValueWatcher<TestFormID>
                values={initial}
                onValuesChange={onValuesChange}
            />,
        );
        rerender(
            <FormValueWatcher<TestFormID>
                values={next}
                onValuesChange={onValuesChange}
            />,
        );
        expect(onValuesChange).toHaveBeenCalledTimes(1);
        expect(onValuesChange).toHaveBeenCalledWith(next, initial);
    });

    it('does not fire when re-rendered with the same values reference', () => {
        const onValuesChange = jest.fn();
        const initial = makeValues();
        const {rerender} = render(
            <FormValueWatcher<TestFormID>
                values={initial}
                onValuesChange={onValuesChange}
            />,
        );
        rerender(
            <FormValueWatcher<TestFormID>
                values={initial}
                onValuesChange={onValuesChange}
            />,
        );
        expect(onValuesChange).not.toHaveBeenCalled();
    });

    it('passes the correct (current, previous) pairs across three updates', () => {
        const onValuesChange = jest.fn();
        const v1 = makeValues({type: CONST.REPORT_FIELD_TYPES.TEXT});
        const v2 = makeValues({type: CONST.REPORT_FIELD_TYPES.DATE});
        const v3 = makeValues({type: CONST.REPORT_FIELD_TYPES.FORMULA});
        const {rerender} = render(
            <FormValueWatcher<TestFormID>
                values={v1}
                onValuesChange={onValuesChange}
            />,
        );
        rerender(
            <FormValueWatcher<TestFormID>
                values={v2}
                onValuesChange={onValuesChange}
            />,
        );
        rerender(
            <FormValueWatcher<TestFormID>
                values={v3}
                onValuesChange={onValuesChange}
            />,
        );
        expect(onValuesChange).toHaveBeenCalledTimes(2);
        expect(onValuesChange).toHaveBeenNthCalledWith(1, v2, v1);
        expect(onValuesChange).toHaveBeenNthCalledWith(2, v3, v2);
    });

    it('does not fire when only the onValuesChange callback identity changes', () => {
        const cb1 = jest.fn();
        const cb2 = jest.fn();
        const initial = makeValues();
        const {rerender} = render(
            <FormValueWatcher<TestFormID>
                values={initial}
                onValuesChange={cb1}
            />,
        );
        rerender(
            <FormValueWatcher<TestFormID>
                values={initial}
                onValuesChange={cb2}
            />,
        );
        expect(cb1).not.toHaveBeenCalled();
        expect(cb2).not.toHaveBeenCalled();
    });

    it('uses the latest onValuesChange after a swap followed by a values change', () => {
        const cb1 = jest.fn();
        const cb2 = jest.fn();
        const initial = makeValues({type: CONST.REPORT_FIELD_TYPES.TEXT});
        const next = makeValues({type: CONST.REPORT_FIELD_TYPES.DATE});
        const {rerender} = render(
            <FormValueWatcher<TestFormID>
                values={initial}
                onValuesChange={cb1}
            />,
        );
        rerender(
            <FormValueWatcher<TestFormID>
                values={initial}
                onValuesChange={cb2}
            />,
        );
        rerender(
            <FormValueWatcher<TestFormID>
                values={next}
                onValuesChange={cb2}
            />,
        );
        expect(cb1).not.toHaveBeenCalled();
        expect(cb2).toHaveBeenCalledTimes(1);
        expect(cb2).toHaveBeenCalledWith(next, initial);
    });
});
