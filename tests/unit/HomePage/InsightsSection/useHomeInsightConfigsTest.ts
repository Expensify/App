import {renderHook, waitFor} from '@testing-library/react-native';

import useHomeInsightConfigs from '@pages/home/InsightsSection/useHomeInsightConfigs';
import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import DEFAULT_INSIGHTS_FILTERS from '@pages/Insights/insightsFilters';
import {buildInsightsQueryString} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

const SPEND_SEARCH_KEY = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND].searchKey;

describe('useHomeInsightConfigs', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('reports the default date preset when no Insights filters are saved', async () => {
        // Given a user who has never changed the Insights Date filter
        await Onyx.merge(ONYXKEYS.SEARCH_FILTERS, {});
        await waitForBatchedUpdates();

        // When Home resolves its insights
        const {result} = renderHook(() => useHomeInsightConfigs());
        await waitFor(() => expect(result.current.isResolved).toBe(true));

        // Then the widget's subtitle names the default range the charts already query
        expect(result.current.date).toEqual(DEFAULT_INSIGHTS_FILTERS.date);
    });

    it('reports the date saved on the Insights page', async () => {
        // Given a Spend dashboard saved on a custom range
        const date = {from: '2026-09-01', to: '2026-10-15'};
        await Onyx.merge(ONYXKEYS.SEARCH_FILTERS, {
            [SPEND_SEARCH_KEY]: {query: buildInsightsQueryString({...DEFAULT_INSIGHTS_FILTERS, date, groupCurrency: CONST.CURRENCY.USD})},
        });
        await waitForBatchedUpdates();

        // When Home resolves its insights
        const {result} = renderHook(() => useHomeInsightConfigs());
        await waitFor(() => expect(result.current.isResolved).toBe(true));

        // Then the widget's subtitle names the saved range, since Home's charts share it
        expect(result.current.date).toEqual(date);
    });
});
