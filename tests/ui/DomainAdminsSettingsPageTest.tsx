import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import DomainAdminsSettingsPage from '@pages/domain/Admins/DomainAdminsSettingsPage';

import {toggleConsolidatedDomainBilling} from '@userActions/Domain';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

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

let mockCurrentUserLogin = CURRENT_USER_EMAIL;

jest.mock('@hooks/useConfirmModal', () => jest.requireActual<typeof ConfirmModalMock>('../utils/mockUseConfirmModal').default);
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: mockCurrentUserLogin})));
jest.mock('@pages/domain/BaseDomainSettingsPage', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/MenuItem/presets/MenuItemField', () => jest.fn(() => null));
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

async function renderPageAndPressSwitch() {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <DomainAdminsSettingsPage
                route={route}
                navigation={navigation}
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();

    const switchNode = screen.getByRole(CONST.ROLE.SWITCH);
    fireEvent.press(switchNode);
    await waitForBatchedUpdatesWithAct();

    return switchNode;
}

describe('DomainAdminsSettingsPage consolidated domain billing switch', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        resetMockConfirmModal();
        mockCurrentUserLogin = CURRENT_USER_EMAIL;
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
        // Given billing that is off, viewed by the primary contact
        await seedDomain(PRIMARY_CONTACT_EMAIL);
        mockCurrentUserLogin = PRIMARY_CONTACT_EMAIL;

        // When the primary contact presses the switch
        const switchNode = await renderPageAndPressSwitch();

        // Then the switch is not locked and turns billing on without a modal
        expect(switchNode.props.accessibilityLabel).not.toContain(getLockedSuffix());
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(toggleConsolidatedDomainBilling).toHaveBeenCalledWith(DOMAIN_ACCOUNT_ID, DOMAIN_NAME, true);
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
});
