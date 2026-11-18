import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import Icon from '@components/Icon';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import * as Browser from '@libs/Browser';
import Navigation from '@libs/Navigation/Navigation';

import accountingOptions from '@pages/OnboardingAccounting/accountingOptions';
import BaseOnboardingAccounting from '@pages/OnboardingAccounting/BaseOnboardingAccounting';
import BaseOnboardingInterestedFeatures from '@pages/OnboardingInterestedFeatures/BaseOnboardingInterestedFeatures';

import CONST from '@src/CONST';
import type {OnboardingAccounting} from '@src/CONST';
import type {OnboardingModalNavigatorParamList} from '@src/libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type MockCompleteOnboardingParams = {
    featuresMap: Array<{id: string; enabled: boolean}>;
    userReportedIntegration?: string | null;
    userReportedIntegrationName?: string;
};

const mockCompleteOnboardingFlow = jest.fn<void, [MockCompleteOnboardingParams]>();
jest.mock('@hooks/useCompleteOnboarding', () => () => ({completeOnboardingFlow: mockCompleteOnboardingFlow, isLoading: false}));
const mockIsBetaEnabled = jest.fn(() => true);
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: mockIsBetaEnabled}));
TestHelper.setupGlobalFetchMock();

const Stack = createStackNavigator<OnboardingModalNavigatorParamList>();
const navigate = jest.spyOn(Navigation, 'navigate');
const goBack = jest.spyOn(Navigation, 'goBack');
const isMobileSafari = jest.spyOn(Browser, 'isMobileSafari');
jest.spyOn(Navigation, 'getTopmostReportId').mockReturnValue(undefined);

function renderInterestedFeaturesPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={SCREENS.ONBOARDING.INTERESTED_FEATURES}>
                    <Stack.Screen name={SCREENS.ONBOARDING.INTERESTED_FEATURES}>
                        {(props) => (
                            <BaseOnboardingInterestedFeatures
                                {...props}
                                shouldUseNativeStyles={false}
                            />
                        )}
                    </Stack.Screen>
                </Stack.Navigator>
            </NavigationContainer>
        </ComposeProviders>,
    );
}

function renderAccountingPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={SCREENS.ONBOARDING.ACCOUNTING}>
                    <Stack.Screen name={SCREENS.ONBOARDING.ACCOUNTING}>
                        {(props) => (
                            <BaseOnboardingAccounting
                                {...props}
                                shouldUseNativeStyles={false}
                            />
                        )}
                    </Stack.Screen>
                </Stack.Navigator>
            </NavigationContainer>
        </ComposeProviders>,
    );
}

function searchFor(query: string) {
    fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.search')), query);
}

function continueOnboarding() {
    fireEvent.press(screen.getByText(TestHelper.translateLocal('common.continue')));
}

describe('Onboarding interested features and accounting pages', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(() => {
        mockIsBetaEnabled.mockReturnValue(true);
        isMobileSafari.mockReturnValue(false);
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: true,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isInLandscapeMode: false,
        } satisfies ResponsiveLayoutResult);
    });
    afterEach(async () => {
        await act(async () => Onyx.clear());
        jest.clearAllMocks();
    });

    it('navigates to accounting when accounting remains enabled', async () => {
        // Given the default feature selection
        renderInterestedFeaturesPage();
        await waitForBatchedUpdatesWithAct();
        // When continuing
        continueOnboarding();
        // Then accounting is shown before onboarding completes
        expect(navigate).toHaveBeenCalledWith(ROUTES.ONBOARDING_ACCOUNTING.getRoute());
        expect(mockCompleteOnboardingFlow).not.toHaveBeenCalled();
    });

    it('clears the accounting draft and completes immediately when accounting is disabled', async () => {
        // Given a draft from a previous visit
        await act(async () => Onyx.set(ONYXKEYS.ONBOARDING_ACCOUNTING_DRAFT, {integration: 'other', name: 'Acme Books'}));
        renderInterestedFeaturesPage();
        await waitForBatchedUpdatesWithAct();
        // When accounting is disabled
        fireEvent.press(screen.getByRole(CONST.ROLE.CHECKBOX, {name: TestHelper.translateLocal('workspace.moreFeatures.connections.title')}));
        continueOnboarding();
        // Then it is not submitted as a selected integration
        await waitFor(() => expect(mockCompleteOnboardingFlow).toHaveBeenCalledTimes(1));
        expect(mockCompleteOnboardingFlow.mock.calls.at(0)?.at(0)?.userReportedIntegration).toBeUndefined();
        expect(await Onyx.get(ONYXKEYS.ONBOARDING_ACCOUNTING_DRAFT)).toBeUndefined();
    });

    it('renders the Connections catalog in order with 28px icons and no tabs', async () => {
        // Given access to all accounting connection betas
        const result = renderAccountingPage();
        // When it renders
        await waitForBatchedUpdatesWithAct();
        // Then the catalog contains only connections, their waitlist choices, and the IES alias
        const radios = screen.getAllByRole(CONST.ROLE.RADIO);
        expect(radios).toHaveLength(16);
        expect(accountingOptions.filter((option) => !option.isComingSoon && option.connectionName).map((option) => option.connectionName)).toEqual(
            CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES,
        );
        expect(
            accountingOptions
                .filter((option) => option.isComingSoon)
                .map((option) => option.name)
                .sort(),
        ).toEqual(['Exact Online', 'Odoo', 'Sage Accounting']);
        for (const [index, option] of accountingOptions.entries()) {
            expect(radios.at(index)).toHaveProp('accessibilityLabel', option.name);
        }
        expect(result.UNSAFE_getAllByType(Icon).filter((icon) => icon.props.width === 28 && icon.props.height === 28)).toHaveLength(16);
        expect(screen.queryAllByRole(CONST.ROLE.TAB)).toHaveLength(0);
    });

    it('filters by legacy aliases and restores all products with Clear', async () => {
        // Given the full catalog
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        // When searching a product alias
        searchFor('financialforce');
        // Then only Certinia matches, and Clear restores the catalog
        expect(screen.getAllByRole(CONST.ROLE.RADIO)).toHaveLength(1);
        expect(screen.getByText('Certinia')).toBeOnTheScreen();
        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.clear')));
        expect(screen.getAllByRole(CONST.ROLE.RADIO)).toHaveLength(16);
    });

    it('retains a confirmed custom name independently of search and navigation', async () => {
        // Given an unmatched search
        const firstVisit = renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        searchFor('  Acme Books  ');
        expect(screen.getByText(TestHelper.translateLocal('onboarding.accounting.unsupportedTitle', 'Acme Books'))).toBeOnTheScreen();
        // When the name is confirmed and the user returns through interested features
        fireEvent.press(screen.getByText(TestHelper.translateLocal('onboarding.accounting.confirmSoftware', 'Acme Books')));
        await waitForBatchedUpdatesWithAct();
        searchFor('');
        firstVisit.unmount();
        const features = renderInterestedFeaturesPage();
        await waitForBatchedUpdatesWithAct();
        continueOnboarding();
        features.unmount();
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        // Then remounting restores both the selection and the trimmed custom name
        expect(screen.getByRole(CONST.ROLE.RADIO, {name: 'Acme Books'})).toBeChecked();
        continueOnboarding();
        await waitFor(() => expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith(expect.objectContaining({userReportedIntegration: 'other', userReportedIntegrationName: 'Acme Books'})));
    });

    it('requires an explicit selection rather than submitting an unconfirmed search', async () => {
        // Given an unanswered accounting step
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        // When only whitespace is searched and Continue is pressed
        searchFor('   ');
        continueOnboarding();
        // Then validation prevents submission and whitespace does not hide the catalog
        expect(screen.getAllByRole(CONST.ROLE.RADIO)).toHaveLength(16);
        expect(screen.getByText(TestHelper.translateLocal('onboarding.errorSelection'))).toBeOnTheScreen();
        expect(mockCompleteOnboardingFlow).not.toHaveBeenCalled();
        searchFor('Unconfirmed Books');
        continueOnboarding();
        expect(mockCompleteOnboardingFlow).not.toHaveBeenCalled();
    });

    it('does not leak a custom name after replacing it with a supported integration', async () => {
        // Given a custom answer
        await act(async () => Onyx.set(ONYXKEYS.ONBOARDING_ACCOUNTING_DRAFT, {integration: 'other', name: 'Acme Books'}));
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        // When the user selects QuickBooks Online instead
        fireEvent.press(screen.getByText('QuickBooks Online'));
        await waitForBatchedUpdatesWithAct();
        continueOnboarding();
        // Then the previous name is absent from the payload
        await waitFor(() =>
            expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith(expect.objectContaining({userReportedIntegration: 'quickbooksOnline', userReportedIntegrationName: undefined})),
        );
    });

    it.each(['Digits', 'DualEntry', 'Campfire', 'Dynamics 365 Business Central', 'Odoo', 'Exact Online', 'Sage Accounting'])('submits %s using the existing Other contract', async (name) => {
        // Given a new catalog product without a canonical onboarding value
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        searchFor(name);
        const badge = screen.queryByText(TestHelper.translateLocal('workspace.accounting.integrationWaitlist.comingSoon'));
        expect(!!badge).toBe(['Odoo', 'Exact Online', 'Sage Accounting'].includes(name));
        // When it is selected and submitted
        fireEvent.press(screen.getByText(name));
        await waitForBatchedUpdatesWithAct();
        continueOnboarding();
        // Then the name is forwarded without inventing a backend integration value
        await waitFor(() => expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith(expect.objectContaining({userReportedIntegration: 'other', userReportedIntegrationName: name})));
    });

    it.each<[OnboardingAccounting, string]>([
        ['sap', 'SAP'],
        ['oracle', 'Oracle'],
        ['microsoftDynamics', 'Microsoft Dynamics'],
        ['financialforce', 'Certinia'],
    ])('preserves the saved %s value with the current product label', async (integration, label) => {
        // Given a previously saved integration
        await act(async () => Onyx.set(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION, integration));
        // When resuming the step
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        // Then the selection and canonical payload remain compatible
        expect(screen.getByRole(CONST.ROLE.RADIO, {name: label})).toBeChecked();
        continueOnboarding();
        await waitFor(() => expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith(expect.objectContaining({userReportedIntegration: integration, userReportedIntegrationName: undefined})));
    });

    it.each(['DATEV', 'Lensing.ai', 'Workday', 'Sage 50', 'SAP S/4HANA', 'Oracle Fusion Cloud'])('offers %s only through unmatched-search confirmation', async (name) => {
        // Given a fresh accounting step without a saved legacy answer
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByRole(CONST.ROLE.RADIO, {name})).not.toBeOnTheScreen();
        // When searching for unsupported software
        searchFor(name);
        // Then the unsupported empty state requires confirmation before saving the name
        expect(screen.queryAllByRole(CONST.ROLE.RADIO)).toHaveLength(0);
        fireEvent.press(screen.getByText(TestHelper.translateLocal('onboarding.accounting.confirmSoftware', name)));
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByRole(CONST.ROLE.RADIO, {name})).toBeChecked();
        continueOnboarding();
        await waitFor(() => expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith(expect.objectContaining({userReportedIntegration: 'other', userReportedIntegrationName: name})));
    });

    it('matches Connections beta visibility without marking released connectors coming soon', async () => {
        // Given an account without the Digits or Business Central beta
        mockIsBetaEnabled.mockReturnValue(false);
        // When opening accounting onboarding
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        // Then gated connectors are hidden, while the three waitlist choices remain available
        expect(screen.queryByRole(CONST.ROLE.RADIO, {name: 'Digits'})).not.toBeOnTheScreen();
        expect(screen.queryByRole(CONST.ROLE.RADIO, {name: 'Dynamics 365 Business Central'})).not.toBeOnTheScreen();
        expect(screen.getAllByRole(CONST.ROLE.RADIO)).toHaveLength(14);
        expect(screen.getAllByText(TestHelper.translateLocal('workspace.accounting.integrationWaitlist.comingSoon'))).toHaveLength(3);
    });

    it('preserves mobile Safari viewport handling', async () => {
        // Given a mobile Safari browser
        isMobileSafari.mockReturnValue(true);
        // When accounting renders
        const result = renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        // Then native viewport adjustments do not fight Safari scrolling
        expect(result.UNSAFE_getByType(ScreenWrapper).props.shouldEnableMaxHeight).toBe(false);
        expect(result.UNSAFE_getByType(ScreenWrapper).props.shouldAvoidScrollOnVirtualViewport).toBe(false);
    });

    it('returns to interested features from accounting', async () => {
        // Given the accounting step
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        // When Back is pressed
        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));
        // Then the previous onboarding step is used
        expect(goBack).toHaveBeenCalledWith(ROUTES.ONBOARDING_INTERESTED_FEATURES.getRoute());
    });
});
