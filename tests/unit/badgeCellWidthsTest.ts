import {renderHook} from '@testing-library/react-native';

import {getBadgeColumnDragMinWidth, getBadgeWidth} from '@components/Table/badgeCellWidths';

import useThemeStyles from '@hooks/useThemeStyles';

import measureMicroStrongTextWidth from '@libs/measureTextWidth/measureMicroStrongTextWidth';

import CONST from '@src/CONST';

jest.mock('@libs/measureTextWidth/measureMicroStrongTextWidth', () => jest.fn());

const mockMeasureMicroStrongTextWidth = jest.mocked(measureMicroStrongTextWidth);
const styles = renderHook(() => useThemeStyles()).result.current;

// The gap before the badge, its horizontal padding and its border, around the label.
const BADGE_CHROME_WIDTH = styles.gap2.gap + styles.defaultBadge.paddingHorizontal * 2 + styles.defaultBadge.borderWidth * 2;

describe('badgeCellWidths', () => {
    describe('getBadgeWidth', () => {
        it('adds the gap, padding and border around the measured label', () => {
            // Given a platform that measures the label 40px wide
            mockMeasureMicroStrongTextWidth.mockReturnValue(40);

            // When the badge width is computed
            const width = getBadgeWidth(styles, 'Default');

            // Then it covers everything the badge draws around the label, since a badge never truncates
            expect(width).toBe(BADGE_CHROME_WIDTH + 40);
        });

        it('adds the width of an icon leading the label', () => {
            // Given a badge whose label is measured 40px wide and that leads with a 14px icon
            mockMeasureMicroStrongTextWidth.mockReturnValue(40);

            // When the badge width is computed with the icon
            const width = getBadgeWidth(styles, 'Requested', 14);

            // Then the icon is part of the badge, so the column keeps room for it too
            expect(width).toBe(BADGE_CHROME_WIDTH + 14 + 40);
        });

        it('is 0 when the platform cannot measure text', () => {
            // Given a platform with no text measurement, such as native
            mockMeasureMicroStrongTextWidth.mockReturnValue(null);

            // When the badge width is computed
            const width = getBadgeWidth(styles, 'Default', 14);

            // Then it is 0, because no column is sized from its content there and a partial width would be wrong
            expect(width).toBe(0);
        });
    });

    describe('getBadgeColumnDragMinWidth', () => {
        it('is undefined when no row shows a badge', () => {
            // Given a table where no row shows a badge
            // When the drag minimum is computed
            const minWidth = getBadgeColumnDragMinWidth([], 40);

            // Then there is none, so the column keeps the usual drag bound instead of one sized for a badge nobody sees
            expect(minWidth).toBeUndefined();
        });

        it('keeps room for the leading content and the widest shown badge, rounded up to a whole px', () => {
            // Given rows showing badges of different widths, after 40px of leading content
            // When the drag minimum is computed
            const minWidth = getBadgeColumnDragMinWidth([60.2, 85.4], 40);

            // Then it fits the widest badge whole, since only the text before it may truncate
            expect(minWidth).toBe(126);
        });

        it('never drops below the usual drag bound when the badge is small', () => {
            // Given a badge that, with the content before it, is narrower than the usual drag bound
            // When the drag minimum is computed
            const minWidth = getBadgeColumnDragMinWidth([24], 10);

            // Then it stays at the usual bound, because it replaces that bound, and a column with a badge shouldn't drag
            // narrower than the same column without one
            expect(minWidth).toBe(CONST.TABLES.COLUMN_RESIZE.MIN_WIDTH);
        });
    });
});
