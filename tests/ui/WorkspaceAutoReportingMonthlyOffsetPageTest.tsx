import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import SelectionList from '@components/SelectionList';
import {WorkspaceAutoReportingMonthlyOffsetPage} from '@pages/workspace/workflows/WorkspaceAutoReportingMonthlyOffsetPage';
import CONST from '@src/CONST';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/BlockingViews/FullPageNotFoundView', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        toLocaleOrdinal: (value: number) => value.toString(),
    })),
);
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));
jest.mock('@userActions/Policy/Policy', () => ({
    setWorkspaceAutoReportingMonthlyOffset: jest.fn(),
}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));

type PolicyProp = React.ComponentProps<typeof WorkspaceAutoReportingMonthlyOffsetPage>['policy'];

function buildPolicy(autoReportingOffset?: number | string): PolicyProp {
    return {
        id: 'policyID',
        autoReportingOffset,
    } as PolicyProp;
}

describe('WorkspaceAutoReportingMonthlyOffsetPage', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('keeps the initial selected offset at the top and suppresses mount scroll while the live selection changes', () => {
        const {rerender} = render(
            <WorkspaceAutoReportingMonthlyOffsetPage
                policy={buildPolicy(10)}
                route={{key: '', name: '', params: {policyID: 'policyID'}} as never}
                navigation={{} as never}
            />,
        );

        const initialProps = mockedSelectionList.mock.lastCall?.[0];
        expect(initialProps).toBeDefined();
        expect(initialProps?.data.at(0)?.keyForList).toBe('10');
        expect(initialProps?.initiallyFocusedItemKey).toBe('10');
        expect(initialProps?.shouldScrollToFocusedIndex).toBe(false);
        expect(initialProps?.shouldScrollToFocusedIndexOnMount).toBe(false);

        rerender(
            <WorkspaceAutoReportingMonthlyOffsetPage
                policy={buildPolicy(20)}
                route={{key: '', name: '', params: {policyID: 'policyID'}} as never}
                navigation={{} as never}
            />,
        );

        const updatedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(updatedProps).toBeDefined();
        expect(updatedProps?.data.at(0)?.keyForList).toBe('10');
        expect(updatedProps?.initiallyFocusedItemKey).toBe('10');
        expect(updatedProps?.data.find((item) => item.keyForList === '20')?.isSelected).toBe(true);
    });

    it('refreshes the selected item that is pinned to the top when the page is reopened', () => {
        const {unmount} = render(
            <WorkspaceAutoReportingMonthlyOffsetPage
                policy={buildPolicy(10)}
                route={{key: '', name: '', params: {policyID: 'policyID'}} as never}
                navigation={{} as never}
            />,
        );
        unmount();
        mockedSelectionList.mockClear();

        render(
            <WorkspaceAutoReportingMonthlyOffsetPage
                policy={buildPolicy(CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH)}
                route={{key: '', name: '', params: {policyID: 'policyID'}} as never}
                navigation={{} as never}
            />,
        );

        const reopenedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(reopenedProps).toBeDefined();
        expect(reopenedProps?.data.at(0)?.keyForList).toBe(CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH);
        expect(reopenedProps?.initiallyFocusedItemKey).toBe(CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH);
    });

    it('keeps natural filtered ordering while search is active', () => {
        render(
            <WorkspaceAutoReportingMonthlyOffsetPage
                policy={buildPolicy(12)}
                route={{key: '', name: '', params: {policyID: 'policyID'}} as never}
                navigation={{} as never}
            />,
        );

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('1');
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(searchedProps?.data.at(0)?.keyForList).toBe('1');
        const selectedIndex = searchedProps?.data.findIndex((item) => item.keyForList === '12');
        expect(selectedIndex).toBeGreaterThan(0);
    });
});
