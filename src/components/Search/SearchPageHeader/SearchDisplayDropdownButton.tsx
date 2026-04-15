import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import DisplayPopup from '@components/Search/FilterDropdowns/DisplayPopup';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
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

    return (
        <DropdownButton
            label={translate('search.display.label')}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_DISPLAY}
            value={null}
            PopoverComponent={({closeOverlay}) => (
                <DisplayPopup
                    queryJSON={queryJSON}
                    searchResults={searchResults}
                    closeOverlay={closeOverlay}
                    onSort={onSort}
                />
            )}
        >
            {shouldUseNarrowLayout || isMediumScreenWidth
                ? (triggerRef, onPress) => (
                      <PressableWithFeedback
                          ref={triggerRef}
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
                  )
                : undefined}
        </DropdownButton>
    );
}

export default SearchDisplayDropdownButton;
