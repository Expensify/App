import {render, screen} from '@testing-library/react-native';

import AutoUpdateTime from '@components/AutoUpdateTime';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import ONYXKEYS from '@src/ONYXKEYS';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

describe('AutoUpdateTime', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    it.each(['Not/AZone', 'Z', 'constructor'])('renders the local time for the timezone %p', async (timezone) => {
        // Given another user's personal details with a timezone `Intl` doesn't know, which the server can store
        // When their profile renders their local time
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- other users' personal details can hold a timezone that isn't in the app's list */}
                <AutoUpdateTime timezone={{automatic: false, selected: timezone as SelectedTimezone}} />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the local time row is shown instead of the zone formatting error crashing the page
        expect(screen.getByText('Local time')).toBeOnTheScreen();
    });
});
