/** Keeps the unverified-domain benefits and their distinct verification destinations covered together. */
import {act, cleanup, fireEvent, render, screen, within} from '@testing-library/react-native';

import LaptopWithMembers from '@assets/images/illustration-laptop-members.svg';
import LaptopOnDeskWithCoffeeAndKey from '@assets/images/laptop-on-desk-with-coffee-and-key.svg';
import BuildingCross from '@assets/images/simple-illustrations/simple-illustration__building_cross.svg';
import Encryption from '@assets/images/simple-illustrations/simple-illustration__encryption.svg';
import LockClosed from '@assets/images/simple-illustrations/simple-illustration__lockclosed.svg';
import OpenSafe from '@assets/images/simple-illustrations/simple-illustration__opensafe.svg';
import ShieldYellow from '@assets/images/simple-illustrations/simple-illustration__shield.svg';

import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@libs/Navigation/types';

import DomainSamlPage from '@pages/domain/DomainSamlPage';
import DomainMembersPage from '@pages/domain/Members/DomainMembersPage';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type IconAsset from '@src/types/utils/IconAsset';

import type {PropsWithChildren, ReactElement} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const DOMAIN_ACCOUNT_ID = 123;
const ADMIN_ACCOUNT_ID = 456;
const DOMAIN_NAME = 'company.com';
const ADMIN_ACCESS_KEY = `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}${ADMIN_ACCOUNT_ID}` as const;
const currentUser = {accountID: ADMIN_ACCOUNT_ID, login: `admin@${DOMAIN_NAME}`};
const PRESS_EVENT = {nativeEvent: {}};
const mockIllustrations = {LaptopWithMembers, LaptopOnDeskWithCoffeeAndKey, BuildingCross, Encryption, LockClosed, OpenSafe, ShieldYellow};

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => mockIllustrations,
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn(), goBack: jest.fn(), dismissModal: jest.fn()},
}));

jest.mock('@hooks/useConfirmModal', () => ({__esModule: true, default: () => ({showConfirmModal: jest.fn()})}));
jest.mock('@hooks/useDecisionModal', () => ({__esModule: true, default: () => ({showDecisionModal: jest.fn()})}));
jest.mock('@hooks/useDomainDocumentTitle', () => ({__esModule: true, default: jest.fn()}));

// The page chrome and validated-domain table are outside the unverified-domain benefit flow.
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@pages/domain/BaseDomainMembersPage', () => () => null);

function renderDomainPage(page: ReactElement) {
    return render(
        <NavigationContainer>
            <ThemeProvider theme={CONST.THEME.LIGHT}>
                <ThemeStylesProvider>
                    <OnyxListItemProvider>
                        <CurrentUserPersonalDetailsContext.Provider value={currentUser}>
                            <LocaleContextProvider>
                                <HTMLEngineProvider>{page}</HTMLEngineProvider>
                            </LocaleContextProvider>
                        </CurrentUserPersonalDetailsContext.Provider>
                    </OnyxListItemProvider>
                </ThemeStylesProvider>
            </ThemeProvider>
        </NavigationContainer>,
    );
}

async function expectDomainBenefit(label: string, illustration: IconAsset) {
    const row = await screen.findByLabelText(label);
    expect(within(row).UNSAFE_getByType(Icon).props.src).toBe(illustration);
    expect(row).toHaveProp('tabIndex', -1);
    expect(within(row).queryAllByRole(CONST.ROLE.BUTTON)).toHaveLength(0);
}

describe('unverified-domain benefit composition', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        const domain = {
            accountID: DOMAIN_ACCOUNT_ID,
            email: `admin@${DOMAIN_NAME}`,
            validated: false,
            [ADMIN_ACCESS_KEY]: ADMIN_ACCOUNT_ID,
        };
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await IntlStore.load(CONST.LOCALES.EN);
            await Onyx.set(ONYXKEYS.SESSION, {accountID: ADMIN_ACCOUNT_ID, email: currentUser.login});
            await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);
            await waitForBatchedUpdatesWithAct();
        });
    });

    afterEach(async () => {
        cleanup();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('renders the real SAML benefits and rich subtitle without moving verification onto the rows', async () => {
        // Given an admin of an existing domain that has not yet been verified
        const props = createMock<PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.SAML>>({
            route: {key: 'saml-benefits-route', name: SCREENS.DOMAIN.SAML, params: {domainAccountID: DOMAIN_ACCOUNT_ID}},
        });

        // When the SAML page explains what verification will enable
        renderDomainPage(<DomainSamlPage {...props} />);
        const fasterLogin = translateLocal('domain.samlFeatureList.fasterAndEasierLogin');
        await expectDomainBenefit(fasterLogin, OpenSafe);
        await expectDomainBenefit(translateLocal('domain.samlFeatureList.moreSecurityAndControl'), ShieldYellow);
        await expectDomainBenefit(translateLocal('domain.samlFeatureList.onePasswordForAnything'), LockClosed);
        fireEvent.press(screen.getByLabelText(fasterLogin), PRESS_EVENT);

        // Then the translated order, header art and domain-specific HTML introduction remain intact
        expect(screen.UNSAFE_getAllByType(Icon).map((icon): unknown => icon.props.src)).toEqual([OpenSafe, ShieldYellow, LockClosed]);
        expect(screen.UNSAFE_getAllByType(MenuItem.Root)).toHaveLength(3);
        expect(screen.UNSAFE_getAllByType(ImageSVG).at(0)?.props.src).toBe(LaptopOnDeskWithCoffeeAndKey);
        expect(screen.getByRole(CONST.ROLE.HEADER, {name: translateLocal('domain.samlFeatureList.title')})).toBeOnTheScreen();
        expect(screen.getByText(`@${DOMAIN_NAME}`)).toBeOnTheScreen();
        expect(screen.getByText('SAML SSO')).toBeOnTheScreen();
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When the admin chooses verification instead of merely reading a benefit
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: translateLocal('domain.verifyDomain.title')}), PRESS_EVENT);

        // Then the SAML-specific verification route receives the same domain account
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.DOMAIN_SAML_VERIFY.getRoute(DOMAIN_ACCOUNT_ID));
    });

    it('renders the real member-management benefits and retains its different verification destination', async () => {
        // Given the same unverified domain, with real Onyx selectors granting the admin access
        const props = createMock<PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.MEMBERS>>({
            route: {key: 'member-benefits-route', name: SCREENS.DOMAIN.MEMBERS, params: {domainAccountID: DOMAIN_ACCOUNT_ID}},
        });

        // When the members page offers the controls that domain verification unlocks
        renderDomainPage(<DomainMembersPage {...props} />);
        const restrictCreation = translateLocal('domain.members.membersFeatureList.controlPolicyCreation');
        await expectDomainBenefit(restrictCreation, BuildingCross);
        await expectDomainBenefit(translateLocal('domain.members.membersFeatureList.enableSamlSso'), LockClosed);
        await expectDomainBenefit(translateLocal('domain.members.membersFeatureList.enforce2FA'), Encryption);
        fireEvent.press(screen.getByLabelText(restrictCreation), PRESS_EVENT);

        // Then all three informational items and the rendered HTML domain name remain visible
        expect(screen.UNSAFE_getAllByType(Icon).map((icon): unknown => icon.props.src)).toEqual([BuildingCross, LockClosed, Encryption]);
        expect(screen.UNSAFE_getAllByType(MenuItem.Root)).toHaveLength(3);
        expect(screen.UNSAFE_getAllByType(ImageSVG).at(0)?.props.src).toBe(LaptopWithMembers);
        expect(screen.getByRole(CONST.ROLE.HEADER, {name: translateLocal('domain.domainMembers')})).toBeOnTheScreen();
        expect(screen.getByText(`@${DOMAIN_NAME}`)).toBeOnTheScreen();
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When the admin starts verification from member management
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: translateLocal('domain.verifyDomain.title')}), PRESS_EVENT);

        // Then this caller still uses the members verification route, not the SAML route
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.DOMAIN_MEMBERS_VERIFY.getRoute(DOMAIN_ACCOUNT_ID));
    });
});
