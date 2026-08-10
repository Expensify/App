import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import DateCell from '@components/Search/SearchList/ListItem/DateCell';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation');

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

// A date in a past year so the cell uses the "MMM d, yyyy" format, whose MMM token is localized.
const PAST_YEAR_DATE = '2024-11-07';

function renderDateCell() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <DateCell
                date={PAST_YEAR_DATE}
                showTooltip={false}
                isLargeScreenWidth
            />
        </ComposeProviders>,
    );
}

async function setPreferredLocale(locale: typeof CONST.LOCALES.EN | typeof CONST.LOCALES.EL) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, locale);
    });
    await waitForBatchedUpdatesWithAct();
}

describe('DateCell', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    beforeEach(() => {
        mockedUseResponsiveLayout.mockReturnValue({
            isLargeScreenWidth: true,
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
            isMediumScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isExtraSmallScreenHeight: false,
            isExtraLargeScreenWidth: true,
            isSmallScreen: false,
            isInNarrowPaneModal: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isInLandscapeMode: false,
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('re-renders the month name in the new language when the user switches locale', async () => {
        await setPreferredLocale(CONST.LOCALES.EN);
        renderDateCell();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('Nov 7, 2024')).toBeOnTheScreen();

        await setPreferredLocale(CONST.LOCALES.EL);

        // The cell stays mounted and its `date` prop never changes, so the language has to be a real input of the
        // formatted date for this to update.
        expect(screen.getByText('Νοε 7, 2024')).toBeOnTheScreen();
        expect(screen.queryByText('Nov 7, 2024')).not.toBeOnTheScreen();
    });
});
