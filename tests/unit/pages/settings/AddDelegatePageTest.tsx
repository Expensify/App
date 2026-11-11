import {render} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';

import AddDelegatePage from '@pages/settings/Security/AddDelegate/AddDelegatePage';

import ROUTES from '@src/ROUTES';

import React from 'react';

type CapturedListProps = {
    onSelectRow: (option: OptionData) => void;
    confirmButtonOptions?: {
        showButton?: boolean;
        text?: string;
        onConfirm?: () => void;
        isDisabled?: boolean;
    };
};

// Single-select toggling itself (select, re-tap to unselect, replace) is covered by usePersonalDetailSearchSelectorTest.
// These tests only cover how the page wires the hook's selection to the list and the Next button.
// The option is referenced by the hoisted jest.mock factory below, so it is a self-contained `mock`-prefixed literal.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const mockCopilotOption = {login: 'copilot@example.com', text: 'Copilot', keyForList: 'copilot', isSelected: false} as OptionData;

const mockToggleSelection = jest.fn();
let mockSelectedOptions: OptionData[] = [];

jest.mock('@hooks/usePersonalDetailSearchSelector', () =>
    jest.fn(() => ({
        searchTerm: '',
        debouncedSearchTerm: '',
        setSearchTerm: jest.fn(),
        availableOptions: {recentOptions: [], personalDetails: [mockCopilotOption], userToInvite: null},
        selectedOptions: mockSelectedOptions,
        selectedNonExistingOptions: [],
        areOptionsInitialized: true,
        toggleSelection: mockToggleSelection,
    })),
);

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);

jest.mock('@libs/actions/Report', () => ({
    searchUserInServer: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScreenWrapper;
});

jest.mock('@components/DelegateNoAccessWrapper', () => {
    function MockDelegateNoAccessWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockDelegateNoAccessWrapper;
});

jest.mock('@components/HeaderWithBackButton', () => {
    function MockHeaderWithBackButton() {
        return null;
    }
    return MockHeaderWithBackButton;
});

jest.mock('@components/SelectionList/ListItem/UserListItem', () => {
    function MockUserListItem() {
        return null;
    }
    return MockUserListItem;
});

jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));

const mockSelectionListWithSections = jest.requireMock<jest.Mock<null, [CapturedListProps]>>('@components/SelectionList/SelectionListWithSections');

function renderPage(): CapturedListProps {
    render(<AddDelegatePage />);
    const listProps = mockSelectionListWithSections.mock.calls.at(-1)?.at(0);
    if (!listProps) {
        throw new Error('SelectionListWithSections was not rendered');
    }
    return listProps;
}

describe('AddDelegatePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSelectedOptions = [];
    });

    it('only toggles the selection when a user row is tapped', () => {
        // Given the Add copilot page with no user selected
        const listProps = renderPage();

        // When the user taps a row
        listProps.onSelectRow(mockCopilotOption);

        // Then the row is toggled and the page stays put, so the user can review or unselect it before moving on
        expect(mockToggleSelection).toHaveBeenCalledWith(mockCopilotOption);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('toggles an already selected row so a second tap unselects it', () => {
        // Given a user that is already selected
        mockSelectedOptions = [{...mockCopilotOption, isSelected: true}];
        const listProps = renderPage();

        // When the user taps the selected row again
        listProps.onSelectRow({...mockCopilotOption, isSelected: true});

        // Then the row is passed to toggleSelection, which unselects it in single-select mode, and nothing navigates
        expect(mockToggleSelection).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('shows a disabled Next button when no user is selected', () => {
        // Given no user is selected (reset in beforeEach)
        // When the Add copilot page renders
        const listProps = renderPage();

        // Then a Next button is shown but disabled, since there is no copilot to continue with
        expect(listProps.confirmButtonOptions?.showButton).toBe(true);
        expect(listProps.confirmButtonOptions?.text).toBe('common.next');
        expect(listProps.confirmButtonOptions?.isDisabled).toBe(true);

        // When the user presses Next anyway
        listProps.confirmButtonOptions?.onConfirm?.();

        // Then nothing navigates, because there is no selected user to open the permission level step for
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('opens the permission level step for the selected user when Next is pressed', () => {
        // Given a selected user
        mockSelectedOptions = [{...mockCopilotOption, isSelected: true}];
        const listProps = renderPage();

        // When the user presses Next
        expect(listProps.confirmButtonOptions?.isDisabled).toBe(false);
        listProps.confirmButtonOptions?.onConfirm?.();

        // Then the permission level step opens for the selected user
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_DELEGATE_ROLE.getRoute('copilot@example.com'));
    });
});
