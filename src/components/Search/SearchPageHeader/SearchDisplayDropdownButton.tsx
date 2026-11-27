import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import {ListFilterHeightContextProvider} from '@components/Search/FilterComponents/ListFilterHeightContext';
import DisplayPopup from '@components/Search/FilterDropdowns/DisplayPopup';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getChangedDisplayOptionsCount} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import getSearchHeaderIconSize from './getSearchHeaderIconSize';

type SearchDisplayDropdownButtonProps = {
    queryJSON: SearchQueryJSON;
    searchResults: OnyxEntry<SearchResults>;
    onSort: () => void;
};

const DISPLAY_POPOVER_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
} as const;

function SearchDisplayDropdownButton({queryJSON, searchResults, onSort}: SearchDisplayDropdownButtonProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Eye']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {currentDefaultSearchQueryJSON} = useSearchQueryContext();

    if (queryJSON.type === CONST.SEARCH.DATA_TYPES.CHAT) {
        return null;
    }

    const displayPopup = ({closeOverlay}: {closeOverlay: () => void}) => (
        <ListFilterHeightContextProvider>
            <DisplayPopup
                queryJSON={queryJSON}
                searchResults={searchResults}
                closeOverlay={closeOverlay}
                onSort={onSort}
            />
        </ListFilterHeightContextProvider>
    );

    const changedDisplayOptionsCount = getChangedDisplayOptionsCount(queryJSON, currentDefaultSearchQueryJSON);

    if (shouldUseNarrowLayout || isMediumScreenWidth) {
        const iconSize = getSearchHeaderIconSize(isMediumScreenWidth, shouldUseNarrowLayout);

        return (
            <FilterPopupButton
                PopoverComponent={displayPopup}
                popoverAnchorAlignment={DISPLAY_POPOVER_ANCHOR_ALIGNMENT}
                renderButton={({ref, onPress}) => (
                    <PressableWithFeedback
                        ref={ref}
                        accessibilityLabel={translate('search.display.label')}
                        role={CONST.ROLE.BUTTON}
                        style={[styles.searchActionsBar(shouldUseNarrowLayout)]}
                        hoverStyle={styles.buttonHoveredBG}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_DISPLAY}
                        onPress={onPress}
                    >
                        <View>
                            <Icon
                                src={expensifyIcons.Eye}
                                fill={theme.icon}
                                size={iconSize}
                            />
                            {changedDisplayOptionsCount > 0 && (
                                <View
                                    testID="SearchDisplayChangedIndicator"
                                    style={[
                                        styles.statusIndicator,
                                        isMediumScreenWidth ? styles.searchDisplayIndicatorSmall : styles.searchDisplayIndicator,
                                        styles.statusIndicatorColor(theme.success),
                                        !shouldUseNarrowLayout && StyleUtils.getBorderColorStyle(theme.buttonDefaultBG),
                                    ]}
                                />
                            )}
                        </View>
                    </PressableWithFeedback>
                )}
            />
        );
    }

    return (
        <DropdownButton
            label={translate('search.display.labelWithCount', {count: changedDisplayOptionsCount})}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_DISPLAY}
            value={null}
            PopoverComponent={displayPopup}
            popoverAnchorAlignment={DISPLAY_POPOVER_ANCHOR_ALIGNMENT}
        />
    );
}

export default SearchDisplayDropdownButton;
