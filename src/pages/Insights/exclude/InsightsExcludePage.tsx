/**
 * Panel, opened in the RHP, where the user picks the items to leave out of one Insights ranking chart.
 * It lists every item with data for the dashboard's filters, ranked the way the chart ranks them, so an item can be excluded before it moves up.
 */
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ActionButtons from '@components/Search/FilterDropdowns/ActionButtons';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import Text from '@components/Text';

import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import {saveInsightsExclusions} from '@libs/actions/Insights';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {InsightsDetailsParamList} from '@libs/Navigation/types';
import tokenizedSearch from '@libs/tokenizedSearch';

import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import {getExclusionsSearchKey} from '@pages/Insights/insightsExclusions';
import useAccessibleDashboards from '@pages/Insights/useAccessibleDashboards';
import useInsightsExclusions from '@pages/Insights/useInsightsExclusions';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {InsightsDashboardID} from '@src/types/onyx';

import React, {useState} from 'react';

import type {InsightsExcludeChart, InsightsExcludeListItem} from './useInsightsExcludeItems';

import useInsightsExcludeItems from './useInsightsExcludeItems';

type InsightsExcludePageProps = PlatformStackScreenProps<InsightsDetailsParamList, typeof SCREENS.INSIGHTS_EXCLUDE>;

type InsightsExcludeListProps = {
    dashboardID: InsightsDashboardID;
    chart: InsightsExcludeChart;
};

function InsightsExcludeList({dashboardID, chart}: InsightsExcludeListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const savedItemKeys = useInsightsExclusions(chart.graphKey);
    // Undefined until the user changes something, so the selection follows the saved exclusions once they load
    const [selectionOverride, setSelectionOverride] = useState<string[]>();
    const selectedItemKeys = selectionOverride ?? savedItemKeys;
    const initialSelectedItemKeys = useInitialSelection(savedItemKeys, {resetOnFocus: true});
    const items = useInsightsExcludeItems({dashboardID, chart, selectedItemKeys, initialSelectedItemKeys});

    const filterItem = (item: InsightsExcludeListItem, searchInput: string) => tokenizedSearch([item], searchInput, (listItem) => [listItem.text ?? '']).length > 0;
    const [inputValue, setInputValue, filteredItems] = useSearchResults(items, filterItem);

    const toggleItem = (item: InsightsExcludeListItem) => {
        setSelectionOverride((previous) => {
            const selection = previous ?? savedItemKeys;
            return selection.includes(item.value) ? selection.filter((key) => key !== item.value) : [...selection, item.value];
        });
    };

    const applyExclusions = () => {
        const hasChanges = selectedItemKeys.length !== savedItemKeys.length || selectedItemKeys.some((key) => !savedItemKeys.includes(key));
        if (hasChanges) {
            saveInsightsExclusions(getExclusionsSearchKey(chart.graphKey), selectedItemKeys);
        }
        Navigation.goBack();
    };

    return (
        <>
            <Text style={[styles.ph5, styles.pb3, styles.textSupporting]}>{translate(`insightsPage.exclude.subtitle.${chart.rankedItems}`)}</Text>
            <SelectionList
                canSelectMultiple
                shouldUpdateFocusedIndex
                ListItem={MultiSelectListItem}
                data={filteredItems}
                selectedItems={selectedItemKeys}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                onSelectRow={toggleItem}
                onSelectionButtonPress={toggleItem}
                textInputOptions={{
                    value: inputValue,
                    label: translate('common.search'),
                    onChangeText: setInputValue,
                    headerMessage: inputValue && filteredItems.length === 0 ? translate('common.noResultsFound') : undefined,
                }}
                footerContent={
                    <ActionButtons
                        containerStyle={[styles.flexRow, styles.gap3]}
                        resetSentryLabel={CONST.SENTRY_LABEL.INSIGHTS.EXCLUDE_RESET}
                        applySentryLabel={CONST.SENTRY_LABEL.INSIGHTS.EXCLUDE_APPLY}
                        shouldSubmitOnEnter
                        onReset={() => setSelectionOverride([])}
                        onApply={applyExclusions}
                    />
                }
            />
        </>
    );
}

function InsightsExcludePage({route}: InsightsExcludePageProps) {
    const {translate} = useLocalize();
    const [accessibleDashboards] = useAccessibleDashboards();
    const dashboardID = Object.values(CONST.INSIGHTS.DASHBOARD).find((id) => id === route.params.dashboardID);
    const chart = dashboardID
        ? INSIGHTS_DASHBOARD_SPECS[dashboardID].supportingCharts.find((spec): spec is InsightsExcludeChart => spec.graphKey === route.params.graphKey && !!spec.rankedItems)
        : undefined;
    // The dashboards are unknown until the workspaces load, so the panel isn't hidden before then
    const isAccessible = !!dashboardID && (!accessibleDashboards || accessibleDashboards.includes(dashboardID));

    if (!dashboardID || !chart || !isAccessible) {
        return (
            <ScreenWrapper testID="InsightsExcludePage">
                <FullPageNotFoundView shouldShow />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            testID="InsightsExcludePage"
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButtonAndTitle
                title={translate('insightsPage.exclude.title')}
                subtitle={translate(chart.titleKey)}
            />
            <InsightsExcludeList
                dashboardID={dashboardID}
                chart={chart}
            />
        </ScreenWrapper>
    );
}

export default InsightsExcludePage;
