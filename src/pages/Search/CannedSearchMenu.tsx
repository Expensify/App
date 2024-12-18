import {useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ScrollViewProps, TextStyle, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import MenuItem from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import type {MenuItemWithLink} from '@components/MenuItemList';
import {usePersonalDetails} from '@components/OnyxProvider';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import type {SearchQueryJSON} from '@components/Search/types';
import Text from '@components/Text';
import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import * as SearchUIUtils from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import type IconAsset from '@src/types/utils/IconAsset';
import CannedSearchMenuNarrow from './CannedSearchMenuNarrow';
import SavedSearchItemThreeDotMenu from './SavedSearchItemThreeDotMenu';

type SavedSearchMenuItem = MenuItemWithLink & {
    key: string;
    hash: string;
    query: string;
    styles: Array<ViewStyle | TextStyle>;
};

type CannedSearchMenuProps = {
    queryJSON: SearchQueryJSON;
    searchName?: string;
    cannedMenuItems: CannedSearchItem[];
};

type CannedSearchItem = {
    titleTranslationPath: TranslationPaths;
    icon: IconAsset;
    route: Route;
    hash: number | undefined;
};

function CannedSearchMenu({queryJSON, searchName, cannedMenuItems}: CannedSearchMenuProps) {
    const {hash} = queryJSON;
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [shouldShowSavedSearchRenameTooltip] = useOnyx(ONYXKEYS.SHOULD_SHOW_SAVED_SEARCH_RENAME_TOOLTIP);
    const {showDeleteModal, DeleteConfirmModal} = useDeleteSavedSearch();

    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const taxRates = getAllTaxRates();
    const {isOffline} = useNetwork();

    const getOverflowMenu = useCallback(
        (itemName: string, itemHash: number, itemQuery: string) => SearchUIUtils.getOverflowMenu(itemName, itemHash, itemQuery, showDeleteModal),
        [showDeleteModal],
    );

    const createSavedSearchMenuItem = (item: SaveSearchItem, key: string, isNarrow: boolean, index: number) => {
        let title = item.name;
        if (title === item.query) {
            const jsonQuery = SearchQueryUtils.buildSearchQueryJSON(item.query) ?? ({} as SearchQueryJSON);
            title = SearchQueryUtils.buildUserReadableQueryString(jsonQuery, personalDetails, reports, taxRates);
        }

        const baseMenuItem: SavedSearchMenuItem = {
            key,
            title,
            hash: key,
            query: item.query,
            shouldShowRightComponent: true,
            focused: Number(key) === hash,
            onPress: () => {
                SearchActions.clearAllFilters();
                Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: item?.query ?? '', name: item?.name}));
            },
            rightComponent: (
                <SavedSearchItemThreeDotMenu
                    menuItems={getOverflowMenu(title, Number(key), item.query)}
                    isDisabledItem={item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                />
            ),
            styles: [styles.alignItemsCenter],
            pendingAction: item.pendingAction,
            disabled: item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            shouldIconUseAutoWidthStyle: true,
        };

        if (!isNarrow) {
            return {
                ...baseMenuItem,
                shouldRenderTooltip: index === 0 && shouldShowSavedSearchRenameTooltip === true,
                tooltipAnchorAlignment: {
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                },
                tooltipShiftHorizontal: -32,
                tooltipShiftVertical: 15,
                tooltipWrapperStyle: [styles.bgPaleGreen, styles.mh4, styles.pv2],
                onHideTooltip: SearchActions.dismissSavedSearchRenameTooltip,
                renderTooltipContent: () => {
                    return (
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <Expensicons.Lightbulb
                                width={16}
                                height={16}
                                fill={styles.colorGreenSuccess.color}
                            />
                            <Text style={[styles.ml1, styles.quickActionTooltipSubtitle]}>{translate('search.saveSearchTooltipText')}</Text>
                        </View>
                    );
                },
            };
        }

        return baseMenuItem;
    };

    const route = useRoute();
    const scrollViewRef = useRef<RNScrollView>(null);
    const {saveScrollOffset, getScrollOffset} = useContext(ScrollOffsetContext);
    const onScroll = useCallback<NonNullable<ScrollViewProps['onScroll']>>(
        (e) => {
            // If the layout measurement is 0, it means the flashlist is not displayed but the onScroll may be triggered with offset value 0.
            // We should ignore this case.
            if (e.nativeEvent.layoutMeasurement.height === 0) {
                return;
            }
            saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        },
        [route, saveScrollOffset],
    );

    useLayoutEffect(() => {
        const scrollOffset = getScrollOffset(route);
        if (!scrollOffset || !scrollViewRef.current) {
            return;
        }
        scrollViewRef.current.scrollTo({y: scrollOffset, animated: false});
    }, [getScrollOffset, route]);

    const savedSearchesMenuItems = () => {
        if (!savedSearches) {
            return [];
        }
        return Object.entries(savedSearches).map(([key, item], index) => createSavedSearchMenuItem(item, key, shouldUseNarrowLayout, index));
    };

    const renderSavedSearchesSection = useCallback(
        (menuItems: MenuItemWithLink[]) => (
            <View style={[styles.pb4, styles.mh3]}>
                <MenuItemList
                    menuItems={menuItems}
                    wrapperStyle={styles.sectionMenuItem}
                    icon={Expensicons.Bookmark}
                    iconWidth={variables.iconSizeNormal}
                    iconHeight={variables.iconSizeNormal}
                    shouldUseSingleExecution
                />
            </View>
        ),
        [styles],
    );

    const activeCannedItemIndex = cannedMenuItems.findIndex((item) => item.hash === hash);

    if (shouldUseNarrowLayout) {
        const title = searchName ?? (activeCannedItemIndex !== -1 ? undefined : SearchQueryUtils.buildUserReadableQueryString(queryJSON, personalDetails, reports, taxRates));

        return (
            <CannedSearchMenuNarrow
                cannedMenuItems={cannedMenuItems}
                activeItemIndex={activeCannedItemIndex}
                queryJSON={queryJSON}
                title={title}
                savedSearchesMenuItems={savedSearchesMenuItems()}
            />
        );
    }
    const shouldShowSavedSearchesMenuItemTitle = Object.values(savedSearches ?? {}).filter((s) => s.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline).length > 0;

    return (
        <ScrollView
            onScroll={onScroll}
            ref={scrollViewRef}
        >
            <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                {cannedMenuItems.map((item) => {
                    const onPress = singleExecution(() => {
                        SearchActions.clearAllFilters();
                        Navigation.navigate(item.route);
                    });

                    return (
                        <MenuItem
                            key={item.titleTranslationPath}
                            disabled={false}
                            interactive
                            title={translate(item.titleTranslationPath)}
                            icon={item.icon}
                            iconWidth={variables.iconSizeNormal}
                            iconHeight={variables.iconSizeNormal}
                            wrapperStyle={styles.sectionMenuItem}
                            focused={hash === item.hash}
                            onPress={onPress}
                            shouldIconUseAutoWidthStyle
                        />
                    );
                })}
            </View>
            {shouldShowSavedSearchesMenuItemTitle && (
                <>
                    <Text style={[styles.sectionTitle, styles.pb1, styles.mh3, styles.mt3]}>{translate('search.savedSearchesMenuItemTitle')}</Text>
                    {renderSavedSearchesSection(savedSearchesMenuItems())}
                    <DeleteConfirmModal />
                </>
            )}
        </ScrollView>
    );
}

CannedSearchMenu.displayName = 'CannedSearchMenu';

export default CannedSearchMenu;
export type {CannedSearchItem};
