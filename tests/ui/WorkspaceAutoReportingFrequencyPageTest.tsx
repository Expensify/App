import {act, render} from '@testing-library/react-native';

import type {ListItem, SelectionListProps} from '@components/SelectionList/types';

import Navigation from '@libs/Navigation/Navigation';

import WorkspaceAutoReportingFrequencyPage from '@pages/workspace/workflows/WorkspaceAutoReportingFrequencyPage';

import {setWorkspaceAutoReportingFrequency} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React from 'react';
import createMock from 'tests/utils/createMock';

type Frequency = ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;
type FrequencyRow = ListItem<Frequency>;
const mockSelectionList = jest.fn<void, [SelectionListProps<FrequencyRow>]>();

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
jest.mock('@components/SelectionList', () => (props: SelectionListProps<FrequencyRow>) => {
    mockSelectionList(props);
    return null;
});
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
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
}));
type PageProps = {policy: Policy; route: {params: {policyID: string}}};
// The mocked withPolicy HOC returns the inner page; only its policy and route are supplied by this test.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const Page = WorkspaceAutoReportingFrequencyPage as unknown as React.ComponentType<PageProps>;
const props = () => {
    const value = mockSelectionList.mock.lastCall?.[0];
    const onSelectRow = value?.onSelectRow;
    const onConfirm = value?.confirmButtonOptions?.onConfirm;
    if (!value || !value.confirmButtonOptions || !onSelectRow || !onConfirm) {
        throw new Error('Frequency list did not render');
    }
    return {...value, confirmButtonOptions: {...value.confirmButtonOptions, onConfirm}, onSelectRow};
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
    beforeEach(() => jest.clearAllMocks());
    it('keeps Submit frequencies ordered without instant and shows the monthly footer', () => {
        // Given a Submit policy currently reporting monthly
        renderPage(CONST.POLICY.TYPE.SUBMIT);
        // When the real page constructs its selection rows
        const selection = props();
        // Then instant is omitted, order is stable, and the selected monthly row owns the footer
        expect(selection.data.map((row) => row.keyForList)).toEqual(['monthly', 'immediate', 'weekly', 'semimonthly', 'trip', 'manual']);
        expect(selection.data.at(0)?.footerContent).toBeTruthy();
        expect(selection.confirmButtonOptions.isDisabled).toBe(true);
    });
    it('appends instant for an ordinary workspace and saves the selected key', () => {
        // Given a group workspace reporting monthly
        renderPage(CONST.POLICY.TYPE.TEAM);
        // When the user selects instant and confirms
        const instant = props().data.at(-1);
        expect(instant?.keyForList).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
        if (!instant) {
            throw new Error('Instant row missing');
        }
        act(() => props().onSelectRow(instant));
        expect(props().confirmButtonOptions.isDisabled).toBe(false);
        expect(props().data.find((row) => row.keyForList === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY)?.footerContent).toBeFalsy();
        act(() => props().confirmButtonOptions.onConfirm());
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
