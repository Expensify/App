import React, {useMemo} from 'react';
import {FlatList, View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import SearchFiltersBar from '@components/Search/SearchPageHeader/SearchFiltersBar';
import SearchPageHeader from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {SearchQueryJSON} from '@components/Search/types';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {shouldShowPolicy} from '@libs/PolicyUtils';
import {getSuggestedSearches} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import SearchPageTabSelector, {SearchPageTabSelectorContent} from './SearchPageTabSelector';

// ---------------------------------------------------------------------------
// Static (hook-free visual) versions of each component
// ---------------------------------------------------------------------------

const suggestedSearches = getSuggestedSearches();
const reportsSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.REPORTS];
const expensesSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.EXPENSES];
const chatsSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.CHATS];
const submitSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.SUBMIT];

function getActiveKey(similarSearchHash: number, hasPaidGroupPolicy: boolean): string {
    const candidates = [reportsSearch, expensesSearch, chatsSearch, ...(hasPaidGroupPolicy ? [submitSearch] : [])];
    return candidates.find((entry) => similarSearchHash === entry.similarSearchHash)?.key ?? reportsSearch.key;
}

function StaticTabSelector({queryJSON}: {queryJSON: SearchQueryJSON}) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Receipt', 'Document', 'ChatBubbles', 'Send'] as const);
    const [policyInfo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: staticPolicyInfoSelector});
    const hasPaidGroupPolicy = policyInfo?.hasPaidGroupPolicy ?? false;

    const tabs: TabSelectorBaseItem[] = useMemo(() => {
        const result: TabSelectorBaseItem[] = [
            {key: reportsSearch.key, icon: expensifyIcons.Document, title: translate(reportsSearch.translationPath)},
            {key: expensesSearch.key, icon: expensifyIcons.Receipt, title: translate(expensesSearch.translationPath)},
            {key: chatsSearch.key, icon: expensifyIcons.ChatBubbles, title: translate(chatsSearch.translationPath)},
        ];

        if (hasPaidGroupPolicy) {
            result.push({key: submitSearch.key, icon: expensifyIcons.Send, title: translate(submitSearch.translationPath)});
        }

        return result;
    }, [expensifyIcons, translate, hasPaidGroupPolicy]);

    const activeKey = useMemo(() => getActiveKey(queryJSON.similarSearchHash, hasPaidGroupPolicy), [queryJSON.similarSearchHash, hasPaidGroupPolicy]);

    return (
        <SearchPageTabSelectorContent
            tabs={tabs}
            activeTabKey={activeKey}
        />
    );
}

function StaticSearchPageHeader() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    return (
        <View
            dataSet={{dragArea: false}}
            style={[styles.flex1]}
        >
            <View style={[styles.appBG, styles.flex1]}>
                <View style={[styles.flexRow, styles.mh5, styles.mb3, styles.alignItemsCenter, styles.justifyContentCenter, {height: variables.searchTopBarHeight}]}>
                    <View style={[styles.flex1, styles.zIndex10]}>
                        <View style={[styles.searchRouterTextInputContainer, styles.searchAutocompleteInputResults, styles.br2, styles.justifyContentCenter]}>
                            <Text
                                style={[styles.pl1, {color: theme.textSupporting}]}
                                numberOfLines={1}
                            >
                                {translate('search.searchPlaceholder')}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

function StaticDropdownChip({label}: {label: string}) {
    const styles = useThemeStyles();

    return (
        <Button
            small
            isDisabled
            shouldStayNormalOnDisable
        >
            <CaretWrapper
                style={[styles.flex1, styles.mw100]}
                caretWidth={variables.iconSizeExtraSmall}
                caretHeight={variables.iconSizeExtraSmall}
                isActive={false}
            >
                <Text
                    numberOfLines={1}
                    style={[styles.textMicroBold, styles.flexShrink1]}
                >
                    {label}
                </Text>
            </CaretWrapper>
        </Button>
    );
}

type StaticPolicyInfo = {
    hasMultipleWorkspaces: boolean;
    hasPaidGroupPolicy: boolean;
};

function staticPolicyInfoSelector(policies: OnyxCollection<Policy>): StaticPolicyInfo {
    let workspaceCount = 0;
    let hasPaidGroupPolicy = false;

    for (const policy of Object.values(policies ?? {})) {
        if (!policy) {
            continue;
        }
        if (!policy.isJoinRequestPending && shouldShowPolicy(policy, false, undefined)) {
            workspaceCount++;
        }
        if (policy.type === CONST.POLICY.TYPE.TEAM || policy.type === CONST.POLICY.TYPE.CORPORATE) {
            hasPaidGroupPolicy = true;
        }
        if (workspaceCount > 1 && hasPaidGroupPolicy) {
            break;
        }
    }

    return {hasMultipleWorkspaces: workspaceCount > 1, hasPaidGroupPolicy};
}

/**
 * In the submit-and-navigate flow we only ever land on `type:expense` or `type:invoice`
 * with default status and no extra filters, so the chips are mostly hardcoded.
 * The only conditional chip is "Workspaces" (shown when the user has >1 workspace),
 * resolved via a cheap boolean Onyx selector.
 */
function StaticFiltersBar({queryJSON}: {queryJSON: SearchQueryJSON}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Filter'] as const);
    const [policyInfo] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: staticPolicyInfoSelector});
    const hasMultipleWorkspaces = policyInfo?.hasMultipleWorkspaces ?? false;

    const typeLabel = queryJSON.type === CONST.SEARCH.DATA_TYPES.INVOICE ? translate('common.invoice') : translate('common.expense');

    const chips = useMemo(
        () => [
            {key: 'type', label: `${translate('common.type')}: ${typeLabel}`},
            {key: 'status', label: translate('common.status')},
            {key: 'date', label: translate('common.date')},
            {key: 'from', label: translate('common.from')},
            ...(hasMultipleWorkspaces ? [{key: 'workspace', label: translate('workspace.common.workspace')}] : []),
        ],
        [translate, typeLabel, hasMultipleWorkspaces],
    );

    return (
        <View style={[styles.mb2, styles.searchFiltersBarContainer]}>
            <FlatList
                horizontal
                style={[styles.flexRow, styles.overflowScroll, styles.flexGrow0]}
                contentContainerStyle={[styles.flexRow, styles.flexGrow0, styles.gap2, styles.ph5]}
                showsHorizontalScrollIndicator={false}
                data={chips}
                keyExtractor={(item) => item.key}
                renderItem={({item}) => <StaticDropdownChip label={item.label} />}
                ListFooterComponent={
                    <Button
                        link
                        small
                        shouldUseDefaultHover={false}
                        text={translate('search.filtersHeader')}
                        iconFill={theme.link}
                        iconHoverFill={theme.linkHover}
                        icon={expensifyIcons.Filter}
                        textStyles={[styles.textMicroBold]}
                        isDisabled
                        shouldStayNormalOnDisable
                    />
                }
            />
        </View>
    );
}

// ---------------------------------------------------------------------------
// Memoized wrappers: zero hooks, just conditional render based on showStatic
// ---------------------------------------------------------------------------

type SearchPageTabSelectorProps = {
    queryJSON?: SearchQueryJSON;
    onTabPress?: () => void;
};

type SearchPageHeaderProps = {
    queryJSON: SearchQueryJSON;
    searchRouterListVisible?: boolean;
    hideSearchRouterList?: () => void;
    onSearchRouterFocus?: () => void;
    handleSearch: (value: string) => void;
    isMobileSelectionModeEnabled: boolean;
    skipInputSkeleton?: boolean;
};

type SearchFiltersBarProps = {
    queryJSON: SearchQueryJSON;
    isMobileSelectionModeEnabled: boolean;
};

const TabSelectorSwitch = React.memo(({showStatic, ...props}: SearchPageTabSelectorProps & {showStatic: boolean}) => {
    if (showStatic) {
        return props.queryJSON ? <StaticTabSelector queryJSON={props.queryJSON} /> : null;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading -- thin wrapper forwarding exact SearchPageTabSelectorProps
    return <SearchPageTabSelector {...props} />;
});
TabSelectorSwitch.displayName = 'TabSelectorSwitch';

const SearchPageHeaderSwitch = React.memo(({showStatic, ...props}: SearchPageHeaderProps & {showStatic: boolean}) => {
    if (showStatic) {
        return <StaticSearchPageHeader />;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading -- thin wrapper forwarding exact SearchPageHeaderProps
    return <SearchPageHeader {...props} />;
});
SearchPageHeaderSwitch.displayName = 'SearchPageHeaderSwitch';

const FiltersBarSwitch = React.memo(({showStatic, ...props}: SearchFiltersBarProps & {showStatic: boolean}) => {
    if (showStatic) {
        return <StaticFiltersBar queryJSON={props.queryJSON} />;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading -- thin wrapper forwarding exact SearchFiltersBarProps
    return <SearchFiltersBar {...props} />;
});
FiltersBarSwitch.displayName = 'FiltersBarSwitch';

export {TabSelectorSwitch, SearchPageHeaderSwitch, FiltersBarSwitch};
