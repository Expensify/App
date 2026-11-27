import {render, screen} from '@testing-library/react-native';

import type {SelectionScreenProps} from '@components/SelectionScreen';
import Text from '@components/Text';

import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import XeroMapTrackingCategoryConfigurationPage from '@pages/workspace/accounting/xero/XeroMapTrackingCategoryConfigurationPage';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';

import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import {findFocusedRoute} from '@react-navigation/native';
import React from 'react';

import createMock from '../../utils/createMock';

const MockText = Text;
const POLICY_ID = 'ABC123';
const CATEGORY_ID = '42';
const mockPolicy = createMock<Policy>({id: POLICY_ID});
let mockRoute: ReturnType<typeof findFocusedRoute>;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useRoute: () => mockRoute,
}));
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string, ...params: unknown[]) => [key, ...params].join(' '),
}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@libs/actions/connections/Xero');
jest.mock('@libs/actions/Policy/Policy');
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));
jest.mock('@components/SelectionScreen', () => ({headerTitleAlreadyTranslated, headerContent}: SelectionScreenProps) => (
    <>
        <MockText>{headerTitleAlreadyTranslated}</MockText>
        {headerContent}
    </>
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

function renderPageFromRoute(categoryName: string) {
    const path = ROUTES.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES_MAP.getRoute(POLICY_ID, CATEGORY_ID, categoryName);
    mockRoute = findFocusedRoute(getStateFromPath(path));

    return render(
        <XeroMapTrackingCategoryConfigurationPage
            route={createMock<React.ComponentProps<typeof XeroMapTrackingCategoryConfigurationPage>['route']>({params: {policyID: POLICY_ID}})}
            isConnectionDataFetchNeeded={false}
        />,
    );
}

describe('XeroMapTrackingCategoryConfigurationPage', () => {
    it.each([
        ['a normal name', 'Region'],
        ['a percent sign', '100% Billable'],
        ['encoded-looking text', 'Region%20A'],
        ['an encoded percent sign', 'Cost %25'],
    ])('shows a category with %s using its exact name', (_, categoryName) => {
        // Given the page is opened through the mapping route for a tracking category
        // When it renders with the params that navigation decoded from the route
        renderPageFromRoute(categoryName);

        // Then it doesn't crash and shows the exact category name in the title and description
        expect(screen.getByText(`workspace.xero.mapTrackingCategoryTo ${categoryName}`)).toBeOnTheScreen();
        expect(screen.getByText(`workspace.xero.mapTrackingCategoryToDescription ${categoryName}`)).toBeOnTheScreen();
    });
});
