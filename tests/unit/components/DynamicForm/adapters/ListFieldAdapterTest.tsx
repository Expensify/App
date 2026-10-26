import {act, render} from '@testing-library/react-native';

import ListFieldAdapter from '@components/DynamicForm/adapters/ListFieldAdapter';
import type {ListFieldHandle, ListFieldRow} from '@components/ListField';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import {clearListItemEdit, startListItemEdit} from '@userActions/DynamicForm';

import type {DynamicFormField, DynamicFormListItem} from '@src/types/onyx';

import type {ComponentRef, RefObject} from 'react';

import React, {createRef} from 'react';

type CapturedListFieldProps = {
    rows: ListFieldRow[];
    canAddMore?: boolean;
    onAdd: () => void;
    onEdit: (id: string) => void;
    onRemove: (id: string) => void;
    ref?: RefObject<ListFieldHandle | null>;
};

type CapturedModalProps = {
    isVisible: boolean;
    isSensitive: boolean;
    keptAnswers: Record<string, unknown>;
    onSave: (answers: Record<string, string>) => void;
    onClose: () => void;
    onModalHide: () => void;
};

type ConfirmModalOptions = {
    title: string;
};

const mockShowConfirmModal = jest.fn<Promise<{action: string}>, [ConfirmModalOptions]>(() => Promise.resolve({action: ModalActions.CONFIRM}));

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
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string, params?: unknown) => (params === undefined ? key : `${key} ${JSON.stringify(params)}`)})));
jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: mockShowConfirmModal})));
jest.mock('@userActions/DynamicForm', () => ({startListItemEdit: jest.fn(() => Promise.resolve()), clearListItemEdit: jest.fn()}));

const itemFields: DynamicFormField[] = [{key: 'fullName', type: 'text', required: true}];
const jane: DynamicFormListItem = {id: 'jane', fullName: 'Jane Doe'};
const john: DynamicFormListItem = {id: 'john', fullName: 'John Roe'};
const jack: DynamicFormListItem = {id: 'jack', fullName: 'Jack Poe'};

let frameSpy: jest.SpyInstance | undefined;

function runScreenFramesAtOnce() {
    frameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
        callback(0);
        return 0;
    });
}

/** Stands in for ListField's focus handle, which the adapter reaches through the ref it passes down */
function mockListFieldHandle(props: CapturedListFieldProps) {
    const handle: ListFieldHandle = {focus: jest.fn(), focusRow: jest.fn(), focusAddRow: jest.fn()};
    const {ref} = props;
    if (ref) {
        ref.current = handle;
    }
    return handle;
}

function renderAdapter(value: DynamicFormListItem[], onInputChange: (items: DynamicFormListItem[]) => void, maxItems?: number, isInFlow = true) {
    render(
        <ListFieldAdapter
            value={value}
            onInputChange={onInputChange}
            itemFields={isInFlow ? itemFields : [...itemFields, {key: 'ssn', type: 'text', required: false, sensitive: true}]}
            maxItems={maxItems}
            label="Directors"
            itemLabel="director"
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
    afterEach(() => {
        frameSpy?.mockRestore();
        frameSpy = undefined;
    });

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

    it('gives FormProvider the list without the removed entry once the user confirms', async () => {
        // Given two directors
        const onInputChange = jest.fn();
        const {onRemove} = renderAdapter([jane, john], onInputChange);

        // When the user removes one and confirms
        await act(async () => onRemove('jane'));

        // Then the form value is the whole list minus that director, and the unmasked modal title names no one, since the name is personal
        expect(onInputChange).toHaveBeenCalledWith([john]);
        expect(mockShowConfirmModal.mock.lastCall?.[0].title).not.toContain('Jane');
    });

    it('keeps the entry when the user cancels the removal', async () => {
        // Given two directors, and a user who will cancel the confirmation
        const onInputChange = jest.fn();
        const {onRemove} = renderAdapter([jane, john], onInputChange);
        mockShowConfirmModal.mockResolvedValueOnce({action: ModalActions.CLOSE});

        // When the user taps remove on one
        await act(async () => onRemove('jane'));

        // Then the list is left as it was
        expect(onInputChange).not.toHaveBeenCalled();
    });

    it('edits an entry in a modal outside the flow, filling a stored sensitive answer from the entry instead of the draft', async () => {
        // Given a director with a stored SSN, in a list that no flow opens editor pages for
        const onInputChange = jest.fn();
        const {onEdit} = renderAdapter([{...jane, ssn: '123456789'}], onInputChange, undefined, false);

        // When the user edits the director, renames them and saves with the SSN they were shown
        await act(async () => onEdit('jane'));
        const modal = mockModal.mock.lastCall?.[0];
        act(() => modal?.onSave({...modal.keptAnswers, fullName: 'Jane Smith'}));

        // Then the modal opened over the page with the SSN kept out of the editor draft, and the list holds the renamed director with the SSN still in place
        expect(modal?.isVisible).toBe(true);
        expect(startListItemEdit).toHaveBeenLastCalledWith({fullName: 'Jane Doe'});
        expect(modal?.keptAnswers).toEqual({ssn: '123456789'});
        expect(onInputChange).toHaveBeenCalledWith([{id: 'jane', fullName: 'Jane Smith', ssn: '123456789'}]);
    });

    it('drafts none of the answers of an entry of a sensitive list edited in the modal', async () => {
        // Given a director in a list marked sensitive, which no flow opens editor pages for
        render(
            <ListFieldAdapter
                value={[jane]}
                onInputChange={jest.fn()}
                itemFields={itemFields}
                isSensitive
                label="Directors"
                addTitle="Add director"
                renderFields={jest.fn()}
            />,
        );

        // When the user opens the director in the modal
        await act(async () => mockListField.mock.lastCall?.[0].onEdit('jane'));
        const modal = mockModal.mock.lastCall?.[0];

        // Then the editor draft starts empty and the director's answers fill the inputs from the entry, so nothing of a sensitive list reaches the device
        expect(startListItemEdit).toHaveBeenLastCalledWith({});
        expect(modal?.keptAnswers).toEqual({fullName: 'Jane Doe'});
        expect(modal?.isSensitive).toBe(true);
    });

    it('empties the editor draft when the modal closes', async () => {
        // Given a director open in the modal editor outside the flow
        const {onEdit} = renderAdapter([jane], jest.fn(), undefined, false);
        await act(async () => onEdit('jane'));
        jest.mocked(clearListItemEdit).mockClear();

        // When the user closes the modal without saving
        act(() => mockModal.mock.lastCall?.[0].onClose());

        // Then the editor draft is emptied, so the director's answers do not stay on the device
        expect(clearListItemEdit).toHaveBeenCalledTimes(1);
    });

    it('stops offering to add entries once the list is full', () => {
        // Given a list allowing two directors, with two
        // When it renders
        const {canAddMore} = renderAdapter([jane, john], jest.fn(), 2);

        // Then the add row is hidden, as a third director could not be submitted
        expect(canAddMore).toBe(false);
    });

    it.each([
        ['the next entry', jane, john.id],
        ['the previous entry when the last one is removed', jack, john.id],
    ])('moves focus to %s once the user confirms a removal', async (_, removed, focusedID) => {
        // Given three directors, and screen frames that run at once
        runScreenFramesAtOnce();
        const props = renderAdapter([jane, john, jack], jest.fn());
        const listField = mockListFieldHandle(props);

        // When the user removes one and confirms
        await act(async () => props.onRemove(removed.id));

        // Then focus goes to the next row, else the previous one, since the removed row's button that had it is gone
        expect(listField.focusRow).toHaveBeenCalledWith(focusedID);
    });

    it('moves focus to the add row once the only entry is removed', async () => {
        // Given a single director, and screen frames that run at once
        runScreenFramesAtOnce();
        const props = renderAdapter([jane], jest.fn());
        const listField = mockListFieldHandle(props);

        // When the user removes them and confirms
        await act(async () => props.onRemove(jane.id));

        // Then focus goes to the add row, the only thing left to act on
        expect(listField.focusAddRow).toHaveBeenCalledTimes(1);
    });

    it('gives focus back to the add row once the modal that added an entry has closed', async () => {
        // Given the modal editor outside the flow, opened from the add row
        const props = renderAdapter([jane], jest.fn(), undefined, false);
        const listField = mockListFieldHandle(props);
        await act(async () => props.onAdd());

        // When the modal finishes closing
        act(() => mockModal.mock.lastCall?.[0].onModalHide());

        // Then the add row gets focus, or the last row when the new entry filled the list, since the add row drops focus when pressed
        expect(listField.focusAddRow).toHaveBeenCalledTimes(1);
    });

    it('gives focus back to the edited row once the modal has closed', async () => {
        // Given the modal editor outside the flow, opened from a director's Edit button
        const props = renderAdapter([jane, john], jest.fn(), undefined, false);
        const listField = mockListFieldHandle(props);
        await act(async () => props.onEdit(john.id));

        // When the modal finishes closing
        act(() => mockModal.mock.lastCall?.[0].onModalHide());

        // Then that director's Edit button gets focus back
        expect(listField.focusRow).toHaveBeenCalledWith(john.id);
    });

    it('lets the form focus the list when the user asks to fix the errors', () => {
        // Given a list the form holds a ref to
        const ref = createRef<ComponentRef<typeof ListFieldAdapter>>();
        render(
            <ListFieldAdapter
                ref={ref}
                value={[jane]}
                itemFields={itemFields}
                label="Directors"
                addTitle="Add director"
                renderFields={jest.fn()}
            />,
        );
        const props = mockListField.mock.lastCall?.[0];
        if (!props) {
            throw new Error('ListField did not render');
        }
        const listField = mockListFieldHandle(props);

        // When the form focuses the list
        act(() => ref.current?.focus());

        // Then focus goes into the list, and the form can measure where the list is to scroll to it
        expect(listField.focus).toHaveBeenCalledTimes(1);
        expect(ref.current?.measureLayout).toEqual(expect.any(Function));
    });
});
