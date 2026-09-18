import {fireEvent, render, screen, within} from '@testing-library/react-native';

import type ConnectionLayout from '@components/ConnectionLayout';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';

import * as QuickbooksOnline from '@libs/actions/connections/QuickbooksOnline';
import {SettingsModalStackNavigator} from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import Navigation from '@libs/Navigation/Navigation';

import type {SettingsNavigatorParamList} from '@navigation/types';

import QuickbooksCustomDimensionPage from '@pages/workspace/accounting/qbo/import/QuickbooksCustomDimensionPage';
import QuickbooksImportPage from '@pages/workspace/accounting/qbo/import/QuickbooksImportPage';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import type {ToggleSettingOptionRowProps} from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import {createNavigationContainerRef, NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {Switch, View} from 'react-native';

import createMock from '../../utils/createMock';

const MockSwitch = Switch;
const MockView = View;
const MockOfflineWithFeedback = OfflineWithFeedback;
const MockText = Text;
const MockPressable = PressableWithoutFeedback;
const POLICY_ID = '123';
let mockPolicy: Policy;

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));
jest.mock('@hooks/useThemeStyles', () => () => ({modalStackNavigatorContainerWidth: () => ({})}));
jest.mock('@libs/actions/connections/QuickbooksOnline');
jest.mock('@libs/Navigation/AppNavigator/ModalStackNavigators/useModalStackScreenOptions', () => () => () => ({}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));
jest.mock('@userActions/Policy/Policy');
jest.mock(
    '@components/ConnectionLayout',
    () =>
        ({children, headerTitleAlreadyTranslated, onBackButtonPress, shouldBeForceBlocked}: React.ComponentProps<typeof ConnectionLayout>) =>
            shouldBeForceBlocked ? (
                <MockText>Not found</MockText>
            ) : (
                <>
                    <MockText>{headerTitleAlreadyTranslated}</MockText>
                    <MockPressable
                        accessibilityLabel="Back"
                        onPress={onBackButtonPress}
                    />
                    {children}
                </>
            ),
);
jest.mock('@components/OfflineWithFeedback', () => ({children, pendingAction}: React.ComponentProps<typeof OfflineWithFeedback>) => (
    <MockView testID={pendingAction ? 'pending-setting' : undefined}>{children}</MockView>
));
jest.mock('@components/MenuItemWithTopDescription', () => ({description, title, onPress, interactive}: {description: string; title: string; onPress?: () => void; interactive?: boolean}) => (
    <MockPressable
        accessibilityLabel={description}
        accessibilityRole="button"
        onPress={onPress}
        disabled={interactive === false}
    >
        <MockText>{description}</MockText>
        <MockText>{title}</MockText>
    </MockPressable>
));
jest.mock('@pages/workspace/withPolicyConnections', () => (WrappedComponent: React.ComponentType<WithPolicyProps>) => {
    function MockPolicyConnections({route}: Pick<WithPolicyProps, 'route'>) {
        return (
            <WrappedComponent
                policy={mockPolicy}
                policyDraft={undefined}
                isLoadingPolicy={false}
                route={route}
            />
        );
    }
    return MockPolicyConnections;
});
jest.mock(
    '@pages/workspace/workflows/ToggleSettingsOptionRow',
    () =>
        ({isActive, onToggle, disabled, switchAccessibilityLabel, pendingAction, subMenuItems}: ToggleSettingOptionRowProps) => (
            <MockOfflineWithFeedback pendingAction={pendingAction}>
                <MockSwitch
                    accessibilityRole="switch"
                    accessibilityLabel={switchAccessibilityLabel}
                    accessibilityState={{disabled}}
                    value={isActive}
                    onValueChange={onToggle}
                    disabled={disabled}
                />
                {isActive && subMenuItems}
            </MockOfflineWithFeedback>
        ),
);

function renderImportPage() {
    return render(
        <QuickbooksImportPage
            route={createMock<WithPolicyProps['route']>({
                params: {policyID: POLICY_ID},
            })}
            isConnectionDataFetchNeeded={false}
        />,
    );
}

function renderDimensionPage(dimensionID: string) {
    return render(
        <QuickbooksCustomDimensionPage
            route={createMock<React.ComponentProps<typeof QuickbooksCustomDimensionPage>['route']>({params: {policyID: POLICY_ID, dimensionID}})}
            isConnectionDataFetchNeeded={false}
        />,
    );
}

describe('Quickbooks custom dimension import', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPolicy = createMock<Policy>({
            id: POLICY_ID,
            connections: {
                quickbooksOnline: {
                    config: {
                        companyName: 'Example Entity',
                        credentials: {
                            scope: CONST.POLICY.CONNECTIONS.INTUIT_ENTERPRISE_SUITE_SCOPE,
                        },
                        syncClasses: CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
                        syncCustomDimensions: {
                            department: CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                        },
                    },
                    data: {
                        country: CONST.COUNTRY.US,
                        customDimensions: [
                            {id: 'department', label: 'Department', active: true},
                            {id: 'project', label: 'Project', active: true},
                            {id: 'revenue', label: 'Revenue Type', active: true},
                            {id: 'old', label: 'Old Dimension', active: false},
                        ],
                    },
                },
            },
        });
    });

    it('shows import statuses only for active dimensions', () => {
        // Given active custom dimensions with different import settings
        renderImportPage();
        expect(within(screen.getByRole('button', {name: 'Department'})).getByText('workspace.accounting.importTypes.TAG')).toBeOnTheScreen();
        expect(within(screen.getByRole('button', {name: 'Project'})).getByText('workspace.accounting.importTypes.NONE')).toBeOnTheScreen();
        expect(screen.queryByText('Old Dimension')).toBeNull();
        expect(screen.queryAllByRole('switch')).toHaveLength(0);
    });

    it('enables an individual dimension from its settings page', () => {
        // Given a dimension that is not imported
        renderDimensionPage('project');
        expect(screen.getByText('Project')).toBeOnTheScreen();
        expect(screen.getByLabelText('Project').props.value).toBe(false);

        // When enabling its import toggle
        fireEvent(screen.getByLabelText('Project'), 'valueChange', true);

        // Then only that dimension is selected for import as tags
        expect(QuickbooksOnline.updateQuickbooksOnlineSyncCustomDimensions).toHaveBeenCalledWith(POLICY_ID, {project: 'TAG'}, {department: 'TAG'});
        expect(QuickbooksOnline.updateQuickbooksOnlineSyncClasses).not.toHaveBeenCalled();
    });

    it('opens the registered dimension page from its URL with the correct workspace and dimension', () => {
        // Given a URL for an active dimension in this workspace
        const path = ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOM_DIMENSION.getRoute(POLICY_ID, 'project');
        expect(path).toBe('workspaces/123/accounting/quickbooks-online/import/custom-dimension/project');
        const modalState = getStateFromPath(path).routes.find((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)?.state;
        const settingsState = modalState?.routes.find((route) => route.name === SCREENS.RIGHT_MODAL.SETTINGS)?.state;
        expect(settingsState).toBeDefined();
        const navigation = createNavigationContainerRef<SettingsNavigatorParamList>();

        // When the URL is opened through the registered settings navigator
        render(
            <NavigationContainer
                ref={navigation}
                initialState={settingsState}
            >
                <SettingsModalStackNavigator />
            </NavigationContainer>,
        );

        // Then the correct dimension page receives both route parameters
        expect(navigation.getCurrentRoute()).toEqual(
            expect.objectContaining({
                name: SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOM_DIMENSION,
                params: {policyID: POLICY_ID, dimensionID: 'project'},
            }),
        );
        expect(screen.getByText('Project')).toBeOnTheScreen();

        // And enabling import saves the dimension for the workspace from the URL
        fireEvent(screen.getByLabelText('Project'), 'valueChange', true);
        expect(QuickbooksOnline.updateQuickbooksOnlineSyncCustomDimensions).toHaveBeenCalledWith(POLICY_ID, {project: 'TAG'}, {department: 'TAG'});
    });

    it('disables an imported dimension from its settings page', () => {
        // Given a dimension imported as tags
        renderDimensionPage('department');
        expect(screen.getByLabelText('Department').props.value).toBe(true);
        expect(screen.getByText('workspace.common.tags')).toBeOnTheScreen();
        expect(screen.getByRole('button', {name: 'workspace.common.displayedAs'})).toBeDisabled();

        // When disabling its import toggle
        fireEvent(screen.getByLabelText('Department'), 'valueChange', false);

        // Then only that dimension is disabled
        expect(QuickbooksOnline.updateQuickbooksOnlineSyncCustomDimensions).toHaveBeenCalledWith(POLICY_ID, {department: 'NONE'}, {department: 'TAG'});
    });

    it('returns to the workspace import list', () => {
        // Given an open dimension settings page
        renderDimensionPage('department');

        // When navigating back
        fireEvent.press(screen.getByLabelText('Back'));

        // Then the fallback route is the same workspace import list
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.getRoute(POLICY_ID));
    });

    it('keeps the import toggle enabled while its save is pending', () => {
        // Given a pending custom dimension save
        const config = mockPolicy.connections?.quickbooksOnline?.config;
        if (!config) {
            throw new Error('Missing QBO fixture');
        }
        config.pendingFields = {
            [`${CONST.QUICKBOOKS_CONFIG.SYNC_CUSTOM_DIMENSIONS}_department`]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        };

        // When opening a dimension settings page
        renderDimensionPage('department');

        // Then saving does not lock the toggle
        expect(screen.getByLabelText('Department')).toBeEnabled();
        expect(screen.getByTestId('pending-setting')).toBeOnTheScreen();
    });

    it('marks only the edited dimension pending in the import list', () => {
        // Given a pending Department save
        const config = mockPolicy.connections?.quickbooksOnline?.config;
        if (!config) {
            throw new Error('Missing QBO fixture');
        }
        config.pendingFields = {
            [`${CONST.QUICKBOOKS_CONFIG.SYNC_CUSTOM_DIMENSIONS}_department`]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        };

        // When returning to the import list
        renderImportPage();

        // Then the other dimensions are not pending
        expect(screen.getAllByTestId('pending-setting')).toHaveLength(1);
        expect(within(screen.getByTestId('pending-setting')).getByText('Department')).toBeOnTheScreen();
    });

    it.each(['old', 'missing'])('blocks unavailable dimension %s', (dimensionID) => {
        // Given an inactive or missing dimension
        // When opening its settings page
        renderDimensionPage(dimensionID);

        // Then no import toggle is available
        expect(screen.getByText('Not found')).toBeOnTheScreen();
        expect(screen.queryAllByRole('switch')).toHaveLength(0);
    });

    it('keeps the standard QBO import screen unchanged', () => {
        // Given a standard QuickBooks Online connection
        const config = mockPolicy.connections?.quickbooksOnline?.config;
        if (!config) {
            throw new Error('Missing QBO fixture');
        }
        config.credentials.scope = 'com.intuit.quickbooks.accounting';

        // When opening the import list
        renderImportPage();

        // Then only standard settings are shown
        expect(screen.queryAllByRole('switch')).toHaveLength(0);
        expect(screen.queryByText('Department')).toBeNull();
        expect(screen.getByText('workspace.qbo.classes')).toBeOnTheScreen();
        expect(screen.getByText('workspace.qbo.customers')).toBeOnTheScreen();
        expect(screen.getByText('workspace.qbo.locations')).toBeOnTheScreen();
    });
});
