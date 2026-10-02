import {render} from '@testing-library/react-native';

import ListFieldAdapter from '@components/DynamicForm/adapters/ListFieldAdapter';
import type {ListFieldRow} from '@components/ListField';

import type {DynamicFormField, DynamicFormListItem} from '@src/types/onyx';

import React from 'react';

type CapturedListFieldProps = {
    rows: ListFieldRow[];
    canAddMore?: boolean;
    onRemove: (id: string) => void;
};

const mockListField = jest.fn<null, [CapturedListFieldProps]>(() => null);

jest.mock('@components/ListField', () => ({
    __esModule: true,
    default: (props: CapturedListFieldProps) => mockListField(props),
}));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const itemFields: DynamicFormField[] = [{key: 'fullName', type: 'text', required: true}];
const jane: DynamicFormListItem = {id: 'jane', answers: {fullName: 'Jane Doe'}};
const john: DynamicFormListItem = {id: 'john', answers: {fullName: 'John Roe'}};

function renderAdapter(value: DynamicFormListItem[], onInputChange: (items: DynamicFormListItem[]) => void, maxItems?: number) {
    render(
        <ListFieldAdapter
            value={value}
            onInputChange={onInputChange}
            itemFields={itemFields}
            maxItems={maxItems}
            addTitle="Add director"
            onAdd={jest.fn()}
            onEdit={jest.fn()}
        />,
    );
    const props = mockListField.mock.lastCall?.[0];
    if (!props) {
        throw new Error('ListField did not render');
    }
    return props;
}

describe('ListFieldAdapter', () => {
    it('shows each entry as a row named by its answers', () => {
        // Given two directors
        // When the list renders
        const {rows} = renderAdapter([jane, john], jest.fn());

        // Then each director is a row titled with their name, so the user can tell them apart
        expect(rows.map((row) => [row.id, row.title])).toEqual([
            ['jane', 'Jane Doe'],
            ['john', 'John Roe'],
        ]);
    });

    it('gives FormProvider the list without the removed entry', () => {
        // Given two directors
        const onInputChange = jest.fn();
        const {onRemove} = renderAdapter([jane, john], onInputChange);

        // When the user removes one
        onRemove('jane');

        // Then the form value is the whole list minus that director
        expect(onInputChange).toHaveBeenCalledWith([john]);
    });

    it('stops offering to add entries once the list is full', () => {
        // Given a list allowing two directors, with two
        // When it renders
        const {canAddMore} = renderAdapter([jane, john], jest.fn(), 2);

        // Then the add row is hidden, as a third director could not be submitted
        expect(canAddMore).toBe(false);
    });
});
