/**
 * Cover/reveal contract of the "Your spend" section's collapse effect once the Home tab sits under
 * `ScreenActivityWrapper`.
 *
 * Like the "Time sensitive" group, the section collapses itself in the cleanup of a `useFocusEffect`, so a cover ends
 * up showing what a tab blur already shows today: the first page of card rows, with a toggle that still works.
 * The fetching side of this widget is covered by `YourSpendDataTest`, so the data hook is mocked here.
 */
import {fireEvent, screen} from '@testing-library/react-native';

import YourSpendSection from '@pages/home/YourSpendSection';
import type * as UseYourSpendDataModule from '@pages/home/YourSpendSection/useYourSpendData';
import {useYourSpendData, YOUR_SPEND_ROW_STATE} from '@pages/home/YourSpendSection/useYourSpendData';

import CONST from '@src/CONST';

import type * as ReactNavigation from '@react-navigation/native';
import type {EffectCallback, ReactNode} from 'react';
import type React from 'react';
import type {View} from 'react-native';

import createMock from '../../utils/createMock';
import renderScreenWithCover, {getCoverMode} from '../../utils/ScreenCoverHarness';

// On a focused screen react-navigation runs the focus callback as an effect and its cleanup on blur, so an effect is
// the same lifecycle with the cover left as the only thing that can end it.
jest.mock('@react-navigation/native', () => {
    const actualNavigation = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    const ReactModule = jest.requireActual<typeof React>('react');

    return {
        ...actualNavigation,
        useFocusEffect: (callback: EffectCallback) => ReactModule.useEffect(callback, [callback]),
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: jest.fn((key: string) => key)})));

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));

jest.mock('@hooks/useTheme', () => jest.fn(() => ({text: '#000000', icon: '#888888'})));

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => jest.fn(() => ({})),
                },
            ),
    ),
);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({ThumbsUpHourglass: null, MoneyBag: null, DownArrow: null, UpArrow: null})),
}));

jest.mock('@components/WidgetContainer', () => {
    const {View: RNView} = jest.requireActual<{View: typeof View}>('react-native');
    function MockWidgetContainer({children}: {children: ReactNode}) {
        return <RNView>{children}</RNView>;
    }
    return MockWidgetContainer;
});

jest.mock('@pages/home/YourSpendSection/SpendSummaryRow', () => () => null);

jest.mock('@pages/home/YourSpendSection/CardRow', () => {
    const {View: RNView} = jest.requireActual<{View: typeof View}>('react-native');
    function MockCardRow({cardRow}: {cardRow: {cardID: number}}) {
        return <RNView testID={`your-spend-card-row-${cardRow.cardID}`} />;
    }
    return MockCardRow;
});

jest.mock('@pages/home/YourSpendSection/useYourSpendData', () => ({
    ...jest.requireActual<typeof UseYourSpendDataModule>('@pages/home/YourSpendSection/useYourSpendData'),
    useYourSpendData: jest.fn(),
}));

type YourSpendData = ReturnType<typeof useYourSpendData>;
type CardRowData = YourSpendData['cardRows'][number];

const CARD_ROW_COUNT = CONST.HOME.SECTION_VISIBLE_LIMIT + 1;

const cardRows = Array.from({length: CARD_ROW_COUNT}, (element, index) =>
    createMock<CardRowData>({cardID: index + 1, query: `type:expense cardID:${index + 1}`, lastFour: `000${index}`, kind: 'expensify'}),
);

function visibleCardRowCount(): number {
    return screen.queryAllByTestId(/^your-spend-card-row-/).length;
}

function pressExpandToggle() {
    fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));
}

describe('YourSpendSection under a screen cover', () => {
    beforeEach(() => {
        // Both summary rows stay hidden so the card rows alone fill the visible page and the toggle is the only button.
        jest.mocked(useYourSpendData).mockReturnValue({
            approvalRowState: YOUR_SPEND_ROW_STATE.HIDDEN,
            approvalTotals: {total: undefined, currency: undefined},
            paymentRowState: YOUR_SPEND_ROW_STATE.HIDDEN,
            paymentTotals: {total: undefined, currency: undefined},
            cardRows,
            awaitingApprovalQuery: 'type:expense status:outstanding',
            repaidLast30DaysQuery: 'type:expense status:paid',
            isApprovalStale: false,
            isPaymentStale: false,
        });
    });

    it('shows only the first page of card rows until the toggle is pressed', () => {
        renderScreenWithCover(<YourSpendSection />);

        expect(visibleCardRowCount()).toBe(CONST.HOME.SECTION_VISIBLE_LIMIT);

        pressExpandToggle();

        expect(visibleCardRowCount()).toBe(CARD_ROW_COUNT);
    });

    it('collapses an expanded section on a hide, the way a blur collapses it', async () => {
        const home = renderScreenWithCover(<YourSpendSection />);
        pressExpandToggle();
        expect(visibleCardRowCount()).toBe(CARD_ROW_COUNT);

        await home.hide();
        await home.reveal();

        // Under `none` the cover is not a blur and nothing runs the cleanup, which is the difference the wrapper makes:
        // it turns a cover into the collapse the user already gets from leaving the tab.
        const expectedCardRowCount = getCoverMode() === 'activity' ? CONST.HOME.SECTION_VISIBLE_LIMIT : CARD_ROW_COUNT;
        expect(visibleCardRowCount()).toBe(expectedCardRowCount);
    });

    it('leaves a collapsed section collapsed across a hide and a reveal', async () => {
        const home = renderScreenWithCover(<YourSpendSection />);

        await home.hide();
        await home.reveal();

        expect(visibleCardRowCount()).toBe(CONST.HOME.SECTION_VISIBLE_LIMIT);
    });

    it('keeps the toggle working after a reveal', async () => {
        const home = renderScreenWithCover(<YourSpendSection />);

        await home.hide();
        await home.reveal();
        pressExpandToggle();

        expect(visibleCardRowCount()).toBe(CARD_ROW_COUNT);
    });
});
