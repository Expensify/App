import {act, render} from '@testing-library/react-native';

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

import React from 'react';

import createMock from '../utils/createMock';

const mockUseState = React.useState;

type NetSuiteCustomListSelectorPageProps = Parameters<typeof NetSuiteCustomListSelectorPage>[0];

const DEFAULT_CUSTOM_LISTS = [
    {id: '123', name: 'Department'},
    {id: '456', name: 'Project'},
];

function buildCustomLists(count: number) {
    return Array.from({length: count}, (_, index) => {
        const padded = String(index + 1).padStart(2, '0');
        return {id: padded, name: `List ${padded}`};
    });
}

function buildPolicy(customLists: Array<{id: string; name: string}>) {
    return {id: 'P1', connections: {netsuite: {options: {data: {customLists}}}}};
}

let mockPolicy: ReturnType<typeof buildPolicy> = buildPolicy(DEFAULT_CUSTOM_LISTS);
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
    const mockedSelectionList = jest.mocked(SelectionList<CustomListSelectorType>);
    const mockedSetDraftValues = jest.mocked(setDraftValues);
    const mockedNavigationGoBack = jest.mocked(Navigation.goBack);

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockedSetDraftValues.mockClear();
        mockedNavigationGoBack.mockClear();
        mockFormDraft = undefined;
        mockPolicy = buildPolicy(DEFAULT_CUSTOM_LISTS);
    });

    it('builds option rows from the policy custom lists and marks the draft value as selected', () => {
        mockFormDraft = {[INPUT_IDS.LIST_NAME]: 'Project'};

        render(
            <NetSuiteCustomListSelectorPage
                route={createMock<NetSuiteCustomListSelectorPageProps['route']>({params: {policyID: 'P1'}})}
                navigation={createMock<NetSuiteCustomListSelectorPageProps['navigation']>({})}
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
                route={createMock<NetSuiteCustomListSelectorPageProps['route']>({params: {policyID: 'P1'}})}
                navigation={createMock<NetSuiteCustomListSelectorPageProps['navigation']>({})}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        const selectedRow = selectionListProps?.data.find((item) => item.value === 'Department');
        if (!selectedRow) {
            throw new Error('Expected the Department row to be rendered');
        }
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
                route={createMock<NetSuiteCustomListSelectorPageProps['route']>({params: {policyID: 'P1', action: 'edit'}})}
                navigation={createMock<NetSuiteCustomListSelectorPageProps['navigation']>({})}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        const selectedRow = selectionListProps?.data.find((item) => item.value === 'Department');
        if (!selectedRow) {
            throw new Error('Expected the Department row to be rendered');
        }
        selectionListProps?.onSelectRow?.(selectedRow);

        expect(mockedNavigationGoBack).toHaveBeenCalledTimes(1);
        expect(mockedNavigationGoBack).toHaveBeenCalledWith(
            ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_ADD.getRoute('P1', CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_LIST.PAGE_NAME.NAME, 'edit'),
        );
    });

    it('renders an empty option set with a no-results header message when search filters everything out', () => {
        render(
            <NetSuiteCustomListSelectorPage
                route={createMock<NetSuiteCustomListSelectorPageProps['route']>({params: {policyID: 'P1'}})}
                navigation={createMock<NetSuiteCustomListSelectorPageProps['navigation']>({})}
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

    it('pins the pre-selected custom list to the top when the list is long enough', () => {
        mockPolicy = buildPolicy(buildCustomLists(CONST.STANDARD_LIST_ITEM_LIMIT + 2));
        mockFormDraft = {[INPUT_IDS.LIST_NAME]: 'List 07'};

        render(
            <NetSuiteCustomListSelectorPage
                route={createMock<NetSuiteCustomListSelectorPageProps['route']>({params: {policyID: 'P1'}})}
                navigation={createMock<NetSuiteCustomListSelectorPageProps['navigation']>({})}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        // "List 07" sits in the middle, so seeing it first proves pinning (not the natural order) put it there.
        expect(selectionListProps?.data.at(0)?.value).toBe('List 07');
        expect(selectionListProps?.data.at(0)?.isSelected).toBe(true);
        expect(selectionListProps?.initiallyFocusedItemKey).toBe('List 07');
        expect(selectionListProps?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(selectionListProps?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('keeps the pinned custom list at the top of the search results', () => {
        mockPolicy = buildPolicy(buildCustomLists(CONST.STANDARD_LIST_ITEM_LIMIT + 2));
        mockFormDraft = {[INPUT_IDS.LIST_NAME]: 'List 12'};

        render(
            <NetSuiteCustomListSelectorPage
                route={createMock<NetSuiteCustomListSelectorPageProps['route']>({params: {policyID: 'P1'}})}
                navigation={createMock<NetSuiteCustomListSelectorPageProps['navigation']>({})}
            />,
        );

        // Searching "1" also matches "List 01" (which sorts first), so "List 12" leading proves the pin held.
        act(() => {
            mockedSelectionList.mock.lastCall?.[0]?.textInputOptions?.onChangeText?.('1');
        });

        expect(mockedSelectionList.mock.lastCall?.[0]?.data.at(0)?.value).toBe('List 12');
    });

    it('does not reorder the custom list when it is under the item-limit threshold', () => {
        mockPolicy = buildPolicy(buildCustomLists(CONST.STANDARD_LIST_ITEM_LIMIT - 2));
        mockFormDraft = {[INPUT_IDS.LIST_NAME]: 'List 05'};

        render(
            <NetSuiteCustomListSelectorPage
                route={createMock<NetSuiteCustomListSelectorPageProps['route']>({params: {policyID: 'P1'}})}
                navigation={createMock<NetSuiteCustomListSelectorPageProps['navigation']>({})}
            />,
        );

        // Below the threshold moveInitialSelectionToTop is a no-op, so the natural order is preserved.
        expect(mockedSelectionList.mock.lastCall?.[0]?.data.at(0)?.value).toBe('List 01');
    });
});
