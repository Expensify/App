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
                    <Stack.Screen name={SCREENS.ONBOARDING.INTERESTED_FEATURES}>{() => <BaseOnboardingInterestedFeatures shouldUseNativeStyles={false} />}</Stack.Screen>
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
                    <Stack.Screen name={SCREENS.ONBOARDING.ACCOUNTING}>{() => <BaseOnboardingAccounting shouldUseNativeStyles={false} />}</Stack.Screen>
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
        expect(await Onyx.get(ONYXKEYS.ONBOARDING_ACCOUNTING_DRAFT)).toBeNull();
    });

    it('renders all mocked products in order with 28px icons and no tabs', async () => {
        // Given the expanded catalog
        const result = renderAccountingPage();
        // When it renders
        await waitForBatchedUpdatesWithAct();
        // Then every canonical answer remains represented and each product has a compact selector
        const radios = screen.getAllByRole(CONST.ROLE.RADIO);
        expect(radios).toHaveLength(31);
        expect(new Set(accountingOptions.map((option) => option.integration))).toEqual(new Set(Object.keys(CONST.ONBOARDING_ACCOUNTING_MAPPING)));
        for (const [index, option] of accountingOptions.entries()) {
            expect(radios.at(index)).toHaveProp('accessibilityLabel', option.name);
        }
        expect(result.UNSAFE_getAllByType(Icon).filter((icon) => icon.props.width === 28 && icon.props.height === 28)).toHaveLength(31);
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
        expect(screen.getAllByRole(CONST.ROLE.RADIO)).toHaveLength(31);
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
        expect(screen.getAllByRole(CONST.ROLE.RADIO)).toHaveLength(31);
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

    it.each(['Digits', 'DualEntry', 'Campfire', 'Sage 50'])('records %s as interest without requesting a connection', async (name) => {
        // Given a new catalog product without a canonical onboarding value
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(TestHelper.translateLocal('workspace.accounting.integrationWaitlist.comingSoon'))).toBeOnTheScreen();
        // When it is selected and submitted
        fireEvent.press(screen.getByText(name));
        await waitForBatchedUpdatesWithAct();
        continueOnboarding();
        // Then the existing Other contract captures its name without creating a connection
        await waitFor(() => expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith(expect.objectContaining({userReportedIntegration: 'other', userReportedIntegrationName: name})));
    });

    it.each<[OnboardingAccounting, string]>([
        ['sap', 'SAP S/4HANA'],
        ['oracle', 'Oracle Fusion Cloud'],
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
