/** Note on Spend over time saying how much spend dated after today the dashboard leaves out, with a link to those expenses on the Spend page. */
import TextLink from '@components/TextLink';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {buildFutureExpensesQueryString} from '@pages/Insights/insightsQueries';

import ROUTES from '@src/ROUTES';
import type {InsightsFutureExpenses} from '@src/types/onyx';

import React from 'react';

import InsightsChartNote from './InsightsChartNote';

type InsightsFutureExpensesNoteProps = {
    /** Expenses in the date range dated after `asOfDate`, which the charts leave out */
    futureExpenses: InsightsFutureExpenses;

    /** Last day the charts count expenses through */
    asOfDate: string;

    /** Page-level filters, whose date range and workspaces the Spend page is opened with */
    filters: InsightsFilters;
};

function InsightsFutureExpensesNote({futureExpenses, asOfDate, filters}: InsightsFutureExpensesNoteProps) {
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const openFutureExpenses = () => {
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildFutureExpensesQueryString(filters, asOfDate)}));
    };

    return (
        <InsightsChartNote>
            {translate('insightsPage.futureExpensesNotShown', convertToDisplayString(futureExpenses.total, futureExpenses.currency))}{' '}
            <TextLink
                variant="label"
                onPress={openFutureExpenses}
            >
                {translate('common.view')}
            </TextLink>
        </InsightsChartNote>
    );
}

export default InsightsFutureExpensesNote;
