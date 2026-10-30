import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import type PillSelector from '@components/PillSelector';

import Navigation from '@libs/Navigation/Navigation';

import type AutoReportingSubmitOnRows from '@pages/workspace/workflows/AutoReportingSubmitOnRows';
import WorkspaceAutoReportingFrequencyPage from '@pages/workspace/workflows/WorkspaceAutoReportingFrequencyPage';

import {setWorkspaceAutoReportingFrequency} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';
import createMock from 'tests/utils/createMock';

type Frequency = ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;
type FrequencyPillsProps = React.ComponentProps<typeof PillSelector<Frequency>>;
const mockPillSelector = jest.fn<void, [FrequencyPillsProps]>();
const mockSubmitOnRows = jest.fn<void, [React.ComponentProps<typeof AutoReportingSubmitOnRows>]>();

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
jest.mock('@components/PillSelector', () => (props: FrequencyPillsProps) => {
    mockPillSelector(props);
    return null;
});
jest.mock('@pages/workspace/workflows/AutoReportingSubmitOnRows', () => (props: React.ComponentProps<typeof AutoReportingSubmitOnRows>) => {
    mockSubmitOnRows(props);
    return null;
});
jest.mock('@components/Header/composed/HeaderWithBackButtonAndTitle', () => jest.fn(() => null));
jest.mock('@components/RenderHTML', () => jest.fn(() => null));
jest.mock(
    '@components/OfflineWithFeedback',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@hooks/useReviewWorkspaceSettingsTaskCompletion', () => () => () => undefined);
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
    toLocaleOrdinal: (day: number) => String(day),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {goBack: jest.fn(), navigate: jest.fn()},
}));
jest.mock('@userActions/Policy/Policy', () => ({
    setWorkspaceAutoReportingFrequency: jest.fn(),
    clearPolicyErrorField: jest.fn(),
    setWorkspaceAutoReportingOffset: jest.fn(),
}));
type PageProps = {policy: Policy; route: {params: {policyID: string}}};
// The mocked withPolicy HOC returns the inner page; only its policy and route are supplied by this test.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const Page = WorkspaceAutoReportingFrequencyPage as unknown as React.ComponentType<PageProps>;
const props = () => {
    const value = mockPillSelector.mock.lastCall?.[0];
    if (!value) {
        throw new Error('Frequency pills did not render');
    }
    return value;
};
function renderPage(type: Policy['type']) {
    const policy = createMock<Policy>({
        id: 'policy1',
        type,
        autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
    });
    return render(
        <Page
            policy={policy}
            route={{params: {policyID: policy.id}}}
        />,
    );
}
describe('WorkspaceAutoReportingFrequencyPage', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });
    it('keeps Submit frequencies ordered without instant and passes the monthly schedule to its rows', () => {
        // Given a Submit policy currently reporting monthly
        renderPage(CONST.POLICY.TYPE.SUBMIT);
        // When the real page constructs the frequency pills and schedule rows
        const selection = props();
        // Then instant is omitted, order is stable, and the monthly schedule remains selected
        expect(selection.options.map((option) => option.key)).toEqual(['immediate', 'weekly', 'semimonthly', 'monthly', 'trip', 'manual']);
        expect(selection.selectedKey).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY);
        expect(screen.getByText('common.save')).toBeDisabled();
        expect(mockSubmitOnRows.mock.lastCall?.[0].frequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY);
    });
    it('offers instant first for an ordinary workspace and saves the selected key', async () => {
        // Given a group workspace reporting monthly
        renderPage(CONST.POLICY.TYPE.TEAM);
        // When the user selects instant through the page's actual draft update and saves
        expect(props().options.at(0)?.key).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
        act(() => props().onSelect(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT));
        await waitFor(() => expect(props().selectedKey).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT));
        expect(mockSubmitOnRows.mock.lastCall?.[0].frequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
        expect(screen.getByText('common.save')).toBeEnabled();
        fireEvent.press(screen.getByText('common.save'));
        // Then the page sends the exact selected frequency and navigates back
        expect(setWorkspaceAutoReportingFrequency).toHaveBeenCalledWith(
            'policy1',
            CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
            undefined,
            undefined,
        );
        expect(Navigation.goBack).toHaveBeenCalled();
    });
});
