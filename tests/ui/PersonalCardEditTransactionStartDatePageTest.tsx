import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import DatePicker from '@components/DatePicker';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import Navigation from '@navigation/Navigation';

import PersonalCardEditTransactionStartDatePage from '@pages/settings/Wallet/PersonalCardEditTransactionStartDatePage';

import {updateAssignedCardTransactionStartDate} from '@userActions/Card';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useDynamicBackPath', () => ({__esModule: true, default: () => '/settings/wallet'}));
jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({__esModule: true, default: () => ({didScreenTransitionEnd: true})}));
jest.mock('@userActions/Card', () => ({updateAssignedCardTransactionStartDate: jest.fn()}));
jest.mock('@navigation/Navigation', () => ({
    __esModule: true,
    default: {
        goBack: jest.fn(),
        getActiveRoute: jest.fn(() => ''),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        isTopmostRouteModalScreen: jest.fn(() => false),
    },
}));

type PageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_PERSONAL_CARD_EDIT_TRANSACTION_START_DATE>;
const CARD_ID = '123';
const CUSTOM_DATE = '2026-10-01';
const route: PageProps['route'] = {
    key: 'personal-card-start-date',
    name: SCREENS.SETTINGS.WALLET.DYNAMIC_PERSONAL_CARD_EDIT_TRANSACTION_START_DATE,
    params: {cardID: CARD_ID},
};
// The page uses the Navigation singleton rather than its navigator prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as PageProps['navigation'];

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PersonalCardEditTransactionStartDatePage
                route={route}
                navigation={navigation}
            />
        </ComposeProviders>,
    );
}

describe('PersonalCardEditTransactionStartDatePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('clears a custom start date when saving From the beginning', async () => {
        // Given a personal card that previously imported from a custom date
        await Onyx.set(ONYXKEYS.CARD_LIST, {[CARD_ID]: {cardID: Number(CARD_ID), scrapeMinDate: CUSTOM_DATE}});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the user switches to importing all available history
        fireEvent.press(screen.getByText('From the beginning'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Save'));

        // Then clear the date instead of substituting a date 90 days ago
        expect(updateAssignedCardTransactionStartDate).toHaveBeenCalledWith(CARD_ID, '', CUSTOM_DATE);
        expect(Navigation.goBack).toHaveBeenCalled();
    });

    it.each(['', undefined])('keeps From the beginning selected without updating an unchanged date (%s)', async (scrapeMinDate) => {
        // Given a card with no minimum date, including older records without the field
        await Onyx.set(ONYXKEYS.CARD_LIST, {[CARD_ID]: {cardID: Number(CARD_ID), scrapeMinDate}});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When saving the initial selection without making changes
        fireEvent.press(screen.getByText('Save'));

        // Then the empty date remains unchanged rather than becoming today's custom date
        expect(updateAssignedCardTransactionStartDate).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalled();
    });

    it('keeps an existing custom date selected on reopening', async () => {
        // Given a personal card with a saved custom date
        await Onyx.set(ONYXKEYS.CARD_LIST, {[CARD_ID]: {cardID: Number(CARD_ID), scrapeMinDate: CUSTOM_DATE}});
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When saving without changing that date
        fireEvent.press(screen.getByText('Save'));

        // Then keep the date rather than clearing it with an incorrect initial selection
        expect(updateAssignedCardTransactionStartDate).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalled();
    });

    it('preserves a custom date that arrives after the page mounts', async () => {
        // Given a deep link opened before the card is available
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When Onyx supplies the saved custom date after the first render
        await Onyx.set(ONYXKEYS.CARD_LIST, {[CARD_ID]: {cardID: Number(CARD_ID), scrapeMinDate: CUSTOM_DATE}});
        await waitForBatchedUpdatesWithAct();

        // Then the saved date is displayed and an unchanged save cannot clear it
        expect(screen.getByDisplayValue(CUSTOM_DATE)).toBeOnTheScreen();
        fireEvent.press(screen.getByText('Save'));
        expect(updateAssignedCardTransactionStartDate).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalled();
    });

    it('cannot save before the target card is available', async () => {
        // Given a page waiting for its card data
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When Save is pressed before the card arrives
        fireEvent.press(screen.getByText('Save'));

        // Then no date can be written for an unloaded card
        expect(screen.getByText('Save')).toBeDisabled();
        expect(updateAssignedCardTransactionStartDate).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('preserves a typed custom date when the saved card date changes', async () => {
        // Given a user editing a saved custom date
        await Onyx.set(ONYXKEYS.CARD_LIST, {[CARD_ID]: {cardID: Number(CARD_ID), scrapeMinDate: CUSTOM_DATE}});
        renderPage();
        await waitForBatchedUpdatesWithAct();
        const editedDate = '2026-10-03';
        fireEvent(screen.UNSAFE_getByType(DatePicker), 'inputChange', editedDate);
        await waitForBatchedUpdatesWithAct();

        // When a refreshed card date arrives during the edit
        const updatedDate = '2026-10-02';
        await Onyx.merge(ONYXKEYS.CARD_LIST, {[CARD_ID]: {scrapeMinDate: updatedDate}});
        await waitForBatchedUpdatesWithAct();

        // Then Save uses the user's date rather than replacing it with the refreshed value
        expect(screen.getByDisplayValue(editedDate)).toBeOnTheScreen();
        fireEvent.press(screen.getByText('Save'));
        expect(updateAssignedCardTransactionStartDate).toHaveBeenCalledWith(CARD_ID, editedDate, updatedDate);
    });

    it('preserves an explicit selection when the saved card date changes', async () => {
        // Given a user who deliberately chooses to clear a saved custom date
        await Onyx.set(ONYXKEYS.CARD_LIST, {[CARD_ID]: {cardID: Number(CARD_ID), scrapeMinDate: CUSTOM_DATE}});
        renderPage();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('From the beginning'));
        await waitForBatchedUpdatesWithAct();

        // When a card update arrives while the user is editing
        const updatedDate = '2026-10-02';
        await Onyx.merge(ONYXKEYS.CARD_LIST, {[CARD_ID]: {scrapeMinDate: updatedDate}});
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Save'));

        // Then the explicit selection wins over the refreshed saved date
        expect(updateAssignedCardTransactionStartDate).toHaveBeenCalledWith(CARD_ID, '', updatedDate);
    });
});
