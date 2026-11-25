import VictoryTheme from '@components/Charts/VictoryTheme';

import getInsightsItemColor from '@pages/Insights/details/getInsightsItemColor';

import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: the groups only carry the fields the rank is read from
const MERCHANT_DATA = {
    [`${CONST.SEARCH.GROUP_PREFIX}Amazon`]: {merchant: 'Amazon', total: 1000, count: 1},
    [`${CONST.SEARCH.GROUP_PREFIX}Delta`]: {merchant: 'Delta', total: 5000, count: 2},
    [`${CONST.SEARCH.GROUP_PREFIX}Uber`]: {merchant: 'Uber', total: 3000, count: 4},
} as unknown as SearchResults['data'];

describe('getInsightsItemColor', () => {
    it('colors the item by its rank by total, like the ranking graph', () => {
        // Given a chart with three merchants, Uber having the second largest total
        // When the color of Uber's Details panel is looked up
        const color = getInsightsItemColor(MERCHANT_DATA, CONST.SEARCH.GROUP_BY.MERCHANT, CONST.SEARCH.VIEW.BAR, undefined, 'Uber');

        // Then it is the second color of the palette, the one its bar is drawn in
        expect(color).toBe(VictoryTheme.colors.getColor(1));
    });

    it('colors a donut slice by its size, leaving out slices too small to draw', () => {
        // Given a donut of categories where Travel is mostly refunds and Office is too small to draw
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: the groups only carry the fields the rank is read from
        const data = {
            [`${CONST.SEARCH.GROUP_PREFIX}Meals`]: {category: 'Meals', total: 3000, count: 3},
            [`${CONST.SEARCH.GROUP_PREFIX}Travel`]: {category: 'Travel', total: -5000, count: 2},
            [`${CONST.SEARCH.GROUP_PREFIX}Office`]: {category: 'Office', total: 1, count: 1},
        } as unknown as SearchResults['data'];

        // When the colors of Travel's and Office's panels are looked up
        const travelColor = getInsightsItemColor(data, CONST.SEARCH.GROUP_BY.CATEGORY, CONST.SEARCH.VIEW.PIE, undefined, 'Travel');
        const officeColor = getInsightsItemColor(data, CONST.SEARCH.GROUP_BY.CATEGORY, CONST.SEARCH.VIEW.PIE, undefined, 'Office');

        // Then Travel takes the first color as the largest slice, and Office, which the donut leaves out, the default one
        expect(travelColor).toBe(VictoryTheme.colors.getColor(0));
        expect(officeColor).toBe(VictoryTheme.colors.default);
    });

    it('ranks only the groups the chart plots, leaving out the ones past its limit', () => {
        // Given a donut capped at three categories, and a fourth one with a refund larger than any of them, which the chart drops for having the lowest total
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: the groups only carry the fields the rank is read from
        const data = {
            [`${CONST.SEARCH.GROUP_PREFIX}Meals`]: {category: 'Meals', total: 3000, count: 3},
            [`${CONST.SEARCH.GROUP_PREFIX}Office`]: {category: 'Office', total: 2000, count: 2},
            [`${CONST.SEARCH.GROUP_PREFIX}Travel`]: {category: 'Travel', total: 1000, count: 1},
            [`${CONST.SEARCH.GROUP_PREFIX}Refunds`]: {category: 'Refunds', total: -9000, count: 1},
        } as unknown as SearchResults['data'];

        // When the color of Travel's panel is looked up
        const color = getInsightsItemColor(data, CONST.SEARCH.GROUP_BY.CATEGORY, CONST.SEARCH.VIEW.PIE, 3, 'Travel');

        // Then it is the third color, as Travel is the third slice the chart draws, rather than pushed down by the refund it doesn't draw
        expect(color).toBe(VictoryTheme.colors.getColor(2));
    });

    it('falls back to the default color for an item the chart does not list', () => {
        // Given a merchant missing from the chart, e.g. opened from a link to a different Date range
        // When its color is looked up
        const color = getInsightsItemColor(MERCHANT_DATA, CONST.SEARCH.GROUP_BY.MERCHANT, CONST.SEARCH.VIEW.BAR, undefined, 'Lyft');

        // Then the default chart color is used rather than another item's color
        expect(color).toBe(VictoryTheme.colors.default);
    });
});
