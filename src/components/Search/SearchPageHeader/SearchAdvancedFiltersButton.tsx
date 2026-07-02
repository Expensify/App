import React, {useEffect, useRef} from 'react';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import type {ButtonComponentProps, PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
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
import {cancelSavedViewEdits} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
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

    // On small screens the filters are a fullscreen route, so "Edit filters" opens it here. Keyed by requestID so each
    // click opens it once. Wait for queryJSON.hash === editingSavedView.hash so the form has the edited view's filters.
    const lastAutoNavRequestIDRef = useRef<number | undefined>(undefined);
    // Click-outside/Escape/Cancel all revert the edits via onOverlayClose; the Save buttons set this ref to opt out.
    const skipRevertOnCloseRef = useRef(false);
    useEffect(() => {
        const requestID = editingSavedView?.requestID;
        if (!isSmallScreenWidth || requestID === undefined || lastAutoNavRequestIDRef.current === requestID) {
            return;
        }
        if (queryJSON.hash !== editingSavedView?.hash) {
            return;
        }
        lastAutoNavRequestIDRef.current = requestID;
        Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [isSmallScreenWidth, editingSavedView?.requestID, editingSavedView?.hash, queryJSON.hash]);

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
            autoExpandToken={editingSavedView && queryJSON.hash === editingSavedView.hash ? editingSavedView.requestID : undefined}
            onOverlayClose={
                isEditingSavedView
                    ? () => {
                          if (skipRevertOnCloseRef.current) {
                              skipRevertOnCloseRef.current = false;
                              return;
                          }
                          if (editingSavedView) {
                              cancelSavedViewEdits(editingSavedView);
                          }
                      }
                    : undefined
            }
        />
    );
}

export default SearchAdvancedFiltersButton;
