import React from 'react';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import AdvancedFilters from '@components/Search/FilterDropdowns/AdvancedFilters';
import useFullscreenAdvancedFilters from '@components/Search/FilterDropdowns/AdvancedFilters/useFullscreenAdvancedFilters';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import type {SearchQueryJSON} from '@components/Search/types';
import useFilterFormValues from '@hooks/useFilterFormValues';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchFilterSync from '@hooks/useSearchFilterSync';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SearchAdvancedFiltersButtonProp = {
    queryJSON: SearchQueryJSON;
};

function SearchAdvancedFiltersButton({queryJSON}: SearchAdvancedFiltersButtonProp) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const fullscreen = useFullscreenAdvancedFilters();
    const {isMediumScreenWidth} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Filter']);
    const filterFormValues = useFilterFormValues(queryJSON);
    useSearchFilterSync(queryJSON, filterFormValues);

    const filtersPopup = ({closeOverlay}: PopoverComponentProps) => (
        <AdvancedFilters
            queryJSON={queryJSON}
            closeOverlay={closeOverlay}
        />
    );

    if (fullscreen || isMediumScreenWidth) {
        return (
            <FilterPopupButton
                PopoverComponent={filtersPopup}
                popoverWidth={CONST.ADVANCED_FILTERS_POPOVER_WIDTH}
                renderButton={({onPress, ref}) => (
                    <PressableWithFeedback
                        ref={ref}
                        accessibilityLabel={translate('search.filtersHeader')}
                        role={CONST.ROLE.BUTTON}
                        style={[styles.searchActionsBar(fullscreen)]}
                        hoverStyle={styles.buttonHoveredBG}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.ADVANCED_FILTERS_BUTTON}
                        onPress={onPress}
                    >
                        <Icon
                            src={expensifyIcons.Filter}
                            fill={theme.icon}
                            small={fullscreen}
                            extraSmall={isMediumScreenWidth}
                        />
                    </PressableWithFeedback>
                )}
                // The default outerModalStyle in FilterPopupButton apply a max height to avoid keyboard. We don't want
                // that in fullscreen because the keyboard avoiding logic will be handled by the ScreenWrapperContainer in AdvancedFiltersFullscreen.
                outerModalStyle={fullscreen ? {} : undefined}
            />
        );
    }

    return (
        <FilterPopupButton
            PopoverComponent={filtersPopup}
            popoverWidth={CONST.ADVANCED_FILTERS_POPOVER_WIDTH}
            popoverAnchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            }}
            renderButton={({onPress, ref, isExpanded}) => (
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
            )}
        />
    );
}

export default SearchAdvancedFiltersButton;
