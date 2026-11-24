import {act, fireEvent, render, renderHook, screen, waitFor, within} from '@testing-library/react-native';

import type {ButtonProps} from '@components/Button';
import ButtonDisabledWhenOffline from '@components/Button/composed/ButtonDisabledWhenOffline';
import ComposeProviders from '@components/ComposeProviders';
import Icon from '@components/Icon';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnboardingHeader from '@components/OnboardingHeader';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {PressableWithoutFeedback} from '@components/Pressable';
import RadioButton from '@components/RadioButton';
import ScreenWrapper from '@components/ScreenWrapper';
import BaseSearchBar from '@components/SearchBar/BaseSearchBar';
import CompactSearchBar from '@components/SearchBar/CompactSearchBar';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import * as useThemeModule from '@hooks/useTheme';

import * as Browser from '@libs/Browser';
import Navigation from '@libs/Navigation/Navigation';

import AccountingOptionRow from '@pages/OnboardingAccounting/AccountingOptionRow';
import type {AccountingOption} from '@pages/OnboardingAccounting/accountingOptions';
import accountingOptions from '@pages/OnboardingAccounting/accountingOptions';
import BaseOnboardingAccounting from '@pages/OnboardingAccounting/BaseOnboardingAccounting';
import BaseOnboardingInterestedFeatures from '@pages/OnboardingInterestedFeatures/BaseOnboardingInterestedFeatures';
import AccountingIntegrationWaitlistCard from '@pages/workspace/connections/AccountingIntegrationWaitlistCard';
import ConnectionCard from '@pages/workspace/connections/ConnectionCard';
import ConnectionsGrid from '@pages/workspace/connections/ConnectionsGrid';
import IntegrationWaitlistCard from '@pages/workspace/connections/IntegrationWaitlistCard';
import useAccountingConnectionListings from '@pages/workspace/connections/useAccountingConnectionListings';

// eslint-disable-next-line no-restricted-imports -- Regression fixtures verify both theme foregrounds independently of the current page theme.
import themes from '@styles/theme';

import CONST from '@src/CONST';
import type {OnboardingAccounting} from '@src/CONST';
import type {OnboardingModalNavigatorParamList} from '@src/libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type Beta from '@src/types/onyx/Beta';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {ViewProps} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
// eslint-disable-next-line no-restricted-imports -- Inspect the scroll viewport containing all keyboard-sensitive content.
import {ScrollView, StyleSheet, View} from 'react-native';
import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type MockCompleteOnboardingParams = {
    featuresMap: Array<{id: string; enabled: boolean}>;
    userReportedIntegration?: string | null;
    userReportedIntegrationName?: string;
};

const mockCompleteOnboardingFlow = jest.fn<void, [MockCompleteOnboardingParams]>();
jest.mock('@hooks/useCompleteOnboarding', () => () => ({completeOnboardingFlow: mockCompleteOnboardingFlow, isLoading: false}));
const mockIsBetaEnabled = jest.fn<boolean, [Beta]>(() => true);
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: mockIsBetaEnabled}));
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: true, showReadOnlyModal: jest.fn()}));
jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});
jest.mock('@pages/workspace/accounting/AccountingContext', () => ({
    useAccountingActions: () => ({startIntegrationFlow: jest.fn()}),
    useAccountingState: () => ({activeIntegration: undefined, popoverAnchorRefs: {current: {}}}),
}));
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

function ConnectionsTestWrapper({children}: ChildrenProps) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>;
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
        // Then the catalog contains connections, waitlist choices, the IES alias, and Other
        const radios = screen.getAllByRole(CONST.ROLE.RADIO);
        expect(radios).toHaveLength(17);
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
        expect(radios.at(-1)).toHaveProp('accessibilityLabel', TestHelper.translateLocal('workspace.accounting.other'));
        for (const row of result.UNSAFE_getAllByType(AccountingOptionRow)) {
            const {option}: {option?: AccountingOption} = row.props;
            expect(within(row).UNSAFE_queryAllByType(RadioButton)).toHaveLength(option?.isComingSoon ? 0 : 1);
        }
        expect(result.UNSAFE_getAllByType(Icon).filter((icon) => icon.props.width === 28 && icon.props.height === 28)).toHaveLength(17);
        expect(screen.queryAllByRole(CONST.ROLE.TAB)).toHaveLength(0);
    });

    it.each([false, true])('keeps search full width in landscape with narrow layout %s', async (shouldUseNarrowLayout) => {
        // Given the accounting layout on either screen size
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            ...useResponsiveLayoutModule.default(),
            shouldUseNarrowLayout,
            isSmallScreenWidth: shouldUseNarrowLayout,
            onboardingIsMediumOrLargerScreenWidth: !shouldUseNarrowLayout,
            isInLandscapeMode: true,
        });
        const result = renderAccountingPage();

        // When the real compact search bar applies its shared defaults and local overrides
        await waitForBatchedUpdatesWithAct();
        const searchContainer = result
            .UNSAFE_getByType(BaseSearchBar)
            .findAll((node) => node.type === View)
            .at(0);
        const searchWrapper = result.UNSAFE_getByType(CompactSearchBar).parent;
        const {style: searchContainerStyle}: Pick<ViewProps, 'style'> = searchContainer?.props ?? {};
        const {style: searchWrapperStyle}: Pick<ViewProps, 'style'> = searchWrapper?.props ?? {};

        // Then the title has 24px below it and only the wrapper supplies the 12px gap before the list
        expect(screen.getByText(TestHelper.translateLocal('onboarding.accounting.title'))).toHaveStyle({marginBottom: 24});
        expect(StyleSheet.flatten(searchContainerStyle)).toMatchObject({marginBottom: 0, width: '100%', maxWidth: '100%'});
        expect(StyleSheet.flatten(searchWrapperStyle)).toMatchObject({marginBottom: 12});
        const {style: gridStyle}: Pick<ViewProps, 'style'> = result.UNSAFE_getAllByType(AccountingOptionRow).at(0)?.parent?.props ?? {};
        expect(StyleSheet.flatten(gridStyle)).toMatchObject({flexDirection: 'row', flexWrap: 'wrap', gap: 8});
        // All content that can exceed the keyboard-reduced viewport scrolls, while Back never collapses.
        const scrollView = result.UNSAFE_getByType(ScrollView);
        expect(within(scrollView).getByLabelText(TestHelper.translateLocal('common.search'))).toBeOnTheScreen();
        expect(within(scrollView).getByText(TestHelper.translateLocal('onboarding.accounting.title'))).toBeOnTheScreen();
        expect(result.UNSAFE_getByType(OnboardingHeader).props.shouldCollapseOnKeyboard).toBeFalsy();
    });

    it.each([false, true])('keeps 12px accounting card corners in normal, hover, and selected states with narrow layout %s', async (shouldUseNarrowLayout) => {
        // Given a visible accounting card on either screen size
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            ...useResponsiveLayoutModule.default(),
            shouldUseNarrowLayout,
            isSmallScreenWidth: shouldUseNarrowLayout,
            onboardingIsMediumOrLargerScreenWidth: !shouldUseNarrowLayout,
        });
        const result = renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        searchFor('Xero');
        const getCardView = () => {
            const card = result.UNSAFE_getByType(AccountingOptionRow).find((node) => node.type === PressableWithoutFeedback);
            const cardView = card.findAll((node) => node.type === View).at(0);
            if (!cardView) {
                throw new Error('Accounting card view is missing');
            }
            return cardView;
        };
        const getCardStyle = () => {
            const {style}: Pick<ViewProps, 'style'> = getCardView().props;
            return StyleSheet.flatten(style);
        };

        // When hovering the unselected card and then selecting it
        expect(getCardStyle()).toMatchObject({borderRadius: 12});
        const unselectedBackground = getCardStyle().backgroundColor;
        fireEvent(getCardView(), 'hoverIn');
        expect(getCardStyle()).toMatchObject({borderRadius: 12});
        expect(getCardStyle().backgroundColor).not.toBe(unselectedBackground);
        fireEvent(getCardView(), 'hoverOut');
        expect(getCardStyle().backgroundColor).toBe(unselectedBackground);
        fireEvent.press(screen.getByRole(CONST.ROLE.RADIO, {name: 'Xero'}));
        await waitForBatchedUpdatesWithAct();
        const selectedStyle = getCardStyle();

        // Then selection and subsequent hover preserve both the corners and selected background
        expect(screen.getByRole(CONST.ROLE.RADIO, {name: 'Xero'})).toBeChecked();
        expect(selectedStyle).toMatchObject({borderRadius: 12});
        fireEvent(getCardView(), 'hoverIn');
        expect(getCardStyle()).toMatchObject({borderRadius: 12, backgroundColor: selectedStyle.backgroundColor});
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
        expect(screen.getAllByRole(CONST.ROLE.RADIO)).toHaveLength(17);
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
        expect(screen.getAllByRole(CONST.ROLE.RADIO)).toHaveLength(17);
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

    it('blocks a hidden selection on the unsupported screen and restores it when search is cleared', async () => {
        // Given Xero is selected before searching for unsupported software
        const result = renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Xero'));
        await waitForBatchedUpdatesWithAct();

        // When the search hides Xero, neither a button press nor direct submission may send it
        searchFor('Wave');
        expect(screen.getByText(TestHelper.translateLocal('onboarding.accounting.unsupportedTitle', 'Wave'))).toBeOnTheScreen();
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: TestHelper.translateLocal('common.continue')})).toBeDisabled();
        continueOnboarding();
        const {onPress}: Pick<ButtonProps, 'onPress'> = result.UNSAFE_getByType(ButtonDisabledWhenOffline).props;
        await act(async () => onPress?.());

        // Then the draft is preserved without completing onboarding, and clearing search makes it usable again
        expect(mockCompleteOnboardingFlow).not.toHaveBeenCalled();
        expect(await Onyx.get(ONYXKEYS.ONBOARDING_ACCOUNTING_DRAFT)).toEqual({integration: 'xero'});
        fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.clear')));
        expect(screen.getByRole(CONST.ROLE.RADIO, {name: 'Xero'})).toBeChecked();
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: TestHelper.translateLocal('common.continue')})).toBeEnabled();
        continueOnboarding();
        await waitFor(() => expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith(expect.objectContaining({userReportedIntegration: 'xero'})));
    });

    it('enables Continue for an explicitly confirmed replacement instead of submitting the hidden selection', async () => {
        // Given Xero is selected but hidden by an unmatched search
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Xero'));
        await waitForBatchedUpdatesWithAct();
        searchFor('Wave');

        // When the searched software is explicitly confirmed
        fireEvent.press(screen.getByText(TestHelper.translateLocal('onboarding.accounting.confirmSoftware', 'Wave')));
        await waitForBatchedUpdatesWithAct();

        // Then the visible custom answer enables Continue and supplies the replacement payload
        expect(screen.getByRole(CONST.ROLE.RADIO, {name: 'Wave'})).toBeChecked();
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: TestHelper.translateLocal('common.continue')})).toBeEnabled();
        continueOnboarding();
        await waitFor(() => expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith(expect.objectContaining({userReportedIntegration: 'other', userReportedIntegrationName: 'Wave'})));
    });

    it('also blocks hidden selections when the search matches other supported products', async () => {
        // Given Xero is selected
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Xero'));
        await waitForBatchedUpdatesWithAct();

        // When the results show other products but not the selected one
        searchFor('QuickBooks');
        continueOnboarding();

        // Then submission is blocked until a visible replacement is selected
        expect(screen.getAllByRole(CONST.ROLE.RADIO).length).toBeGreaterThan(0);
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: TestHelper.translateLocal('common.continue')})).toBeDisabled();
        expect(mockCompleteOnboardingFlow).not.toHaveBeenCalled();
        fireEvent.press(screen.getByText('QuickBooks Online'));
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: TestHelper.translateLocal('common.continue')})).toBeEnabled();
        continueOnboarding();
        await waitFor(() => expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith(expect.objectContaining({userReportedIntegration: 'quickbooksOnline'})));
    });

    it('keeps Continue enabled when the selected row matches a search alias', async () => {
        // Given QuickBooks Online is selected
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('QuickBooks Online'));
        await waitForBatchedUpdatesWithAct();

        // When searching its alias instead of the display name
        searchFor('  QBO  ');

        // Then the selected row remains visible and can still be submitted
        expect(screen.getByRole(CONST.ROLE.RADIO, {name: 'QuickBooks Online'})).toBeChecked();
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: TestHelper.translateLocal('common.continue')})).toBeEnabled();
        continueOnboarding();
        await waitFor(() => expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith(expect.objectContaining({userReportedIntegration: 'quickbooksOnline'})));
    });

    it.each(['Digits', 'DualEntry', 'Campfire', 'Dynamics 365 Business Central', 'Odoo', 'Exact Online', 'Sage Accounting'])('submits %s using the existing Other contract', async (name) => {
        // Given a new catalog product without a canonical onboarding value
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        searchFor(name);
        const badge = screen.queryByText(TestHelper.translateLocal('workspace.accounting.integrationWaitlist.comingSoon'));
        expect(!!badge).toBe(['Odoo', 'Exact Online', 'Sage Accounting'].includes(name));
        // When it is selected and submitted
        fireEvent.press(screen.getByRole(CONST.ROLE.RADIO, {name}));
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByRole(CONST.ROLE.RADIO, {name})).toBeChecked();
        continueOnboarding();
        // Then the name is forwarded without inventing a backend integration value
        await waitFor(() => expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith(expect.objectContaining({userReportedIntegration: 'other', userReportedIntegrationName: name})));
    });

    it('selects a Coming soon row with Space without scrolling the page', async () => {
        // Given a Coming soon option without a visible radio control
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        const preventDefault = jest.fn();

        // When the focused row receives Space
        fireEvent(screen.getByRole(CONST.ROLE.RADIO, {name: 'Odoo'}), 'keyDown', {nativeEvent: {code: 'Space'}, preventDefault});
        await waitForBatchedUpdatesWithAct();

        // Then selection remains keyboard-accessible and the browser does not scroll
        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(screen.getByRole(CONST.ROLE.RADIO, {name: 'Odoo'})).toBeChecked();
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
        expect(screen.getAllByRole(CONST.ROLE.RADIO)).toHaveLength(15);
        expect(screen.getAllByText(TestHelper.translateLocal('workspace.accounting.integrationWaitlist.comingSoon'))).toHaveLength(3);
    });

    it.each([
        {betas: [], connected: undefined, digits: false, businessCentral: false},
        {betas: [CONST.BETAS.DIGITS], connected: undefined, digits: true, businessCentral: false},
        {betas: [CONST.BETAS.BUSINESS_CENTRAL], connected: undefined, digits: false, businessCentral: true},
        {betas: [CONST.BETAS.DIGITS, CONST.BETAS.BUSINESS_CENTRAL], connected: undefined, digits: true, businessCentral: true},
        {betas: [], connected: CONST.POLICY.CONNECTIONS.NAME.DIGITS, digits: true, businessCentral: false},
        {betas: [], connected: CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL, digits: false, businessCentral: true},
        {betas: [CONST.BETAS.ODOO, CONST.BETAS.EXACT_ONLINE, CONST.BETAS.SAGE_ACCOUNTING], connected: undefined, digits: false, businessCentral: false},
    ])('matches every Connections listing and badge with betas $betas and connection $connected', async ({betas, connected, digits, businessCentral}) => {
        // Given both surfaces use the same workspace and beta enrollment, without any saved custom onboarding answer
        mockIsBetaEnabled.mockImplementation((beta) => betas.some((enabledBeta) => enabledBeta === beta));
        const policy = createMock<Policy>({id: 'parity-policy', type: CONST.POLICY.TYPE.CORPORATE, connections: connected ? {[connected]: {}} : {}});
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.set(ONYXKEYS.ONBOARDING_POLICY_ID, policy.id);
        });

        // When real Connections listings and cards render, including any already-connected integration
        const hook = renderHook(() => useAccountingConnectionListings(policy), {wrapper: ConnectionsTestWrapper});
        await waitForBatchedUpdatesWithAct();
        const listings = hook.result.current;
        const connections = render(
            <ConnectionsGrid
                listings={listings}
                policyID={policy.id}
            />,
            {wrapper: ConnectionsTestWrapper},
        );
        await waitForBatchedUpdatesWithAct();
        const cards = [
            ...connections.UNSAFE_getAllByType(ConnectionCard),
            ...connections.UNSAFE_getAllByType(IntegrationWaitlistCard),
            ...connections.UNSAFE_getAllByType(AccountingIntegrationWaitlistCard),
        ];
        const comingSoon = TestHelper.translateLocal('workspace.accounting.integrationWaitlist.comingSoon');
        const expectedChoices = listings.map((listing) => {
            const title = listing.title;
            if (!title) {
                throw new Error(`Missing accounting listing title for ${listing.key}`);
            }
            const card = cards.find((candidate) => within(candidate).queryByText(title));
            if (!card) {
                throw new Error(`Missing Connections card for ${title}`);
            }
            return {title, isComingSoon: !!within(card).queryByText(comingSoon)};
        });
        expect(listings.some((listing) => listing.key === CONST.POLICY.CONNECTIONS.NAME.DIGITS)).toBe(digits);
        expect(listings.some((listing) => listing.key === CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL)).toBe(businessCentral);
        connections.unmount();
        hook.unmount();

        const onboarding = renderAccountingPage();
        await waitForBatchedUpdatesWithAct();

        // Then every visible listing, including IES and all waitlist choices, has the same name and badge in onboarding
        expect(screen.getAllByRole(CONST.ROLE.RADIO)).toHaveLength(expectedChoices.length + 1);
        const rows = onboarding.UNSAFE_getAllByType(AccountingOptionRow);
        for (const choice of expectedChoices) {
            expect(screen.getByRole(CONST.ROLE.RADIO, {name: choice.title})).toBeOnTheScreen();
            const row = rows.find((candidate) => within(candidate).queryByText(choice.title));
            if (!row) {
                throw new Error(`Missing onboarding row for ${choice.title}`);
            }
            expect(!!within(row).queryByText(comingSoon)).toBe(choice.isComingSoon);
        }
    });

    it.each(['', '   ', '  Acme Books  '])('restores standalone Other and submits its optional trimmed name %j', async (name) => {
        // Given Other is available without an unmatched search
        const firstVisit = renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        const otherLabel = TestHelper.translateLocal('workspace.accounting.other');
        const inputLabel = TestHelper.translateLocal('onboarding.accounting.otherAccountingSoftware');

        // When the user selects Other and edits its name, the editor keeps its identity
        fireEvent.press(screen.getByRole(CONST.ROLE.RADIO, {name: otherLabel}));
        await waitForBatchedUpdatesWithAct();
        const input = screen.getByLabelText(inputLabel);
        expect(input.props.autoFocus).toBe(true);
        fireEvent.changeText(input, 'A');
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByLabelText(inputLabel)).toBe(input);
        fireEvent.changeText(input, name);
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByRole(CONST.ROLE.RADIO, {name: otherLabel}));
        searchFor('Xero');
        searchFor('');
        firstVisit.unmount();
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();

        // Then navigation and search preserve Other without submitting its translated label
        expect(screen.getByRole(CONST.ROLE.RADIO, {name: otherLabel})).toBeChecked();
        expect(screen.getByLabelText(inputLabel)).toHaveProp('value', name);
        continueOnboarding();
        await waitFor(() =>
            expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith(expect.objectContaining({userReportedIntegration: 'other', userReportedIntegrationName: name.trim() || undefined})),
        );
    });

    it('scrolls to the Other editor once without trapping subsequent scrolling', async () => {
        // Given a scrollable catalog with Other below the viewport
        const scrollToEnd = jest.spyOn(ScrollView.prototype, 'scrollToEnd');
        const result = renderAccountingPage();
        await waitForBatchedUpdatesWithAct();

        // When Other adds its focused editor
        fireEvent.press(screen.getByRole(CONST.ROLE.RADIO, {name: TestHelper.translateLocal('workspace.accounting.other')}));
        await waitForBatchedUpdatesWithAct();
        const scrollView = result.UNSAFE_getByType(ScrollView);
        fireEvent(scrollView, 'contentSizeChange', 0, 0);
        fireEvent(scrollView, 'contentSizeChange', 0, 0);

        // Then it is revealed once, allowing the user to scroll back to any earlier option
        expect(scrollToEnd).toHaveBeenCalledTimes(1);
        expect(scrollToEnd).toHaveBeenCalledWith({animated: false});
        scrollToEnd.mockRestore();
    });

    it('keeps a restored custom name distinct from the translated Other choice', async () => {
        // Given an earlier custom answer whose name is identical to the standalone label
        const label = TestHelper.translateLocal('workspace.accounting.other');
        await act(async () => Onyx.set(ONYXKEYS.ONBOARDING_ACCOUNTING_DRAFT, {integration: 'other', name: label}));

        // When the user resumes accounting
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();
        const choices = screen.getAllByRole(CONST.ROLE.RADIO, {name: label});

        // Then only the custom answer is selected, and choosing standalone Other opens its editor
        expect(choices).toHaveLength(2);
        expect(choices.at(0)).not.toBeChecked();
        expect(choices.at(1)).toBeChecked();
        const standaloneOther = choices.at(0);
        if (!standaloneOther) {
            throw new Error('Missing standalone Other choice');
        }
        fireEvent.press(standaloneOther);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getAllByRole(CONST.ROLE.RADIO, {name: label})).toHaveLength(1);
        expect(screen.getByLabelText(TestHelper.translateLocal('onboarding.accounting.otherAccountingSoftware'))).toHaveProp('value', label);
        continueOnboarding();
        await waitFor(() => expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith(expect.objectContaining({userReportedIntegration: 'other', userReportedIntegrationName: label})));
    });

    it('does not confuse standalone Other with a named interest-only product', async () => {
        // Given an edited Other answer
        await act(async () => Onyx.set(ONYXKEYS.ONBOARDING_ACCOUNTING_DRAFT, {integration: 'other', name: 'Private Books', isOther: true}));
        renderAccountingPage();
        await waitForBatchedUpdatesWithAct();

        // When selecting a product using the same backend Other contract
        fireEvent.press(screen.getByRole(CONST.ROLE.RADIO, {name: 'Odoo'}));
        await waitForBatchedUpdatesWithAct();

        // Then only that product is selected and the previous free-text answer is not submitted
        expect(screen.getByRole(CONST.ROLE.RADIO, {name: TestHelper.translateLocal('workspace.accounting.other')})).not.toBeChecked();
        expect(screen.queryByLabelText(TestHelper.translateLocal('onboarding.accounting.otherAccountingSoftware'))).not.toBeOnTheScreen();
        continueOnboarding();
        await waitFor(() => expect(mockCompleteOnboardingFlow).toHaveBeenCalledWith(expect.objectContaining({userReportedIntegration: 'other', userReportedIntegrationName: 'Odoo'})));
    });

    it.each([themes.light, themes.dark])('colors only monochrome accounting icons with the theme foreground $text', async (theme) => {
        // Given a custom software name and the selected theme
        const themeSpy = jest.spyOn(useThemeModule, 'default').mockReturnValue(theme);
        await act(async () => Onyx.set(ONYXKEYS.ONBOARDING_ACCOUNTING_DRAFT, {integration: 'other', name: 'Acme Books'}));
        const result = renderAccountingPage();

        // When both custom and branded rows render
        await waitForBatchedUpdatesWithAct();
        const rows = result.UNSAFE_getAllByType(AccountingOptionRow);
        const customRow = rows.find((row) => {
            const {option}: {option?: AccountingOption} = row.props;
            return option?.name === 'Acme Books';
        });
        const brandedRow = rows.find((row) => {
            const {option}: {option?: AccountingOption} = row.props;
            return option?.name === 'Xero';
        });
        if (!customRow || !brandedRow) {
            throw new Error('Missing accounting icon rows');
        }

        // Then the custom icon is legible without overwriting branded artwork colors
        expect(within(customRow).UNSAFE_getAllByType(Icon).at(0)?.props.fill).toBe(theme.text);
        expect(within(brandedRow).UNSAFE_getAllByType(Icon).at(0)?.props.fill).toBeUndefined();
        themeSpy.mockRestore();
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
