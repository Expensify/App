import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import WorkspaceAutoReportingFrequencyPage from '@pages/workspace/workflows/WorkspaceAutoReportingFrequencyPage';

import {setWorkspaceAutoReportingFrequency, setWorkspaceAutoReportingMonthlyOffset} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import React from 'react';

// withPolicy injects the policy from Onyx; the test injects it directly instead.
jest.mock('@pages/workspace/withPolicy', () => (component: unknown) => component);
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/BlockingViews/FullPageNotFoundView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/OfflineWithFeedback',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/MenuItem/presets/MenuItemField', () => jest.fn(() => null));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock('@hooks/useReviewWorkspaceSettingsTaskCompletion', () => jest.fn(() => () => undefined));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        toLocaleOrdinal: (day: number) => String(day),
    })),
);
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));
jest.mock('@userActions/Policy/Policy', () => ({
    clearPolicyErrorField: jest.fn(),
    setWorkspaceAutoReportingFrequency: jest.fn(),
    setWorkspaceAutoReportingMonthlyOffset: jest.fn(),
}));

type MockListItem = {text: string; keyForList: string; isSelected: boolean};

type MockSelectionListProps = {
    data: MockListItem[];
    onSelectRow: (item: MockListItem) => void;
    confirmButtonOptions: {onConfirm: () => void};
};

type PageProps = {policy: Policy; route: {params: {policyID: string}}};

// The identity-mocked withPolicy renders the inner component, so re-type the export to the props it actually accepts.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- re-typing the identity-mocked HOC export to its inner component props
const Page = WorkspaceAutoReportingFrequencyPage as unknown as React.ComponentType<PageProps>;

function pageElement(policy: Partial<Policy>) {
    return (
        <Page
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only the frequency and offset fields matter for this page
            policy={{id: 'policy1', type: CONST.POLICY.TYPE.TEAM, role: CONST.POLICY.ROLE.ADMIN, harvesting: {enabled: true}, ...policy} as Policy}
            route={{params: {policyID: 'policy1'}}}
        />
    );
}

describe('WorkspaceAutoReportingFrequencyPage', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows the props captured from the mocked SelectionList in this test
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as unknown as MockSelectionListProps | undefined;
    const mockedSetFrequency = jest.mocked(setWorkspaceAutoReportingFrequency);
    const mockedSetMonthlyOffset = jest.mocked(setWorkspaceAutoReportingMonthlyOffset);

    const selectAndSave = (frequency: string) => {
        act(() => {
            getSelectionListProps()?.onSelectRow({text: frequency, keyForList: frequency, isSelected: false});
        });
        act(() => {
            getSelectionListProps()?.confirmButtonOptions.onConfirm();
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('re-saves the chosen date of month after switching the frequency to Monthly', () => {
        // Given a weekly workspace where the user already picked the 15th on the Date of month page
        render(pageElement({autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY, autoReportingOffset: 15}));

        // When the user selects Monthly and saves
        selectAndSave(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY);

        // Then the date is saved after the frequency, because the frequency change resets the date on the server
        expect(mockedSetFrequency).toHaveBeenCalledTimes(1);
        expect(mockedSetMonthlyOffset).toHaveBeenCalledTimes(1);
        expect(mockedSetMonthlyOffset).toHaveBeenCalledWith('policy1', 15, 15);
        expect(mockedSetFrequency.mock.invocationCallOrder.at(0)).toBeLessThan(mockedSetMonthlyOffset.mock.invocationCallOrder.at(0) ?? 0);
    });

    it('re-saves a named date of month after switching the frequency to Monthly', () => {
        // Given a workspace that was moved off Monthly but kept "last day of month" as its date
        render(pageElement({autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY, autoReportingOffset: CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH}));

        // When the user switches back to Monthly and saves
        selectAndSave(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY);

        // Then the named date is written again so it is not reset to the 1st
        expect(mockedSetMonthlyOffset).toHaveBeenCalledWith('policy1', CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH, CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH);
    });

    it('does not save the date of month when switching to a frequency other than Monthly', () => {
        // Given a monthly workspace with the 15th as its date
        render(pageElement({autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY, autoReportingOffset: 15}));

        // When the user switches to Weekly and saves
        selectAndSave(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY);

        // Then only the frequency is saved, since the date of month does not apply
        expect(mockedSetFrequency).toHaveBeenCalledTimes(1);
        expect(mockedSetMonthlyOffset).not.toHaveBeenCalled();
    });

    it('does not save the date of month when the workspace has none', () => {
        // Given a weekly workspace that never had a date of month set
        render(pageElement({autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY}));

        // When the user selects Monthly and saves
        selectAndSave(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY);

        // Then only the frequency is saved, leaving the server default in place
        expect(mockedSetFrequency).toHaveBeenCalledTimes(1);
        expect(mockedSetMonthlyOffset).not.toHaveBeenCalled();
    });
});
