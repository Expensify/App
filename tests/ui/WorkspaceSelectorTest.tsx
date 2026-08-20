import {render} from '@testing-library/react-native';

import WorkspaceSelector from '@components/Search/FilterComponents/WorkspaceSelector';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import {useAdvancedSearchFiltersWorkspaces} from '@hooks/useAdvancedSearchFilters';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/MultiSelectListItem', () => jest.fn(() => null));
jest.mock('@components/ActivityIndicator', () => jest.fn(() => null));
jest.mock('@components/Checkbox', () => jest.fn(() => null));
jest.mock('@components/Text', () => jest.fn(() => null));
jest.mock(
    '@components/Search/FilterComponents/ListFilterViewWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@hooks/useAdvancedSearchFilters', () => ({
    advancedSearchPoliciesSelector: jest.fn(),
    useAdvancedSearchFiltersWorkspaces: jest.fn(),
}));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));
jest.mock('@hooks/useTheme', () => jest.fn(() => ({})));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        flex1: {},
        justifyContentCenter: {},
        alignItemsCenter: {},
        pb0: {},
        flexRow: {},
        justifyContentBetween: {},
        ph5: {},
        pv2: {},
        optionsListSectionHeader: {},
        textLabelSupporting: {},
        textNormal: {},
    })),
);
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

describe('WorkspaceSelector', () => {
    const mockedSelectionListWithSections = jest.mocked(SelectionListWithSections);
    const mockedUseAdvancedSearchFiltersWorkspaces = jest.mocked(useAdvancedSearchFiltersWorkspaces);

    const OPTION_COUNT = CONST.STANDARD_LIST_ITEM_LIMIT + 2;
    const buildWorkspaces = (count: number) =>
        Array.from({length: count}, (_, index) => ({
            text: `Workspace ${index}`,
            policyID: `ws-${index}`,
            icons: [{source: 'icon', type: CONST.ICON_TYPE_WORKSPACE, name: `Workspace ${index}`}],
            keyForList: `ws-${index}`,
        }));
    const keysOf = (data: ListItem[]) => data.map((item) => item.keyForList);

    const flattenSections = (sections: Array<{data: ListItem[]}>): ListItem[] => sections.flatMap((s) => s.data);

    const mockWorkspaces = (count: number) => {
        const mockReturnValue: ReturnType<typeof useAdvancedSearchFiltersWorkspaces> = {
            workspaces: [{data: buildWorkspaces(count), sectionIndex: 0}],
            shouldShowWorkspaceSearchInput: false,
        };
        mockedUseAdvancedSearchFiltersWorkspaces.mockReturnValue(mockReturnValue);
    };

    beforeEach(() => {
        mockedSelectionListWithSections.mockClear();
        mockedUseAdvancedSearchFiltersWorkspaces.mockReset();
    });

    it('floats pre-selected workspaces to the top on first render', () => {
        mockWorkspaces(OPTION_COUNT);
        const preselected = 'ws-10';

        render(
            <WorkspaceSelector
                value={[preselected]}
                onChange={jest.fn()}
            />,
        );

        const props = mockedSelectionListWithSections.mock.lastCall?.[0];
        const data = flattenSections(props?.sections ?? []);
        expect(data.at(0)).toEqual(expect.objectContaining({keyForList: preselected, isSelected: true}));
        const expectedOrder = [
            preselected,
            ...buildWorkspaces(OPTION_COUNT)
                .map((workspace) => workspace.policyID)
                .filter((value) => value !== preselected),
        ];
        expect(keysOf(data)).toEqual(expectedOrder);
    });

    it('does not reorder the list when a workspace is toggled after first render (no jump to the top)', () => {
        mockWorkspaces(OPTION_COUNT);
        const preselected = 'ws-10';
        const toggled = 'ws-3';

        const {rerender} = render(
            <WorkspaceSelector
                value={[preselected]}
                onChange={jest.fn()}
            />,
        );

        rerender(
            <WorkspaceSelector
                value={[preselected, toggled]}
                onChange={jest.fn()}
            />,
        );

        const props = mockedSelectionListWithSections.mock.lastCall?.[0];
        const data = flattenSections(props?.sections ?? []);
        expect(data.at(0)?.keyForList).toBe(preselected);
        const expectedOrder = [
            preselected,
            ...buildWorkspaces(OPTION_COUNT)
                .map((workspace) => workspace.policyID)
                .filter((value) => value !== preselected),
        ];
        expect(keysOf(data)).toEqual(expectedOrder);
        expect(data.find((item) => item.keyForList === toggled)).toEqual(expect.objectContaining({isSelected: true}));
    });

    it('leaves a short list in its natural order even with a selection', () => {
        mockWorkspaces(CONST.STANDARD_LIST_ITEM_LIMIT - 1);

        render(
            <WorkspaceSelector
                value={['ws-5']}
                onChange={jest.fn()}
            />,
        );

        const props = mockedSelectionListWithSections.mock.lastCall?.[0];
        const data = flattenSections(props?.sections ?? []);
        expect(keysOf(data)).toEqual(buildWorkspaces(CONST.STANDARD_LIST_ITEM_LIMIT - 1).map((workspace) => workspace.policyID));
    });

    it('passes shouldUpdateFocusedIndex so the focused index follows a row that reorders on selection', () => {
        mockWorkspaces(OPTION_COUNT);

        render(
            <WorkspaceSelector
                value={['ws-10']}
                onChange={jest.fn()}
            />,
        );

        const props = mockedSelectionListWithSections.mock.lastCall?.[0];
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });
});
