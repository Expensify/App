import {render} from '@testing-library/react-native';
import React from 'react';
import ValueSelectionList from '@components/ValuePicker/ValueSelectionList';
import ValueSelectorModal from '@components/ValuePicker/ValueSelectorModal';

jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/Modal', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/ValuePicker/ValueSelectionList', () => jest.fn(() => null));

describe('ValueSelectorModal', () => {
    const mockedValueSelectionList = jest.mocked(ValueSelectionList);

    beforeEach(() => {
        mockedValueSelectionList.mockClear();
    });

    it('forwards modal visibility to ValueSelectionList', () => {
        render(
            <ValueSelectorModal
                isVisible
                label="Value"
                selectedItem={{value: 'two', label: 'Two'}}
                items={[
                    {value: 'one', label: 'One'},
                    {value: 'two', label: 'Two'},
                ]}
                onClose={jest.fn()}
                onItemSelected={jest.fn()}
            />,
        );

        expect(mockedValueSelectionList.mock.lastCall?.[0]).toEqual(expect.objectContaining({isVisible: true}));
    });
});
