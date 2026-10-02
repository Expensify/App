import {act, render} from '@testing-library/react-native';

import ListFieldAdapter from '@components/DynamicForm/adapters/ListFieldAdapter';
import type {ListFieldRow} from '@components/ListField';

import type {DynamicFormField, DynamicFormListItem} from '@src/types/onyx';

import React from 'react';

type CapturedListFieldProps = {
    rows: ListFieldRow[];
    canAddMore?: boolean;
    onAdd: () => void;
    onEdit: (id: string) => void;
    onRemove: (id: string) => void;
};

type CapturedModalProps = {
    isVisible: boolean;
    keptAnswers: Record<string, unknown>;
    onSave: (answers: Record<string, string>) => void;
};

const mockListField = jest.fn<null, [CapturedListFieldProps]>(() => null);
const mockModal = jest.fn<null, [CapturedModalProps]>(() => null);

jest.mock('@components/ListField', () => ({
    __esModule: true,
    default: (props: CapturedListFieldProps) => mockListField(props),
}));
jest.mock('@components/DynamicForm/components/DynamicFormListItemModal', () => ({
    __esModule: true,
    default: (props: CapturedModalProps) => mockModal(props),
}));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@userActions/DynamicForm', () => ({startListItemEdit: jest.fn(() => Promise.resolve())}));

const itemFields: DynamicFormField[] = [{key: 'fullName', type: 'text', required: true}];
const jane: DynamicFormListItem = {id: 'jane', fullName: 'Jane Doe'};
const john: DynamicFormListItem = {id: 'john', fullName: 'John Roe'};

function renderAdapter(value: DynamicFormListItem[], onInputChange: (items: DynamicFormListItem[]) => void, maxItems?: number, isInFlow = true) {
    render(
        <ListFieldAdapter
            value={value}
            onInputChange={onInputChange}
            itemFields={isInFlow ? itemFields : [...itemFields, {key: 'ssn', type: 'text', required: false, sensitive: true}]}
            maxItems={maxItems}
            addTitle="Add director"
            onAdd={isInFlow ? jest.fn() : undefined}
            onEdit={isInFlow ? jest.fn() : undefined}
            renderFields={jest.fn()}
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

    it('edits an entry in a modal outside the flow, keeping a stored sensitive answer the user leaves blank', async () => {
        // Given a director with a stored SSN, in a list that no flow opens editor pages for
        const onInputChange = jest.fn();
        const {onEdit} = renderAdapter([{...jane, ssn: '123456789'}], onInputChange, undefined, false);

        // When the user edits the director, renames them and saves with the SSN left blank
        await act(async () => onEdit('jane'));
        const modal = mockModal.mock.lastCall?.[0];
        act(() => modal?.onSave({fullName: 'Jane Smith', ...modal.keptAnswers}));

        // Then the modal opened over the page, and the list holds the renamed director with the SSN still in place
        expect(modal?.isVisible).toBe(true);
        expect(onInputChange).toHaveBeenCalledWith([{id: 'jane', fullName: 'Jane Smith', ssn: '123456789'}]);
    });

    it('stops offering to add entries once the list is full', () => {
        // Given a list allowing two directors, with two
        // When it renders
        const {canAddMore} = renderAdapter([jane, john], jest.fn(), 2);

        // Then the add row is hidden, as a third director could not be submitted
        expect(canAddMore).toBe(false);
    });
});
