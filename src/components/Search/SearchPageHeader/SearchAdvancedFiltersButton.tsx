import React, {useEffect, useRef} from 'react';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import type {ButtonComponentProps, FilterPopupButtonHandle, PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import SearchAdvancedFiltersPopup from '@components/Search/FilterDropdowns/SearchAdvancedFiltersPopup';
import type {SearchQueryJSON} from '@components/Search/types';
import useFilterFormValues from '@hooks/useFilterFormValues';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchFilterSync from '@hooks/useSearchFilterSync';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {cancelSavedViewEdits, clearSavedViewEditMode, consumePendingOpenEditFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type SearchAdvancedFiltersButtonProp = {
    queryJSON: SearchQueryJSON;
};

function SearchAdvancedFiltersButton({queryJSON}: SearchAdvancedFiltersButtonProp) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- advanced filters page is only rendered on the small screen
    const {isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Filter']);
    const filterFormValues = useFilterFormValues(queryJSON);
    useSearchFilterSync(queryJSON, filterFormValues);
    const [editingSavedView] = useOnyx(ONYXKEYS.RAM_ONLY_SEARCH_EDITING_SAVED_VIEW);
    const isEditingSavedView = !!editingSavedView;

    // Compare parse-to-parse: the stored saved-search key can drift from today's parser output, which would keep "Edit filters" from ever opening.
    const editedViewQueryHash = editingSavedView ? buildSearchQueryJSON(editingSavedView.query)?.hash : undefined;
    const isEditedViewActive = editedViewQueryHash !== undefined && queryJSON.hash === editedViewQueryHash;

    // Click-outside/Escape/Cancel all revert the edits via onOverlayClose; the Save buttons set this ref to opt out.
    const skipRevertOnCloseRef = useRef(false);
    const filterPopupRef = useRef<FilterPopupButtonHandle | null>(null);

    // Each "Edit filters" click leaves ONE consumable open request; open the filters UI (popover on wide, fullscreen
    // route on small screens) once the edited view's search is active so the form holds its filters. Consuming the
    // request makes it one-shot — nothing can replay the open on remounts, browser back or stale Onyx emissions.
    useEffect(() => {
        if (!isEditedViewActive || !consumePendingOpenEditFilters()) {
            return;
        }
        if (isSmallScreenWidth) {
            Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS);
            return;
        }
        filterPopupRef.current?.open();
    }, [isEditedViewActive, isSmallScreenWidth]);

    if (isSmallScreenWidth) {
        return (
            <PressableWithFeedback
                accessibilityLabel={translate('search.filtersHeader')}
                role={CONST.ROLE.BUTTON}
                style={[styles.searchActionsBar(true)]}
                hoverStyle={styles.buttonHoveredBG}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.ADVANCED_FILTERS_BUTTON}
                onPress={() => Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS)}
            >
                <Icon
                    src={expensifyIcons.Filter}
                    fill={theme.icon}
                    small
                />
            </PressableWithFeedback>
        );
    }

    const filterButton = isMediumScreenWidth
        ? ({onPress, ref}: ButtonComponentProps) => (
              <PressableWithFeedback
                  ref={ref}
                  accessibilityLabel={translate('search.filtersHeader')}
                  role={CONST.ROLE.BUTTON}
                  style={[styles.searchActionsBar(false)]}
                  hoverStyle={styles.buttonHoveredBG}
                  sentryLabel={CONST.SENTRY_LABEL.SEARCH.ADVANCED_FILTERS_BUTTON}
                  onPress={onPress}
              >
                  <Icon
                      src={expensifyIcons.Filter}
                      fill={theme.icon}
                      extraSmall
                  />
              </PressableWithFeedback>
          )
        : ({onPress, ref, isExpanded}: ButtonComponentProps) => (
              <Button
                  ref={ref}
                  small
                  accessibilityLabel={translate('search.filtersHeader')}
                  text={translate('search.filtersHeader')}
                  icon={expensifyIcons.Filter}
                  onPress={onPress}
                  innerStyles={isExpanded ? styles.buttonDefaultHovered : undefined}
                  sentryLabel={CONST.SENTRY_LABEL.SEARCH.ADVANCED_FILTERS_BUTTON}
              />
          );

    const filtersPopup = ({closeOverlay}: PopoverComponentProps) => (
        <SearchAdvancedFiltersPopup
            queryJSON={queryJSON}
            editingSavedView={editingSavedView}
            closeOverlay={closeOverlay}
            preventRevertOnClose={() => {
                skipRevertOnCloseRef.current = true;
            }}
        />
    );

    return (
        <FilterPopupButton
            PopoverComponent={filtersPopup}
            popoverWidth={CONST.ADVANCED_FILTERS_POPOVER_WIDTH}
            popoverAnchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            }}
            renderButton={filterButton}
            handleRef={filterPopupRef}
            // Close when browser back/forward actually changed the search (an in-app RHP pop keeps the same query).
            shouldCloseOnBrowserNavigation={() => getCurrentSearchQueryJSON()?.hash !== queryJSON.hash}
            onOverlayClose={
                isEditingSavedView
                    ? (reason) => {
                          if (skipRevertOnCloseRef.current) {
                              skipRevertOnCloseRef.current = false;
                              return;
                          }
                          if (!editingSavedView) {
                              return;
                          }
                          // Browser back means the user is leaving — drop edit mode without navigating back to the view.
                          if (reason === 'browserBack') {
                              clearSavedViewEditMode();
                              return;
                          }
                          cancelSavedViewEdits(editingSavedView);
                      }
                    : undefined
            }
        />
    );
}

export default SearchAdvancedFiltersButton;
