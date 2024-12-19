import React, {useMemo, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {hasWorkspaceWithInvoices} from '@libs/PolicyUtils';
import {hasInvoiceReports} from '@libs/ReportUtils';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import type {SearchQueryJSON} from './types';

type SearchTypeBarProps = {
    queryJSON: SearchQueryJSON;
    onTypeChange?: () => void;
};

type SearchTypeMenuItem = {
    titleTranslationPath: TranslationPaths;
    type: SearchDataTypes;
    icon: IconAsset;
    getRoute: (policyID?: string) => Route;
};

function getTypeMenuItems(shouldAddInvoices: boolean) {
    const typeMenuItems: SearchTypeMenuItem[] = [
        {
            titleTranslationPath: 'common.expenses',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.Receipt,
            getRoute: (policyID?: string) => {
                const query = SearchQueryUtils.buildCannedSearchQuery({policyID});
                return ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: query.queryString});
            },
        },
        {
            titleTranslationPath: 'common.chats',
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            icon: Expensicons.ChatBubbles,
            getRoute: (policyID?: string) => {
                const query = SearchQueryUtils.buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.CHAT, status: CONST.SEARCH.STATUS.CHAT.ALL, policyID});
                return ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: query.queryString});
            },
        },
    ];

    if (shouldAddInvoices) {
        typeMenuItems.push({
            titleTranslationPath: 'workspace.common.invoices',
            type: CONST.SEARCH.DATA_TYPES.INVOICE,
            icon: Expensicons.InvoiceGeneric,
            getRoute: (policyID?: string) => {
                const query = SearchQueryUtils.buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.INVOICE, status: CONST.SEARCH.STATUS.INVOICE.ALL, policyID});
                return ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: query.queryString});
            },
        });
    }
    typeMenuItems.push({
        titleTranslationPath: 'travel.trips',
        type: CONST.SEARCH.DATA_TYPES.TRIP,
        icon: Expensicons.Suitcase,
        getRoute: (policyID?: string) => {
            const query = SearchQueryUtils.buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.TRIP, status: CONST.SEARCH.STATUS.TRIP.ALL, policyID});
            return ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: query.queryString});
        },
    });
    return typeMenuItems;
}

function SearchTypeBar({queryJSON, onTypeChange}: SearchTypeBarProps) {
    const {singleExecution} = useSingleExecution();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const scrollRef = useRef<RNScrollView>(null);
    const isScrolledRef = useRef(false);

    const [session] = useOnyx(ONYXKEYS.SESSION);

    const typeMenuItems: SearchTypeMenuItem[] = useMemo(() => getTypeMenuItems(hasWorkspaceWithInvoices(session?.email) || hasInvoiceReports()), [session?.email]);

    const activeItemIndex = typeMenuItems.findIndex((item) => item.type === queryJSON.type);

    return (
        <ScrollView
            style={[styles.flexRow, styles.mb2, styles.overflowScroll, styles.flexGrow0]}
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
        >
            {typeMenuItems.map((item, index) => {
                const isActive = index === activeItemIndex;
                const isFirstItem = index === 0;
                const isLastItem = index === typeMenuItems.length - 1;
                const onPress = singleExecution(() => {
                    onTypeChange?.();
                    SearchActions.clearAllFilters();
                    Navigation.navigate(item.getRoute(queryJSON.policyID));
                });

                return (
                    <Button
                        key={translate(item.titleTranslationPath)}
                        onLayout={(e) => {
                            if (!isActive || isScrolledRef.current || !('left' in e.nativeEvent.layout)) {
                                return;
                            }
                            isScrolledRef.current = true;
                            scrollRef.current?.scrollTo({x: (e.nativeEvent.layout.left as number) - styles.pl5.paddingLeft});
                        }}
                        text={translate(item.titleTranslationPath)}
                        onPress={onPress}
                        icon={item.icon}
                        iconFill={isActive ? theme.success : undefined}
                        iconHoverFill={theme.success}
                        innerStyles={!isActive && styles.bgTransparent}
                        hoverStyles={StyleUtils.getBackgroundColorStyle(!isActive ? theme.highlightBG : theme.border)}
                        textStyles={!isActive && StyleUtils.getTextColorStyle(theme.textSupporting)}
                        textHoverStyles={StyleUtils.getTextColorStyle(theme.text)}
                        // We add padding to the first and last items so that they align with the header and table but can overflow outside the screen when scrolled.
                        style={[isFirstItem && styles.pl5, isLastItem && styles.pr5]}
                    />
                );
            })}
        </ScrollView>
    );
}

SearchTypeBar.displayName = 'SearchTypeBar';

export default SearchTypeBar;
