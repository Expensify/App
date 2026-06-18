import SelectionList from '@components/SelectionList';

import {setDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';

import NetSuiteCustomListSelectorPage from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomListSelectorPage';
import type {CustomListSelectorType} from '@pages/workspace/accounting/netsuite/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

import type * as ReactNavigation from '@react-navigation/native';

import {act, render} from '@testing-library/react-native';
import React from 'react';

const mockUseState = React.useState;

const mockCustomLists = [
    {id: '123', name: 'Department'},
    {id: '456', name: 'Project'},
];

const mockPolicy = {
    id: 'P1',
    connections: {
        netsuite: {
            options: {
                data: {
                    customLists: mockCustomLists,
                },
            },
        },
    },
};

let mockFormDraft: Record<string, unknown> | undefined;

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
        useNavigation: jest.fn(() => ({})),
    };
});

jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@hooks/useDebouncedState', () =>
    jest.fn((initialValue: string) => {
        const [value, setValue] = mockUseState(initialValue);
        return [value, value, setValue];
    }),
);
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/usePolicy', () => jest.fn(() => mockPolicy));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [mockFormDraft, {status: 'loaded'}]));
jest.mock('@libs/actions/FormActions', () => ({
    setDraftValues: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));

describe('NetSuiteCustomListSelectorPage', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const mockedSetDraftValues = jest.mocked(setDraftValues);
    const mockedNavigationGoBack = jest.mocked(Navigation.goBack);

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockedSetDraftValues.mockClear();
        mockedNavigationGoBack.mockClear();
        mockFormDraft = undefined;
    });

    it('builds option rows from the policy custom lists and marks the draft value as selected', () => {
        mockFormDraft = {[INPUT_IDS.LIST_NAME]: 'Project'};

        render(
            <NetSuiteCustomListSelectorPage
                route={{params: {policyID: 'P1'}} as never}
                navigation={jest.fn() as never}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data).toEqual([
            expect.objectContaining({value: 'Department', isSelected: false, keyForList: 'Department', id: '123'}),
            expect.objectContaining({value: 'Project', isSelected: true, keyForList: 'Project', id: '456'}),
        ]);
        expect(selectionListProps?.initiallyFocusedItemKey).toBe('Project');
    });

    it('writes both listName and internalID to the form draft on row select then returns to the custom list name sub-page', () => {
        render(
            <NetSuiteCustomListSelectorPage
                route={{params: {policyID: 'P1'}} as never}
                navigation={jest.fn() as never}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        const selectedRow = selectionListProps?.data.find((item) => (item as CustomListSelectorType).value === 'Department') as CustomListSelectorType;
        selectionListProps?.onSelectRow?.(selectedRow);

        expect(mockedSetDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM, {
            [INPUT_IDS.LIST_NAME]: 'Department',
            [INPUT_IDS.INTERNAL_ID]: '123',
        });
        expect(mockedNavigationGoBack).toHaveBeenCalledTimes(1);
        expect(mockedNavigationGoBack).toHaveBeenCalledWith(
            ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_ADD.getRoute('P1', CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_LIST.PAGE_NAME.NAME),
        );
    });

    it('returns to the name sub-page in edit mode on row select when the selector was opened while editing from the confirm step', () => {
        render(
            <NetSuiteCustomListSelectorPage
                route={{params: {policyID: 'P1', action: 'edit'}} as never}
                navigation={jest.fn() as never}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        const selectedRow = selectionListProps?.data.find((item) => (item as CustomListSelectorType).value === 'Department') as CustomListSelectorType;
        selectionListProps?.onSelectRow?.(selectedRow);

        expect(mockedNavigationGoBack).toHaveBeenCalledTimes(1);
        expect(mockedNavigationGoBack).toHaveBeenCalledWith(
            ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_ADD.getRoute('P1', CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_LIST.PAGE_NAME.NAME, 'edit'),
        );
    });

    it('renders an empty option set with a no-results header message when search filters everything out', () => {
        render(
            <NetSuiteCustomListSelectorPage
                route={{params: {policyID: 'P1'}} as never}
                navigation={jest.fn() as never}
            />,
        );

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('zzzzz');
        });

        const filteredProps = mockedSelectionList.mock.lastCall?.[0];
        expect(filteredProps?.data).toEqual([]);
        expect(filteredProps?.textInputOptions?.headerMessage).toBe('common.noResultsFound');
    });
});
