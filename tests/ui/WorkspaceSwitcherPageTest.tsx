import {NavigationContainer, useIsFocused} from '@react-navigation/native';
import type * as NativeNavigation from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import React, {useCallback, useState} from 'react';
import SelectionList from '@components/SelectionList';
import type {ListItem, SectionListDataType} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';

// Mock `useIsFocused`
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(() => true),
    };
});

type WorkspaceListItem = {
    text: string;
    policyID?: string;
    isPolicyAdmin?: boolean;
} & ListItem;

function BaseSelectionListWrapper({onSelectPolicy}: {onSelectPolicy: (option?: ListItem) => void}) {
    const [activeWorkspaceID, setActiveWorkspaceID] = useState<undefined | string>(undefined);
    const isFocused = useIsFocused();
    const sections: Array<SectionListDataType<WorkspaceListItem>> = [
        {
            data: Array.from({length: 20}, (_, index) => ({
                text: `Item ${index}`,
                keyForList: `item-${index}`,
                reportID: `report-${index}`,
                policyID: `${index}`,
            })),
            isDisabled: false,
            shouldShow: true,
            title: 'Section 1',
        },
    ];

    const selectPolicy = useCallback(
        (option?: ListItem) => {
            if (!option || !isFocused) {
                return;
            }

            const {policyID} = option;
            if (activeWorkspaceID === policyID) {
                return;
            }
            setActiveWorkspaceID(policyID);
            onSelectPolicy(option);
        },
        [setActiveWorkspaceID, activeWorkspaceID, isFocused, onSelectPolicy],
    );

    return (
        <NavigationContainer>
            <SelectionList
                sections={sections}
                headerMessage="Base Options List Header"
                onSelectRow={selectPolicy}
                ListItem={UserListItem}
            />
        </NavigationContainer>
    );
}

describe('[SelectionList]', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Reset mocks after each test
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (useIsFocused as jest.Mock).mockReturnValue(true); // Reset default focus state if needed
    });

    test('should invoke selectPolicy when workspace is selected and screen is focused', async () => {
        const mockSelectPolicy = jest.fn();
        (useIsFocused as jest.Mock).mockReturnValueOnce(true); // Screen is focused
        render(<BaseSelectionListWrapper onSelectPolicy={mockSelectPolicy} />);

        const workspaceItem = await screen.findByText('Item 0');
        fireEvent.press(workspaceItem); // Simulate pressing the item

        // Verify `selectPolicy` is called with the correct argument
        expect(mockSelectPolicy).toHaveBeenCalledWith({
            text: 'Item 0',
            keyForList: 'item-0',
            reportID: 'report-0',
            policyID: '0',
        });
    });

    test('should not invoke selectPolicy when screen is not focused', async () => {
        const mockSelectPolicy = jest.fn();
        (useIsFocused as jest.Mock).mockReturnValueOnce(false); // Screen is not focused
        render(<BaseSelectionListWrapper onSelectPolicy={mockSelectPolicy} />);

        const workspaceItem = await screen.findByText('Item 0');
        fireEvent.press(workspaceItem);

        // Verify `selectPolicy` is not called
        expect(mockSelectPolicy).not.toHaveBeenCalled();
    });

    test('should ignore second press if screen loses focus after first press', async () => {
        const mockSelectPolicy = jest.fn();
        (useIsFocused as jest.Mock).mockReturnValueOnce(true); // Screen is focused
        const {rerender} = render(<BaseSelectionListWrapper onSelectPolicy={mockSelectPolicy} />);

        const workspaceItem = await screen.findByText('Item 0');
        const workspaceItem2 = await screen.findByText('Item 1');

        // Simulate two quick presses
        fireEvent.press(workspaceItem);
        (useIsFocused as jest.Mock).mockReturnValueOnce(false); // Navigation starts and `isFocused` state becomes false
        // Manually trigger re-render to apply the updated `useIsFocused` value
        rerender(<BaseSelectionListWrapper onSelectPolicy={mockSelectPolicy} />);
        fireEvent.press(workspaceItem2);

        // Verify `selectPolicy` is only called once
        expect(mockSelectPolicy).toHaveBeenCalledTimes(1);
    });
});
