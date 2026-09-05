import {act, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import ExpensifyCardPreferredWorkspaceToggle from '@pages/domain/Groups/ExpensifyCardPreferredWorkspaceToggle';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DomainSecurityGroup} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const domainAccountID = 424242;
const groupID = '1001';
const domainKey = `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}` as const;
const domainMemberKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}` as const;
const groupKey = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${groupID}` as const;

// The preferred policy is enabled and the override is off, so isDisabled reduces to !isDomainUsingCard and the
// toggle's disabled state tracks the card-feed hook value alone.
const group: DomainSecurityGroup = {
    enableRestrictedPrimaryLogin: false,
    enableRestrictedPolicyCreation: false,
    shared: {},
    enableRestrictedPrimaryPolicy: true,
    restrictedPrimaryPolicyID: 'A1B2C3',
    overridePreferredPolicyWithCardPolicy: false,
};

// Resolved lazily at assertion time: IntlStore has not loaded the locale yet at module load.
const getToggleLabel = () => TestHelper.translateLocal('domain.groups.expensifyCardPreferredWorkspace');
// When the row is disabled, the switch appends the localized "Locked" suffix to its accessibility label.
const getLockedSuffix = () => TestHelper.translateLocal('common.locked');

const renderToggle = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <ExpensifyCardPreferredWorkspaceToggle
                        domainAccountID={domainAccountID}
                        groupID={groupID}
                    />
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

const seedGroup = async () => {
    await act(async () => {
        await Onyx.merge(domainKey, {[groupKey]: group});
    });
};

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

beforeEach(async () => {
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
    });
});

afterEach(async () => {
    await act(async () => {
        await Onyx.clear();
    });
    jest.clearAllMocks();
});

describe('ExpensifyCardPreferredWorkspaceToggle', () => {
    it('disables the toggle when the domain has no card feed', async () => {
        // Given a group with the preferred policy enabled but no card feed on the domain
        await seedGroup();

        // When the toggle renders
        const {unmount} = renderToggle();
        await waitForBatchedUpdatesWithAct();

        // Then it is locked, since the domain is not using any card
        await waitFor(() => {
            const switchNode = screen.getByRole(CONST.ROLE.SWITCH);
            expect(switchNode.props.accessibilityLabel).toContain(getToggleLabel());
            expect(switchNode.props.accessibilityLabel).toContain(getLockedSuffix());
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('enables the toggle when the domain has a company card feed', async () => {
        // Given the same group plus a company card feed on the domain
        await seedGroup();
        await act(async () => {
            await Onyx.merge(domainMemberKey, {settings: {companyCards: {[CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: {liabilityType: 'personal'}}}});
        });

        // When the toggle renders
        const {unmount} = renderToggle();
        await waitForBatchedUpdatesWithAct();

        // Then the switch is present and not locked, since the domain is now using a card
        await waitFor(() => {
            expect(screen.getByRole(CONST.ROLE.SWITCH)).toBeOnTheScreen();
        });
        const switchNode = screen.getByRole(CONST.ROLE.SWITCH);
        expect(switchNode.props.accessibilityLabel).toContain(getToggleLabel());
        expect(switchNode.props.accessibilityLabel).not.toContain(getLockedSuffix());

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
