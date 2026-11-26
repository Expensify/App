import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as UseRunWithPaymentCardModule from '@hooks/useRunWithPaymentCard';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import DomainAdminsSettingsPage from '@pages/domain/Admins/DomainAdminsSettingsPage';

import {toggleConsolidatedDomainBilling} from '@userActions/Domain';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type * as ReactNavigationNative from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as ConfirmModalMock from '../utils/mockUseConfirmModal';

import {mockShowConfirmModal, resetMockConfirmModal} from '../utils/mockUseConfirmModal';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const DOMAIN_ACCOUNT_ID = 424242;
const DOMAIN_NAME = 'acme.com';
const DOMAIN_KEY = `${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}` as const;
const DOMAIN_MEMBER_KEY = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${DOMAIN_ACCOUNT_ID}` as const;
const PRIMARY_CONTACT_EMAIL = 'owner@acme.com';
const CURRENT_USER_EMAIL = 'admin@acme.com';
const BILLING_FUND_ID = 1234;

let mockCurrentUserLogin = CURRENT_USER_EMAIL;
let mockIsNativeApp = false;
let mockPressPrimaryContactRow: (() => void) | undefined;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useIsFocused: () => true,
    useFocusEffect: jest.fn(),
}));
// Jest resolves the native variant by default, so each test picks the platform whose payment card step it checks.
jest.mock('@hooks/useRunWithPaymentCard', () => {
    const {default: useRunWithPaymentCardOnWeb} = jest.requireActual<typeof UseRunWithPaymentCardModule>('@hooks/useRunWithPaymentCard/index.ts');
    const {default: useRunWithPaymentCardOnNative} = jest.requireActual<typeof UseRunWithPaymentCardModule>('@hooks/useRunWithPaymentCard/index.native.ts');
    function useRunWithPaymentCardForPlatform() {
        const paymentCardOnWeb = useRunWithPaymentCardOnWeb();
        const paymentCardOnNative = useRunWithPaymentCardOnNative();
        return mockIsNativeApp ? paymentCardOnNative : paymentCardOnWeb;
    }
    return {__esModule: true, default: useRunWithPaymentCardForPlatform};
});
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => jest.fn((suffix: string) => suffix));
jest.mock('@hooks/useConfirmModal', () => jest.requireActual<typeof ConfirmModalMock>('../utils/mockUseConfirmModal').default);
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: mockCurrentUserLogin})));
jest.mock('@pages/domain/BaseDomainSettingsPage', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/MenuItem/presets/MenuItemField', () =>
    jest.fn(({onPress}: {onPress: () => void}) => {
        mockPressPrimaryContactRow = onPress;
        return null;
    }),
);
jest.mock('@components/RenderHTML', () => () => null);
jest.mock('@userActions/Domain', () => ({
    toggleConsolidatedDomainBilling: jest.fn(),
    clearSetPrimaryContactError: jest.fn(),
    clearToggleConsolidatedDomainBillingErrors: jest.fn(),
}));

// The switch defers its press handling inside a requestAnimationFrame, so run it synchronously to keep the press assertions deterministic.
jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
    callback(0);
    return 0;
});

type DomainAdminsSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADMINS_SETTINGS>;

const route: DomainAdminsSettingsPageProps['route'] = {
    key: 'domain-admins-settings',
    name: SCREENS.DOMAIN.ADMINS_SETTINGS,
    params: {domainAccountID: DOMAIN_ACCOUNT_ID},
};
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The page never reads the navigation prop when rendered outside a navigator.
const navigation = {} as DomainAdminsSettingsPageProps['navigation'];

// Resolved lazily at assertion time, because IntlStore has not loaded the locale yet at module load.
const getLockedSuffix = () => TestHelper.translateLocal('common.locked');

async function seedDomain(technicalContactEmail: string | undefined, isBillingOn = false) {
    await act(async () => {
        await Onyx.merge(DOMAIN_KEY, {accountID: DOMAIN_ACCOUNT_ID, email: `+@${DOMAIN_NAME}`});
        await Onyx.merge(DOMAIN_MEMBER_KEY, {settings: {technicalContactEmail, useTechnicalContactBillingCard: isBillingOn}});
    });
}

async function renderPage() {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <DomainAdminsSettingsPage
                route={route}
                navigation={navigation}
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

async function renderPageAndPressPrimaryContactRow() {
    await renderPage();
    act(() => mockPressPrimaryContactRow?.());
    await waitForBatchedUpdatesWithAct();
}

async function renderPageAndPressSwitch() {
    await renderPage();

    const switchNode = screen.getByRole(CONST.ROLE.SWITCH);
    fireEvent.press(switchNode);
    await waitForBatchedUpdatesWithAct();

    return switchNode;
}

describe('DomainAdminsSettingsPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        resetMockConfirmModal();
        mockCurrentUserLogin = CURRENT_USER_EMAIL;
        mockIsNativeApp = false;
        mockPressPrimaryContactRow = undefined;
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('locks the switch and explains why when another admin is the primary contact', async () => {
        // Given billing that is off, with another admin as the primary contact
        await seedDomain(PRIMARY_CONTACT_EMAIL);

        // When the admin presses the switch
        const switchNode = await renderPageAndPressSwitch();

        // Then the switch is locked and the modal tells the admin that only the primary contact can turn it on
        expect(switchNode.props.accessibilityLabel).toContain(getLockedSuffix());
        expect(toggleConsolidatedDomainBilling).not.toHaveBeenCalled();
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: TestHelper.translateLocal('workspace.distanceRates.oopsNotSoFast'),
                prompt: TestHelper.translateLocal('domain.admins.consolidatedDomainBillingLockedMessage'),
                confirmText: TestHelper.translateLocal('common.buttonConfirm'),
                shouldShowCancelButton: false,
            }),
        );
    });

    it('lets the primary contact turn the setting on', async () => {
        // Given billing that is off, viewed by the primary contact, who has a payment card
        await seedDomain(PRIMARY_CONTACT_EMAIL);
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_BILLING_FUND_ID, BILLING_FUND_ID);
        });
        mockCurrentUserLogin = PRIMARY_CONTACT_EMAIL;

        // When the primary contact presses the switch
        const switchNode = await renderPageAndPressSwitch();

        // Then the switch is not locked and turns billing on without a modal
        expect(switchNode.props.accessibilityLabel).not.toContain(getLockedSuffix());
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(toggleConsolidatedDomainBilling).toHaveBeenCalledWith(DOMAIN_ACCOUNT_ID, DOMAIN_NAME, true);
    });

    it('asks a primary contact without a payment card to add one before turning the setting on', async () => {
        // Given billing that is off, viewed by the primary contact, who has no payment card
        await seedDomain(PRIMARY_CONTACT_EMAIL);
        mockCurrentUserLogin = PRIMARY_CONTACT_EMAIL;

        // When the primary contact presses the switch
        const switchNode = await renderPageAndPressSwitch();

        // Then the switch is not locked, and the domain payment card page opens and billing stays off until a card is added.
        expect(switchNode.props.accessibilityLabel).not.toContain(getLockedSuffix());
        expect(Navigation.navigate).toHaveBeenCalledWith(DYNAMIC_ROUTES.DOMAIN_PAYMENT_CARD.getRoute(CONST.DOMAIN.PAYMENT_CARD_FLOW.CONSOLIDATED_BILLING));
        expect(toggleConsolidatedDomainBilling).not.toHaveBeenCalled();
    });

    it('locks the switch for a primary contact without a payment card in the mobile app and tells them to add one on the web first', async () => {
        // Given billing that is off, viewed in the mobile app by the primary contact, who has no payment card
        await seedDomain(PRIMARY_CONTACT_EMAIL);
        mockCurrentUserLogin = PRIMARY_CONTACT_EMAIL;
        mockIsNativeApp = true;

        // When the primary contact presses the switch
        const switchNode = await renderPageAndPressSwitch();

        // Then the switch is locked, a modal explains that a card is needed, and billing stays off.
        expect(switchNode.props.accessibilityLabel).toContain(getLockedSuffix());
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: TestHelper.translateLocal('workspace.distanceRates.oopsNotSoFast'),
                prompt: TestHelper.translateLocal('domain.admins.consolidatedBillingNoCardMobileMessage'),
                confirmText: TestHelper.translateLocal('common.buttonConfirm'),
                shouldShowCancelButton: false,
            }),
        );
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(toggleConsolidatedDomainBilling).not.toHaveBeenCalled();
    });

    it('lets a primary contact with a payment card turn the setting on in the mobile app', async () => {
        // Given billing that is off, viewed in the mobile app by the primary contact, who has a payment card
        await seedDomain(PRIMARY_CONTACT_EMAIL);
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_BILLING_FUND_ID, BILLING_FUND_ID);
        });
        mockCurrentUserLogin = PRIMARY_CONTACT_EMAIL;
        mockIsNativeApp = true;

        // When the primary contact presses the switch
        const switchNode = await renderPageAndPressSwitch();

        // Then the switch is not locked and billing turns on without a modal.
        expect(switchNode.props.accessibilityLabel).not.toContain(getLockedSuffix());
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(toggleConsolidatedDomainBilling).toHaveBeenCalledWith(DOMAIN_ACCOUNT_ID, DOMAIN_NAME, true);
    });

    it('lets a primary contact without a payment card turn the setting off in the mobile app', async () => {
        // Given billing that is on, viewed in the mobile app by the primary contact, who has no payment card.
        await seedDomain(PRIMARY_CONTACT_EMAIL, true);
        mockCurrentUserLogin = PRIMARY_CONTACT_EMAIL;
        mockIsNativeApp = true;

        // When the primary contact presses the switch.
        const switchNode = await renderPageAndPressSwitch();

        // Then the switch is not locked and billing turns off without a modal.
        expect(switchNode.props.accessibilityLabel).not.toContain(getLockedSuffix());
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(toggleConsolidatedDomainBilling).toHaveBeenCalledWith(DOMAIN_ACCOUNT_ID, DOMAIN_NAME, false);
    });

    it('lets any admin turn the setting off', async () => {
        // Given billing that is on, with another admin as the primary contact
        await seedDomain(PRIMARY_CONTACT_EMAIL, true);

        // When the admin presses the switch
        const switchNode = await renderPageAndPressSwitch();

        // Then the switch is not locked and turns billing off without a modal
        expect(switchNode.props.accessibilityLabel).not.toContain(getLockedSuffix());
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(toggleConsolidatedDomainBilling).toHaveBeenCalledWith(DOMAIN_ACCOUNT_ID, DOMAIN_NAME, false);
    });

    it('opens no modal when the switch is disabled because there is no primary contact', async () => {
        // Given a domain with no primary contact
        await seedDomain(undefined);

        // When an admin presses the switch
        const switchNode = await renderPageAndPressSwitch();

        // Then the switch stays disabled and opens no modal, because the lock message is about an existing contact
        expect(switchNode.props.accessibilityLabel).toContain(getLockedSuffix());
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(toggleConsolidatedDomainBilling).not.toHaveBeenCalled();
    });

    it('tells an admin without a payment card in the mobile app to add one on the web before taking over as primary contact while billing is on', async () => {
        // Given billing that is on, viewed in the mobile app by another admin, who has no payment card.
        await seedDomain(PRIMARY_CONTACT_EMAIL, true);
        mockIsNativeApp = true;

        // When the admin presses the primary contact row.
        await renderPageAndPressPrimaryContactRow();

        // Then a modal explains that a card is needed, and the primary contact picker stays closed.
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: TestHelper.translateLocal('workspace.distanceRates.oopsNotSoFast'),
                prompt: TestHelper.translateLocal('domain.admins.primaryContactNoCardMobileMessage'),
                confirmText: TestHelper.translateLocal('common.buttonConfirm'),
                shouldShowCancelButton: false,
            }),
        );
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('opens the primary contact picker for the primary contact without a payment card in the mobile app while billing is on', async () => {
        // Given billing that is on, viewed in the mobile app by the primary contact, who has no payment card.
        await seedDomain(PRIMARY_CONTACT_EMAIL, true);
        mockCurrentUserLogin = PRIMARY_CONTACT_EMAIL;
        mockIsNativeApp = true;

        // When the primary contact presses the primary contact row.
        await renderPageAndPressPrimaryContactRow();

        // Then the primary contact picker opens without a modal.
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.DOMAIN_ADD_PRIMARY_CONTACT.getRoute(DOMAIN_ACCOUNT_ID));
    });

    it('opens the primary contact picker for an admin with a payment card in the mobile app while billing is on', async () => {
        // Given billing that is on, viewed in the mobile app by another admin, who has a payment card.
        await seedDomain(PRIMARY_CONTACT_EMAIL, true);
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_BILLING_FUND_ID, BILLING_FUND_ID);
        });
        mockIsNativeApp = true;

        // When the admin presses the primary contact row.
        await renderPageAndPressPrimaryContactRow();

        // Then the primary contact picker opens without a modal.
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.DOMAIN_ADD_PRIMARY_CONTACT.getRoute(DOMAIN_ACCOUNT_ID));
    });

    it('opens the primary contact picker for an admin without a payment card on the web while billing is on', async () => {
        // Given billing that is on, viewed on the web by another admin, who has no payment card.
        await seedDomain(PRIMARY_CONTACT_EMAIL, true);

        // When the admin presses the primary contact row.
        await renderPageAndPressPrimaryContactRow();

        // Then the primary contact picker opens, because the admin can add a card after picking themselves.
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.DOMAIN_ADD_PRIMARY_CONTACT.getRoute(DOMAIN_ACCOUNT_ID));
    });
});
