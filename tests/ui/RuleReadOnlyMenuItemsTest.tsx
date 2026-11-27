import {act, cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import Icon from '@components/Icon';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import * as API from '@libs/API';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getIsOffline} from '@libs/NetworkState';

import AddFlagForReviewRulePage from '@pages/workspace/rules/FlagForReviewRules/AddFlagForReviewRulePage';
import EditMerchantTypeRulePage from '@pages/workspace/rules/MerchantTypeRules/EditMerchantTypeRulePage';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import de from '@src/languages/de';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {getFlagForReviewRuleCategoryRoute} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Locale, Policy} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ImageSVG', () => () => null);

const POLICY_ID = 'readOnlyRulesPolicy';
const OWNER_EMAIL = 'rules-owner@example.com';
const OWNER_ACCOUNT_ID = 1;
const GROUP_ID = 'airlines';
const FLAG_SCREEN = SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_NEW;
const MERCHANT_SCREEN = SCREENS.WORKSPACE.RULES_MERCHANT_TYPE_EDIT;
const PRESS_EVENT = {nativeEvent: {}};

const FLAG_COPY = [
    {
        locale: CONST.LOCALES.EN,
        value: 'Warning',
        details: 'Submitter will be warned, but can still submit expense',
    },
    {
        locale: CONST.LOCALES.DE,
        value: de.workspace.rules.flagForReviewRule.flagTypeWarning,
        details: de.workspace.rules.flagForReviewRule.flagTypeWarningDescription,
    },
];

type EditorScreen = typeof FLAG_SCREEN | typeof MERCHANT_SCREEN;

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

async function seedWorkspace(locale: Locale = CONST.LOCALES.EN, policyOverrides: Partial<Policy> = {}) {
    const policy: Policy = {
        id: POLICY_ID,
        name: 'Read-only rule facts',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: OWNER_EMAIL,
        ownerAccountID: OWNER_ACCOUNT_ID,
        outputCurrency: CONST.CURRENCY.USD,
        areRulesEnabled: true,
        areCategoriesEnabled: true,
        ...policyOverrides,
    };

    await act(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {email: OWNER_EMAIL, accountID: OWNER_ACCOUNT_ID, authToken: 'testToken'});
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[OWNER_ACCOUNT_ID]: buildPersonalDetails(OWNER_EMAIL, OWNER_ACCOUNT_ID)});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, locale);
        await Onyx.set(ONYXKEYS.PREFERRED_THEME, CONST.THEME.LIGHT);
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: false});
        await Onyx.set(ONYXKEYS.BETAS, []);
        await Onyx.set(ONYXKEYS.RAM_ONLY_HAS_RULES_DATA_BEEN_FETCHED, true);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, {
            Meals: {name: 'Meals', enabled: true},
            Travel: {name: 'Travel', enabled: true},
        });
    });
}

function renderEditor(initialRouteName: EditorScreen) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, CurrencyListContextProvider, ThemeProvider, ThemeStylesProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer ref={navigationRef}>
                        <Stack.Navigator
                            initialRouteName={initialRouteName}
                            screenOptions={{headerShown: false}}
                        >
                            <Stack.Screen
                                name={FLAG_SCREEN}
                                component={AddFlagForReviewRulePage}
                                initialParams={{policyID: POLICY_ID}}
                            />
                            <Stack.Screen
                                name={MERCHANT_SCREEN}
                                component={EditMerchantTypeRulePage}
                                initialParams={{policyID: POLICY_ID, groupID: GROUP_ID}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('Read-only facts in the rule editors', () => {
    let navigateSpy: jest.SpiedFunction<typeof Navigation.navigate>;
    let goBackSpy: jest.SpiedFunction<typeof Navigation.goBack>;
    let writeSpy: jest.SpiedFunction<typeof API.write>;

    beforeEach(() => {
        // eslint-disable-next-line rulesdir/no-multiple-api-calls -- Installing test spies blocks requests; it does not execute API commands.
        jest.spyOn(API, 'read').mockImplementation(() => {});
        // eslint-disable-next-line rulesdir/no-multiple-api-calls -- Installing test spies blocks requests; it does not execute API commands.
        writeSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());
        navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
    });

    afterEach(async () => {
        cleanup();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
        jest.restoreAllMocks();
    });

    it.each(FLAG_COPY)('starts new flags with the localized warning option in $locale', async ({locale, value, details}) => {
        // Given an admin opens a flag rule without choosing enforcement.
        await seedWorkspace(locale);

        // When the actual create page renders the warning alongside the editable conditions.
        renderEditor(FLAG_SCREEN);
        // Then a new rule defaults to warning and explains what that means.
        expect(await screen.findByRole(CONST.ROLE.BUTTON, {name: new RegExp(value)})).toBeOnTheScreen();
        expect(screen.getByText(details)).toBeOnTheScreen();
    });

    it.each([
        {locale: CONST.LOCALES.EN, name: 'Merchant type'},
        {locale: CONST.LOCALES.DE, name: de.workspace.rules.merchantTypeRule.merchantType},
    ])('keeps the built-in merchant type and its lock in $locale', async ({locale, name}) => {
        // Given the built-in Airlines rule is available without a custom merchant-type fixture.
        await seedWorkspace(locale);

        // When the real edit page reads the default mapping.
        renderEditor(MERCHANT_SCREEN);
        const row = await screen.findByLabelText(`${name}, Airlines`);

        // Then the fixed type remains readable and locked, even though it is not a button.
        const content = within(row);
        expect(content.getAllByText(/.+/)).toEqual([content.getByText(name), content.getByText('Airlines')]);
        expect(content.getByText(name)).toHaveProp('numberOfLines', 2);
        expect(content.getByText('Airlines')).toHaveProp('numberOfLines', 1);
        expect(row).toHaveAccessibleName(`${name}, Airlines`);
        expect(row).not.toHaveProp('role', CONST.ROLE.BUTTON);
        expect(row).toHaveProp('tabIndex', -1);
        expect(row).toBeEnabled();
        const icons = content.UNSAFE_getAllByType(Icon);
        expect(icons).toHaveLength(1);
        expect(icons.at(0)?.props).toMatchObject({
            src: expect.objectContaining({testID: 'mock-expensify-icon-Lock'}),
            width: variables.iconSizeNormal,
            height: variables.iconSizeNormal,
        });
    });

    it('keeps the seeded flag draft while opening the category picker', async () => {
        // Given the describe flow has already populated a draft that opening the page must preserve.
        await seedWorkspace();
        const draft = {category: 'Meals', maxExpenseAmount: '50', draftKey: `${POLICY_ID}/new`};
        await act(async () => {
            await Onyx.set(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM, draft);
        });
        renderEditor(FLAG_SCREEN);
        const categoryRow = await screen.findByRole(CONST.ROLE.BUTTON, {name: 'Category, Meals'});

        // When the admin opens the category picker.
        fireEvent.press(categoryRow, PRESS_EVENT);

        // Then opening the picker neither replaces the draft nor writes a rule.
        expect(await getOnyxValue(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM)).toEqual(draft);
        expect(goBackSpy).not.toHaveBeenCalled();
        expect(writeSpy).not.toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(getFlagForReviewRuleCategoryRoute(POLICY_ID));
    });

    it('does not open a merchant-type picker or change the category mapping when the locked fact is pressed', async () => {
        // Given a workspace maps Airlines to a category other than the built-in Travel default.
        await seedWorkspace(CONST.LOCALES.EN, {mccGroup: {[GROUP_ID]: {groupID: GROUP_ID, category: 'Meals'}}});
        renderEditor(MERCHANT_SCREEN);
        const row = await screen.findByLabelText('Merchant type, Airlines');
        await waitForBatchedUpdatesWithAct();

        // When a user presses the locked type rather than the editable category.
        fireEvent.press(row, PRESS_EVENT);

        // Then the mapping draft survives, while category navigation retains its own destination.
        expect(await getOnyxValue(ONYXKEYS.FORMS.MERCHANT_TYPE_RULE_FORM)).toEqual({groupID: GROUP_ID, category: 'Meals'});
        expect(navigateSpy).not.toHaveBeenCalled();
        expect(goBackSpy).not.toHaveBeenCalled();
        expect(writeSpy).not.toHaveBeenCalled();
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Category, Meals'}), PRESS_EVENT);
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.RULES_MERCHANT_TYPE_CATEGORY.getRoute(POLICY_ID, GROUP_ID));
    });

    it.each([{editor: MERCHANT_SCREEN, label: 'Merchant type, Airlines', formKey: ONYXKEYS.FORMS.MERCHANT_TYPE_RULE_FORM}])(
        'keeps $label readable and inert after the loaded editor goes offline',
        async ({editor, label, formKey}) => {
            // Given the editor has loaded its workspace and initialized its draft before losing connectivity.
            await seedWorkspace();
            renderEditor(editor);
            await screen.findByLabelText(label);
            await waitForBatchedUpdatesWithAct();
            const draft = await getOnyxValue(formKey);

            // When the connection goes offline and the user presses the informational row.
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
            });
            await waitFor(() => expect(getIsOffline()).toBe(true));
            fireEvent.press(screen.getByLabelText(label), PRESS_EVENT);

            // Then cached facts remain available without starting navigation, writes, or a new draft.
            expect(screen.getByLabelText(label)).toBeOnTheScreen();
            expect(await getOnyxValue(formKey)).toEqual(draft);
            expect(navigateSpy).not.toHaveBeenCalled();
            expect(goBackSpy).not.toHaveBeenCalled();
            expect(writeSpy).not.toHaveBeenCalled();
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: false});
            });
            await waitFor(() => expect(getIsOffline()).toBe(false));
            expect(screen.getByLabelText(label)).toBeOnTheScreen();
        },
    );
});
