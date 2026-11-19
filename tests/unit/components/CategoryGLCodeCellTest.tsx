import {act, render} from '@testing-library/react-native';

import {usePopoverEditState} from '@components/EditableCell';
import CategoryGLCodeCell from '@components/TransactionItemRow/DataCells/CategoryGLCodeCell';
import InlineCategoryPicker from '@components/TransactionItemRow/DataCells/InlineCategoryPicker';

import type {Transaction} from '@src/types/onyx';

import React from 'react';

import createMock from '../../utils/createMock';

const GL_CODE_KEY = 'GL Code';

jest.mock('@components/TransactionItemRow/DataCells/InlineCategoryPicker', () => jest.fn(() => null));
jest.mock('@components/TextWithTooltip', () => () => null);
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));
jest.mock('@components/EditableCell', () => ({
    EditableCell: ({popoverContent}: {popoverContent: React.ReactNode}) => popoverContent,
    usePopoverEditState: jest.fn(),
}));

describe('CategoryGLCodeCell', () => {
    it('uses the create-enabled picker and forwards updated categories without changing ordinary selection', () => {
        // Given an editable GL code cell whose category is already Training
        const onSave = jest.fn();
        const handleSave = jest.fn();
        jest.mocked(usePopoverEditState).mockReturnValue(createMock<ReturnType<typeof usePopoverEditState>>({isPopoverVisible: true, handleSave}));

        // When the cell mounts its inline picker
        render(
            <CategoryGLCodeCell
                transactionItem={createMock<Transaction>({category: 'Training'})}
                policyID="1"
                ownerAccountID={1}
                shouldShowTooltip={false}
                canEdit
                onSave={onSave}
            />,
        );
        const pickerProps = jest.mocked(InlineCategoryPicker).mock.lastCall?.[0];
        const categories = {Training: {name: 'Training', enabled: true, [GL_CODE_KEY]: '123'}};
        act(() => {
            pickerProps?.onSave?.('Training', categories);
            pickerProps?.onSelected?.({keyForList: 'Food'});
        });

        // Then creation/re-enabling forwards categories even for an unchanged name, while selection keeps the existing save path
        expect(pickerProps).toEqual(expect.objectContaining({shouldAlwaysShowGLCode: true, ownerAccountID: 1, policyID: '1'}));
        expect(onSave).toHaveBeenCalledWith('Training', categories);
        expect(handleSave).toHaveBeenCalledWith('Food');
    });
});
