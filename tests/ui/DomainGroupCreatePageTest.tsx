import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import DomainGroupCreatePage from '@pages/domain/Groups/DomainGroupCreatePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const domainAccountID = 424242;
const currentUserAccountID = 1;
const domainKey = `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}` as const;
const domainMemberKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}` as const;
// Literal key so it matches only the admin-permissions index signature on Domain, not the security-group one.
const adminAccessKey = `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}${currentUserAccountID}` as const;

// "Preferred Workspace" and "Card preferred workspace" both contain "preferred workspace"; anchor to the start of the
// label so each regex hits only its own switch. The card switch appends `, Locked` to its label when disabled.
const cardToggleName = () => new RegExp(`^${TestHelper.translateLocal('domain.groups.expensifyCardPreferredWorkspace')}`);
const lockedCardToggleName = () => new RegExp(`^${TestHelper.translateLocal('domain.groups.expensifyCardPreferredWorkspace')}.*${TestHelper.translateLocal('common.locked')}`);
const preferredWorkspaceToggleName = () => new RegExp(`^${TestHelper.translateLocal('domain.groups.preferredWorkspace')}`);

const renderPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.DOMAIN.GROUP_CREATE}>
                            <Stack.Screen
                                name={SCREENS.DOMAIN.GROUP_CREATE}
                                component={DomainGroupCreatePage}
                                initialParams={{domainAccountID}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

// The page renders only for a domain admin, and its "Preferred workspace" toggle needs an admin policy to be enabled.
const setupAdminDomain = async () => {
    await TestHelper.signInWithTestUser(currentUserAccountID);
    const policy = {...LHNTestUtils.getFakePolicy(), role: CONST.POLICY.ROLE.ADMIN, type: CONST.POLICY.TYPE.TEAM};
    await act(async () => {
        await Onyx.merge(domainKey, {[adminAccessKey]: currentUserAccountID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
    });
};

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

beforeEach(() => {
    jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
        shouldUseNarrowLayout: true,
        isSmallScreenWidth: true,
        isInNarrowPaneModal: false,
        isExtraSmallScreenHeight: false,
        isMediumScreenWidth: false,
        isLargeScreenWidth: false,
        isExtraLargeScreenWidth: false,
        isExtraSmallScreenWidth: false,
        isSmallScreen: true,
        onboardingIsMediumOrLargerScreenWidth: false,
        isInLandscapeMode: false,
    });
});

afterEach(async () => {
    await act(async () => {
        await Onyx.clear();
    });
    jest.clearAllMocks();
});

describe('DomainGroupCreatePage Card preferred workspace toggle', () => {
    it('keeps the toggle locked when a preferred workspace is chosen but the domain has no card feed', async () => {
        // Given an admin creating a group on a domain with no card feed
        await setupAdminDomain();
        const {unmount} = renderPage();
        await waitForBatchedUpdatesWithAct();

        // When a preferred workspace is enabled (so the gate reduces to the card-feed hook)
        fireEvent.press(await screen.findByRole(CONST.ROLE.SWITCH, {name: preferredWorkspaceToggleName()}));
        await waitForBatchedUpdatesWithAct();

        // Then the card toggle stays locked, and pressing it surfaces the "not so fast" prompt
        const lockedSwitch = await screen.findByRole(CONST.ROLE.SWITCH, {name: lockedCardToggleName()});
        fireEvent.press(lockedSwitch);
        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('domain.groups.expensifyCardPreferredWorkspaceDisabledMessage'))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('unlocks the toggle when a preferred workspace is chosen and the domain has a company card feed', async () => {
        // Given the same admin, now with a company card feed on the domain
        await setupAdminDomain();
        await act(async () => {
            await Onyx.merge(domainMemberKey, {settings: {companyCards: {[CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: {liabilityType: 'personal'}}}});
        });
        const {unmount} = renderPage();
        await waitForBatchedUpdatesWithAct();

        // When a preferred workspace is enabled
        fireEvent.press(await screen.findByRole(CONST.ROLE.SWITCH, {name: preferredWorkspaceToggleName()}));
        await waitForBatchedUpdatesWithAct();

        // Then the card toggle is no longer locked, and pressing it toggles instead of surfacing the disabled prompt
        const cardSwitch = await screen.findByRole(CONST.ROLE.SWITCH, {name: cardToggleName()});
        expect(cardSwitch.props.accessibilityLabel).not.toContain(TestHelper.translateLocal('common.locked'));
        fireEvent.press(cardSwitch);
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText(TestHelper.translateLocal('domain.groups.expensifyCardPreferredWorkspaceDisabledMessage'))).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
