/** Rendering coverage for the cardholder identity on admin Expensify Card details. */
import {act, cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import getPlatform from '@libs/getPlatform';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import DynamicWorkspaceExpensifyCardDetailsPage from '@pages/workspace/expensifyCard/DynamicWorkspaceExpensifyCardDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Card} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import {getFakePolicy} from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

jest.mock('@libs/getPlatform', () => jest.fn());

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();
const policyID = 'ABC123';
const fundID = 12345;
const cardID = '5678';
const adminAccountID = 1;
const adminEmail = 'admin@example.com';
const cardholderAccountID = 2;
const cardholderEmail = 'cardholder@example.com';
const cardName = 'Travel card';
const workspaceCardsKey = `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${fundID}_${CONST.EXPENSIFY_CARD.BANK}` as const;

type DetailsScreen = typeof SCREENS.WORKSPACE.DYNAMIC_EXPENSIFY_CARD_DETAILS | typeof SCREENS.EXPENSIFY_CARD.DYNAMIC_EXPENSIFY_CARD_DETAILS;

function renderPage(routeName: DetailsScreen = SCREENS.WORKSPACE.DYNAMIC_EXPENSIFY_CARD_DETAILS) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider, CurrencyListContextProvider, CurrentUserPersonalDetailsProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={routeName}>
                        <Stack.Screen
                            name={routeName}
                            component={DynamicWorkspaceExpensifyCardDetailsPage}
                            initialParams={{policyID, cardID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

function buildCard(isVirtual = false): Card {
    return {
        cardID: Number(cardID),
        accountID: cardholderAccountID,
        fundID: String(fundID),
        bank: CONST.EXPENSIFY_CARD.BANK,
        domainName: 'example.com',
        lastUpdated: '2026-11-16',
        fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        lastFourPAN: '1234',
        availableSpend: 10000,
        nameValuePairs: {cardTitle: cardName, isVirtual},
    };
}

describe('Workspace Expensify Card details cardholder email', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.WEB);
        await TestHelper.signInWithTestUser(adminAccountID, adminEmail);
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [adminAccountID]: TestHelper.buildPersonalDetails(adminEmail, adminAccountID, 'Admin'),
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                ...getFakePolicy(),
                id: policyID,
                policyAccountID: fundID,
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.CORPORATE,
                areExpensifyCardsEnabled: true,
                employeeList: {[adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.ADMIN}},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`, {hasOnceLoaded: true});
        });
    });

    afterEach(async () => {
        cleanup();
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it.each([
        {isVirtual: false, displayName: 'Card Holder'},
        {isVirtual: false, displayName: ''},
        {isVirtual: true, displayName: 'Card Holder'},
        {isVirtual: true, displayName: ''},
    ])('shows the selected cardholder email with isVirtual=$isVirtual and displayName="$displayName"', async ({isVirtual, displayName}) => {
        // Given cardholders can have display names unrelated to their email, neither should replace the other.
        await act(async () => {
            await Onyx.set(workspaceCardsKey, {[cardID]: buildCard(isVirtual)});
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [cardholderAccountID]: {accountID: cardholderAccountID, login: cardholderEmail, displayName},
            });
        });

        // When an admin opens an assigned card, the shared layout must identify either card type.
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the email is a separate read-only field between the unchanged nickname and card number.
        const emailLabel = TestHelper.translateLocal('workspace.card.issueNewCard.cardholderEmail');
        const cardNameLabel = TestHelper.translateLocal('workspace.card.issueNewCard.cardName');
        const numberLabel = TestHelper.translateLocal(isVirtual ? 'cardPage.virtualCardNumber' : 'cardPage.physicalCardNumber');
        expect(screen.getByLabelText(`${emailLabel}, ${cardholderEmail}`)).toBeOnTheScreen();
        expect(screen.queryByRole('button', {name: `${emailLabel}, ${cardholderEmail}`})).toBeNull();
        expect(screen.getByText(cardName)).toBeOnTheScreen();
        const labels = screen.getAllByText(new RegExp(`^(${cardNameLabel}|${emailLabel}|${numberLabel})$`));
        expect(labels).toHaveLength(3);
        expect(labels[0]).toHaveTextContent(cardNameLabel);
        expect(labels[1]).toHaveTextContent(emailLabel);
        expect(labels[2]).toHaveTextContent(numberLabel);
        if (displayName) {
            expect(screen.getByText(displayName)).toBeOnTheScreen();
        }
    });

    it.each([SCREENS.WORKSPACE.DYNAMIC_EXPENSIFY_CARD_DETAILS, SCREENS.EXPENSIFY_CARD.DYNAMIC_EXPENSIFY_CARD_DETAILS])(
        'updates missing personal details without using the admin identity on direct route %s',
        async (routeName) => {
            // Given a direct entry can have a cached card before the cardholder profile arrives.
            await act(async () => {
                await Onyx.set(ONYXKEYS.CARD_LIST, {[cardID]: buildCard()});
            });

            // When either details route mounts without first opening the card list.
            renderPage(routeName);
            await waitForBatchedUpdatesWithAct();

            // Then an unavailable email must not become an empty row or the viewing admin's email.
            const emailLabel = TestHelper.translateLocal('workspace.card.issueNewCard.cardholderEmail');
            expect(screen.queryByText(emailLabel)).toBeNull();
            expect(screen.queryByText(adminEmail)).toBeNull();

            // When only a display name arrives, it still cannot stand in for the email.
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[cardholderAccountID]: {accountID: cardholderAccountID, displayName: 'Card Holder'}});
            });
            expect(screen.queryByText(emailLabel)).toBeNull();

            // Then a subsequent profile update supplies the selected cardholder's email without a remount.
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[cardholderAccountID]: {login: cardholderEmail}});
            });
            expect(await screen.findByLabelText(`${emailLabel}, ${cardholderEmail}`)).toBeOnTheScreen();
        },
    );

    it('allows long email values to wrap and be selected without making the row editable', async () => {
        // Given an email can exceed the available width, its value must not be limited to one line.
        const longEmail = 'a.very.long.cardholder.email.address.for.narrow.layouts@example.com';
        await act(async () => {
            await Onyx.set(workspaceCardsKey, {[cardID]: buildCard()});
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[cardholderAccountID]: {accountID: cardholderAccountID, login: longEmail, displayName: 'Card Holder'}});
        });

        // When the email row is rendered and pressed, it must remain a read-only value.
        renderPage();
        await waitForBatchedUpdatesWithAct();
        const emailRow = screen.getByLabelText(`${TestHelper.translateLocal('workspace.card.issueNewCard.cardholderEmail')}, ${longEmail}`);
        fireEvent.press(emailRow);

        // Then the full selectable value remains visible with no single-line cap or button role.
        expect(screen.getByText(longEmail)).toHaveProp('numberOfLines', 0);
        expect(screen.getByText(longEmail)).toHaveStyle({userSelect: 'text'});
        expect(emailRow).not.toHaveProp('accessibilityRole', 'button');
        expect(screen.getByText(cardName)).toBeOnTheScreen();
    });
});
