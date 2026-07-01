import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import {ListFilterHeightContextProvider} from '@components/Search/FilterComponents/ListFilterHeightContext';
import DisplayPopup from '@components/Search/FilterDropdowns/DisplayPopup';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import type {SearchQueryJSON} from '@components/Search/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

type SearchDisplayDropdownButtonProps = {
    queryJSON: SearchQueryJSON;
    searchResults: OnyxEntry<SearchResults>;
    onSort: () => void;
};

function SearchDisplayDropdownButton({queryJSON, searchResults, onSort}: SearchDisplayDropdownButtonProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Gear']);
    const theme = useTheme();
    const styles = useThemeStyles();

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

    if (shouldUseNarrowLayout || isMediumScreenWidth) {
        return (
            <FilterPopupButton
                PopoverComponent={displayPopup}
                popoverAnchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
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
                        <Icon
                            src={expensifyIcons.Gear}
                            fill={theme.icon}
                            small={shouldUseNarrowLayout}
                            extraSmall={isMediumScreenWidth}
                        />
                    </PressableWithFeedback>
                )}
            />
        );
    }

    return (
        <DropdownButton
            label={translate('search.display.label')}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_DISPLAY}
            value={null}
            PopoverComponent={displayPopup}
            popoverAnchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            }}
        />
    );
}

export default SearchDisplayDropdownButton;
