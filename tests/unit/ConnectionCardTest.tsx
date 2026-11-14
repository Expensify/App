import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import ConnectionCard from '@pages/workspace/connections/ConnectionCard';
import type {ConnectionListing} from '@pages/workspace/connections/types';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CONNECT_ERROR = 'Zoho Books organizations with multiple locations are not supported yet.';

function renderCard(listing: ConnectionListing) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ConnectionCard
                listing={listing}
                shouldUseFullWidth
            />
        </ComposeProviders>,
    );
}

describe('ConnectionCard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('shows a failed connect as broken with its reason, and still lets the admin retry', async () => {
        // Given a disconnected Zoho Books card whose last connect flow failed, so the backend left the reason on the policy
        const onConnect = jest.fn();
        const onConfigure = jest.fn();
        renderCard({
            key: CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS,
            category: CONST.TAB.CONNECTIONS.ACCOUNTING,
            title: 'Zoho Books',
            connectError: CONNECT_ERROR,
            onConnect,
            onConfigure,
        });
        await waitForBatchedUpdatesWithAct();

        // When the admin presses the card
        // MenuItem only runs onPress with the press event, so the test passes one
        fireEvent.press(screen.getByLabelText(`Zoho Books, ${CONNECT_ERROR}`), {nativeEvent: {}});

        // Then it reads like a broken connection, with the reason next to the badge so the admin knows why it didn't connect,
        // and pressing it starts the connect flow again, because nothing is connected yet to configure
        expect(screen.getByText(translateLocal('workspace.connections.broken'))).toBeOnTheScreen();
        expect(screen.getByText(CONNECT_ERROR)).toBeOnTheScreen();
        expect(onConnect).toHaveBeenCalledTimes(1);
        expect(onConfigure).not.toHaveBeenCalled();
    });

    it('shows no status on an available card without a connect error', async () => {
        // Given a disconnected Zoho Books card that never failed to connect
        renderCard({
            key: CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS,
            category: CONST.TAB.CONNECTIONS.ACCOUNTING,
            title: 'Zoho Books',
            onConnect: jest.fn(),
        });
        await waitForBatchedUpdatesWithAct();

        // When the card is shown
        const brokenBadge = screen.queryByText(translateLocal('workspace.connections.broken'));

        // Then it has no badge, so only a failed connect marks an available integration as broken
        expect(brokenBadge).not.toBeOnTheScreen();
    });
});
