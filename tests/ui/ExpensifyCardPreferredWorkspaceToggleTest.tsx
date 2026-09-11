import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import ExpensifyCardPreferredWorkspaceToggle from '@pages/domain/Groups/ExpensifyCardPreferredWorkspaceToggle';

import {updateDomainSecurityGroup} from '@userActions/Domain';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DomainSecurityGroup} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/Domain', () => ({
    updateDomainSecurityGroup: jest.fn(),
    clearDomainSecurityGroupSettingError: jest.fn(),
}));

// The switch defers onToggle inside a requestAnimationFrame, so run it synchronously to keep the press assertions deterministic.
jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
    callback(0);
    return 0;
});

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

// Same group with the override already on, mirroring a group that had a card feed when the setting was turned on.
const activeGroup: DomainSecurityGroup = {...group, overridePreferredPolicyWithCardPolicy: true};

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

const seedGroup = async (groupToSeed: DomainSecurityGroup = group) => {
    await act(async () => {
        await Onyx.merge(domainKey, {[groupKey]: groupToSeed});
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

    it('keeps an already-on toggle manually disable-able after the card feed is removed', async () => {
        // Given a group that has the override on but no card feed on the domain (e.g. the feed was removed while it was on)
        await seedGroup(activeGroup);

        // When the toggle renders
        const {unmount} = renderToggle();
        await waitForBatchedUpdatesWithAct();

        // Then the switch is on and NOT locked, so the admin can still turn it off manually even though a feed is required to turn it back on
        await waitFor(() => {
            expect(screen.getByRole(CONST.ROLE.SWITCH, {checked: true})).toBeOnTheScreen();
        });
        const switchNode = screen.getByRole(CONST.ROLE.SWITCH, {checked: true});
        expect(switchNode.props.accessibilityLabel).not.toContain(getLockedSuffix());

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('turns the override off when the on toggle is pressed with no card feed', async () => {
        // Given the group that is on with no card feed
        await seedGroup(activeGroup);
        const {unmount} = renderToggle();
        await waitForBatchedUpdatesWithAct();

        // When the admin presses the switch to turn it off
        fireEvent.press(screen.getByRole(CONST.ROLE.SWITCH));
        await waitForBatchedUpdatesWithAct();

        // Then the override is written as false through the normal update action (no dependency on the card feed being present)
        expect(updateDomainSecurityGroup).toHaveBeenCalledWith(
            domainAccountID,
            groupID,
            expect.objectContaining({overridePreferredPolicyWithCardPolicy: true}),
            {overridePreferredPolicyWithCardPolicy: false},
            'overridePreferredPolicyWithCardPolicy',
        );

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
