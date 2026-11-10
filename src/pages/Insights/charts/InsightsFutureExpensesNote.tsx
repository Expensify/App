/** Note on Spend over time saying how much spend dated after today the dashboard leaves out, with a link to those expenses on the Spend page. */
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {buildFutureExpensesQueryString} from '@pages/Insights/insightsQueries';

import ROUTES from '@src/ROUTES';
import type {InsightsFutureExpenses} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type InsightsFutureExpensesNoteProps = {
    /** Expenses in the date range dated after `asOfDate`, which the charts leave out */
    futureExpenses: InsightsFutureExpenses;

    /** Last day the charts count expenses through */
    asOfDate: string;

    /** Page-level filters, whose date range and workspaces the Spend page is opened with */
    filters: InsightsFilters;
};

function InsightsFutureExpensesNote({futureExpenses, asOfDate, filters}: InsightsFutureExpensesNoteProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {cardPaddingHorizontal, cardPaddingBottom} = useLayoutSpacing();
    const {convertToDisplayString} = useCurrencyListActions();

    const openFutureExpenses = () => {
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildFutureExpensesQueryString(filters, asOfDate)}));
    };

    return (
        <View style={[cardPaddingHorizontal, cardPaddingBottom]}>
            <Text
                variant="label"
                style={styles.textSupporting}
            >
                {translate('insightsPage.futureExpensesNotShown', convertToDisplayString(futureExpenses.total, futureExpenses.currency))}{' '}
                <TextLink
                    variant="label"
                    onPress={openFutureExpenses}
                >
                    {translate('common.view')}
                </TextLink>
            </Text>
        </View>
    );
}

export default InsightsFutureExpensesNote;
