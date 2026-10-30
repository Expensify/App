import {screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import AttendeesCell from '@components/Search/SearchList/ListItem/AttendeesCell';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ROW_COUNT = 50;
const ATTENDEES_PER_ROW = 3;
const WRITES_PER_SCENARIO = 10;
const UNRELATED_ACCOUNT_ID = 1000;

const personalDetails: PersonalDetailsList = {
    [UNRELATED_ACCOUNT_ID]: {accountID: UNRELATED_ACCOUNT_ID, login: 'unrelated@test.com', displayName: 'Unrelated'},
};
const rows: Attendee[][] = [];
for (let row = 0; row < ROW_COUNT; row++) {
    const attendees: Attendee[] = [];
    for (let index = 0; index < ATTENDEES_PER_ROW; index++) {
        const accountID = row * ATTENDEES_PER_ROW + index + 1;
        const email = `attendee${accountID}@test.com`;
        personalDetails[accountID] = {accountID, login: email, displayName: `Attendee ${accountID}`};
        attendees.push({email, displayName: `Attendee ${accountID}`, avatarUrl: ''});
    }
    rows.push(attendees);
}

function SearchRowsWithAttendees() {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <View>
                {rows.map((attendees, index) => (
                    <AttendeesCell
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        attendees={attendees}
                        isHovered={false}
                        isPressed={false}
                    />
                ))}
            </View>
        </ComposeProviders>
    );
}

describe('AttendeesCell on personal details writes', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    test('[AttendeesCell] should re-render 50 Search rows when a user who attends nothing is renamed', async () => {
        // Reassure runs the scenario several times against one seeded Onyx, so every run writes a name that doesn't exist yet
        let run = 0;
        const scenario = async () => {
            // Given 50 Search rows with attendees have rendered
            await screen.findAllByTestId('AttendeesCell-Row');

            // When a user who attends none of them is renamed, which makes the engine recompute the login map to the same content
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[UNRELATED_ACCOUNT_ID]: {displayName: `Unrelated ${run}-${index}`}});
                await waitForBatchedUpdates();
            }
            run++;
        };

        // Then reassure measures how many row re-renders the unrelated writes cause
        await measureRenders(<SearchRowsWithAttendees />, {scenario});
    });
});
