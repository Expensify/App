import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ReactionTooltipContent from '@components/Reactions/ReactionTooltipContent';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const renderWithProviders = (component: React.ReactElement) => {
    return render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{component}</ComposeProviders>);
};

describe('ReactionTooltipContent', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        return IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        return Onyx.clear([ONYXKEYS.NVP_PREFERRED_LOCALE]);
    });

    it('renders multiple user names in order', async () => {
        const firstAccountID = 1;
        const secondAccountID = 2;
        const thirdAccountID = 3;
        const currentUserAccountID = firstAccountID;
        const personalDetails: PersonalDetailsList = {
            [firstAccountID]: {
                accountID: firstAccountID,
                displayName: 'Current User Name',
            },
            [secondAccountID]: {
                accountID: secondAccountID,
            },
            [thirdAccountID]: {
                accountID: thirdAccountID,
                displayName: 'Jane Smith',
            },
        };

        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        });
        await waitForBatchedUpdatesWithAct();

        renderWithProviders(
            <ReactionTooltipContent
                emojiCodes={['👍']}
                emojiName="thumbsup"
                accountIDs={[firstAccountID, secondAccountID, thirdAccountID]}
                currentUserAccountID={currentUserAccountID}
            />,
        );

        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('You, Jane Smith')).toBeOnTheScreen();
    });
});
