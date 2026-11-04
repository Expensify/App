import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import DateCell from '@components/Search/SearchList/ListItem/DateCell';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';
import type {Locale} from '@src/CONST/LOCALES';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation');

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

function renderDateCell(date: string, shouldUseLocalTimeZone = false) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <DateCell
                date={date}
                shouldUseLocalTimeZone={shouldUseLocalTimeZone}
                showTooltip={false}
                isLargeScreenWidth
            />
        </ComposeProviders>,
    );
}

async function setPreferredLocale(locale: Locale) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, locale);
    });
    await waitForBatchedUpdatesWithAct();
}

describe('DateCell month and day', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    beforeEach(() => {
        jest.useFakeTimers({doNotFake: ['setImmediate', 'nextTick']});
        jest.setSystemTime(new Date('2026-11-03T20:00:00Z'));
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
        jest.useRealTimers();
    });

    it.each([
        [CONST.LOCALES.EN, 'Jan 22'],
        [CONST.LOCALES.DE, '22. Jan.'],
        [CONST.LOCALES.ES, '22 ene'],
        [CONST.LOCALES.JA, '1月22日'],
    ] as const)('uses %s month and day conventions for a date in the current year', async (locale, expected) => {
        // Given an expense dated this year and an explicit app language
        await setPreferredLocale(locale);

        // When its date cell renders through the real locale provider
        renderDateCell('2026-01-22');
        await waitForBatchedUpdatesWithAct();

        // Then the month and day follow that language's order and the year is left out
        expect(screen.getByText(expected)).toBeOnTheScreen();
    });

    it('compares the year in the selected timezone for an instant near midnight', async () => {
        // Given an instant on January 1 UTC that is still December 31 for a viewer in Los Angeles
        jest.setSystemTime(new Date('2026-06-01T12:00:00Z'));
        const accountID = 999;
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {accountID});
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [accountID]: {accountID, timezone: {automatic: false, selected: 'America/Los_Angeles'}},
            });
        });
        await setPreferredLocale(CONST.LOCALES.EN);

        // When the timestamp column displays that instant in the selected timezone
        renderDateCell('2026-01-01 01:00:00', true);
        await waitForBatchedUpdatesWithAct();

        // Then both the visible day and the decision to include a year use December 31, 2025
        expect(screen.getByText('Dec 31, 2025')).toBeOnTheScreen();
    });
});
