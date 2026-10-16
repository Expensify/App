import {act, fireEvent, render, screen} from '@testing-library/react-native';

import MockText from '@components/Text';

import Navigation from '@navigation/Navigation';

import DynamicWorkspaceOverviewPlanTypePage from '@pages/workspace/DynamicWorkspaceOverviewPlanTypePage';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import React from 'react';
import {View as MockView} from 'react-native';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';

let mockPolicy: Policy;
let mockSubscription: {type: string} | undefined;
let mockSelection: {data: Array<{value: string; isSelected: boolean}>; isDisabled: boolean; onSelectRow: (item: {value: string}) => void} | undefined;
const mockNavigate = jest.fn();
jest.mock('@pages/workspace/withPolicy', () => ({__esModule: true, default: (Component: React.ComponentType<{policy: Policy}>) => () => <Component policy={mockPolicy} />}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({__esModule: true, default: ({children}: {children: React.ReactNode}) => children}));
jest.mock('@components/ScreenWrapper', () => ({__esModule: true, default: ({children}: {children: React.ReactNode}) => <MockView>{children}</MockView>}));
jest.mock('@components/SelectionList', () => ({
    __esModule: true,
    default: (props: typeof mockSelection & {footerContent: React.ReactNode}) => {
        mockSelection = props;
        return <MockView>{props.footerContent}</MockView>;
    },
}));
jest.mock('@components/Button', () => ({
    __esModule: true,
    default: Object.assign(
        ({children, onPress}: {children: React.ReactNode; onPress: () => void}) => (
            <MockView
                onStartShouldSetResponder={() => true}
                onResponderRelease={onPress}
            >
                {children}
            </MockView>
        ),
        {
            Text: ({children}: {children: React.ReactNode}) => <MockText>{children}</MockText>,
        },
    ),
}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key, dateFnsLocale: undefined})}));
jest.mock('@hooks/usePrivateSubscription', () => ({__esModule: true, default: () => mockSubscription}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => ({})}));
jest.mock('@hooks/useTheme', () => ({__esModule: true, default: () => ({success: 'green'})}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({Lock: 'lock'})}));
jest.mock('@libs/actions/Policy/Plan', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@navigation/Navigation', () => ({__esModule: true, default: {navigate: mockNavigate, goBack: jest.fn(), getActiveRoute: () => ''}, navigate: mockNavigate}));
beforeEach(() => {
    mockNavigate.mockClear();
    Navigation.navigate = mockNavigate;
    mockSubscription = undefined;
    mockSelection = undefined;
});
it.each([CONST.POLICY.TYPE.SUBMIT, CONST.POLICY.TYPE.TEAM, CONST.POLICY.TYPE.CORPORATE])('shows the allowed rows for %s', (type) => {
    // Given a workspace of the specified plan type
    mockPolicy = {...createRandomPolicy(1, type), canDowngrade: true};
    // When the real plan picker renders
    render(<DynamicWorkspaceOverviewPlanTypePage route={createMock<React.ComponentProps<typeof DynamicWorkspaceOverviewPlanTypePage>['route']>({})} />);
    // Then Personal is absent and Submit is only available for an existing Submit workspace
    expect(mockSelection?.data.map((item) => item.value)).toEqual(type === CONST.POLICY.TYPE.SUBMIT ? ['submit2026', 'team', 'corporate'] : ['team', 'corporate']);
});
it('routes a Submit-to-Team selection through upgrade', () => {
    // Given a Submit workspace with Team available
    mockPolicy = {...createRandomPolicy(1, CONST.POLICY.TYPE.SUBMIT), canDowngrade: true};
    render(<DynamicWorkspaceOverviewPlanTypePage route={createMock<React.ComponentProps<typeof DynamicWorkspaceOverviewPlanTypePage>['route']>({})} />);
    // When Team is selected and saved
    act(() => mockSelection?.onSelectRow({value: CONST.POLICY.TYPE.TEAM}));
    fireEvent.press(screen.getByText('common.save'));
    // Then the picker navigates to the upgrade route
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('upgrade'));
});
it('locks annual Control without downgrade permission', () => {
    // Given a locked annual Control workspace
    mockPolicy = {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), canDowngrade: false};
    mockSubscription = {type: CONST.SUBSCRIPTION.TYPE.ANNUAL};
    // When the real picker renders
    render(<DynamicWorkspaceOverviewPlanTypePage route={createMock<React.ComponentProps<typeof DynamicWorkspaceOverviewPlanTypePage>['route']>({})} />);
    // Then selection is disabled and confirmation replaces Save
    expect(mockSelection?.isDisabled).toBe(true);
    expect(screen.getByText('common.buttonConfirm')).toBeTruthy();
});
