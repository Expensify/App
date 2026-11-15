import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import {clearOfficeLocationErrors, updateOfficeLocation} from '@libs/actions/Policy/DistanceRate';
import {clearInviteDraft} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';

import WorkspaceOverviewPage from '@pages/workspace/WorkspaceOverviewPage';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';
import type ReactNative from 'react-native';

import React from 'react';

import createMock from '../utils/createMock';

const POLICY_ID = 'workspace-test';
const OFFICE_ID = 'office-test';
const mockShowConfirmModal = jest.fn();
const mockBuildDynamicRoute = jest.fn((path: string) => path);
const mockPolicy = createMock<Policy>({
    id: POLICY_ID,
    name: 'Workspace scope test',
    role: CONST.POLICY.ROLE.ADMIN,
    type: CONST.POLICY.TYPE.CORPORATE,
    customRules: 'Keep receipts',
    officeLocations: {
        [OFFICE_ID]: {name: 'Main office', address: {}, isDefault: true, errors: {officeError: 'Office error'}},
    },
});

jest.mock('@pages/workspace/withPolicy', () => ({__esModule: true, default: (component: unknown) => component}));
jest.mock('@pages/workspace/WorkspacePageWithSections', () => ({
    __esModule: true,
    default: ({children, headerContent}: {children: React.ReactNode; headerContent: React.ReactNode}) => (
        <>
            {headerContent}
            {children}
        </>
    ),
}));
jest.mock('@components/Section', () => ({__esModule: true, default: ({children}: {children: React.ReactNode}) => children}));
jest.mock('@components/OfflineWithFeedback', () => ({__esModule: true, default: jest.fn(({children}: {children: React.ReactNode}) => children)}));
jest.mock('@components/MenuItem/presets/MenuItemSectionRoot', () => {
    const {Pressable} = jest.requireActual<typeof ReactNative>('react-native');
    return {
        __esModule: true,
        default: ({sentryLabel, onPress}: {sentryLabel: string; onPress?: () => void}) => (
            <Pressable
                accessibilityRole="button"
                testID={sentryLabel}
                onPress={onPress}
            />
        ),
    };
});
jest.mock('@components/Button', () => {
    const {Pressable} = jest.requireActual<typeof ReactNative>('react-native');
    function Button({sentryLabel, onPress}: {sentryLabel: string; onPress?: () => void}) {
        return (
            <Pressable
                accessibilityRole="button"
                testID={sentryLabel}
                onPress={onPress}
            />
        );
    }
    return {__esModule: true, default: Object.assign(Button, {Icon: () => null, Text: () => null})};
});
jest.mock('@components/MenuItemWithTopDescription', () => () => null);
jest.mock('@components/AvatarWithImagePicker', () => () => null);
jest.mock('@components/ButtonWithDropdownMenu', () => () => null);
jest.mock('@components/AttachmentPicker', () => () => null);
jest.mock('@components/LockedAccountModalProvider', () => ({
    useLockedAccountState: () => ({isAccountLocked: false}),
    useLockedAccountActions: () => ({showLockedAccountModal: jest.fn()}),
}));
jest.mock('@components/OnyxListItemProvider', () => ({usePersonalDetails: () => ({})}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, localeCompare: (left: string, right: string) => left.localeCompare(right)}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));
jest.mock('@hooks/useLayoutSpacing', () => () => ({}));
jest.mock('@hooks/useShouldDisplayButtonsInSeparateLine', () => () => false);
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencySymbol: () => '$'})}));
jest.mock('@hooks/useScreenBoundDynamicRoute', () => () => mockBuildDynamicRoute);
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => true}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: mockShowConfirmModal}));
jest.mock('@hooks/useDefaultFundID', () => () => undefined);
jest.mock('@hooks/useShouldBlockCurrencyChange', () => () => false);
jest.mock('@hooks/useIsApproverOfOutstandingPolicyReports', () => () => false);
jest.mock('@hooks/useWorkspaceDocumentTitle', () => () => {});
jest.mock('@hooks/useNetwork', () => () => ({}));
jest.mock('@libs/PolicyUtils', () => ({
    canEditWorkspaceSettings: () => true,
    canUnarchivePolicy: () => false,
    getRulesDocumentSourceURL: () => '',
    getUserFriendlyWorkspaceType: () => '',
    hasCompanyAddress: () => true,
    isArchivedPolicy: () => false,
    isPendingDeletePolicy: () => false,
    isPolicyOwner: () => false,
}));
jest.mock('@libs/actions/Policy/DistanceRate', () => ({clearOfficeLocationErrors: jest.fn(), updateOfficeLocation: jest.fn()}));
jest.mock('@libs/actions/Policy/Member', () => ({clearInviteDraft: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));
jest.mock('@userActions/Session', () => ({callIfAuthenticated: (callback: () => void) => callback}));
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
    useFocusEffect: () => {},
}));

function renderPage(params: {policyID?: string} | undefined) {
    render(
        <WorkspaceOverviewPage
            // The policy deliberately remains available when route params are lost during navigation recovery.
            {...createMock<React.ComponentProps<typeof WorkspaceOverviewPage> & {policy: Policy}>({
                policy: mockPolicy,
                route: {key: 'workspace-overview', name: SCREENS.WORKSPACE.PROFILE, params},
            })}
        />,
    );
}

function dismissOfficeError() {
    const props = jest
        .mocked(OfflineWithFeedback)
        .mock.calls.map(([callProps]) => callProps)
        .find((callProps) => callProps.errors === mockPolicy.officeLocations?.[OFFICE_ID]?.errors);
    expect(props?.onClose).toBeDefined();
    act(() => props?.onClose?.());
}

describe('Workspace Overview policy scope guards', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});
    });

    it.each([undefined, {}, {policyID: ''}])('skips scoped writes and navigation with missing policy params: %s', async (params) => {
        // Given an editable policy whose route lost its scope while child state was rebuilt
        renderPage(params);

        // When the user tries each route-scoped action, including clearing an office error
        for (const label of [
            CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.INVITE_BUTTON,
            CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.COMPANY_ADDRESS_OFFICE_LOCATION,
            CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.OFFICE_LOCATION,
            CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.ADD_OFFICE_LOCATION,
            CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.CUSTOM_RULES,
        ]) {
            fireEvent.press(screen.getByTestId(label));
        }
        await act(async () => dismissOfficeError());

        // Then no undefined-scoped mutation, URL, or confirmation is produced
        expect(clearInviteDraft).not.toHaveBeenCalled();
        expect(updateOfficeLocation).not.toHaveBeenCalled();
        expect(clearOfficeLocationErrors).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(mockBuildDynamicRoute).not.toHaveBeenCalled();
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('preserves scoped actions when the route has a policy ID', async () => {
        // Given an editable workspace with a valid route scope
        renderPage({policyID: POLICY_ID});

        // When the user invokes the same actions and confirms changing the primary office
        for (const label of [
            CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.INVITE_BUTTON,
            CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.COMPANY_ADDRESS_OFFICE_LOCATION,
            CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.OFFICE_LOCATION,
            CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.ADD_OFFICE_LOCATION,
            CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.CUSTOM_RULES,
        ]) {
            fireEvent.press(screen.getByTestId(label));
        }
        await act(async () => dismissOfficeError());

        // Then each scoped mutation and destination retains the valid workspace identity
        expect(clearInviteDraft).toHaveBeenCalledWith(POLICY_ID);
        expect(updateOfficeLocation).toHaveBeenCalledWith(POLICY_ID, mockPolicy.officeLocations, OFFICE_ID, {isDefault: false});
        expect(clearOfficeLocationErrors).toHaveBeenCalledWith(POLICY_ID, OFFICE_ID, undefined);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_OVERVIEW_OFFICE_LOCATION_EDIT.getRoute(POLICY_ID, OFFICE_ID));
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_OVERVIEW_OFFICE_LOCATION_ADD.getRoute(POLICY_ID));
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RULES_CUSTOM.getRoute(POLICY_ID));
    });
});
