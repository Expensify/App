import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import {ListFilterHeightContextProvider} from '@components/Search/FilterComponents/ListFilterHeightContext';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import {useTableContext} from '@components/Table/TableContext';
import type {TableColumn} from '@components/Table/types';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

import TableDisplaySettingsPopoverComponent from './TableDisplaySettingsPopoverComponent';

type ShouldShowTableDisplaySettingsTriggerParams = {
    columns: Array<TableColumn<string>>;
};

const DISPLAY_POPOVER_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
} as const;

function shouldShowTableDisplaySettingsTrigger({columns}: ShouldShowTableDisplaySettingsTriggerParams): boolean {
    return columns.some((column) => column.sortable);
}

// FilterPopupButton invokes PopoverComponent as a plain function during its own render, so the popover must be
// wrapped in a JSX element here — otherwise its hooks would run inside FilterPopupButton's hook list and crash React.
function renderTableDisplaySettingsPopover({closeOverlay}: PopoverComponentProps) {
    return (
        <ListFilterHeightContextProvider>
            <TableDisplaySettingsPopoverComponent closeOverlay={closeOverlay} />
        </ListFilterHeightContextProvider>
    );
}

export default function TableDisplaySettingsTrigger() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Eye']);
    const {columns, shouldUseNarrowTableLayout} = useTableContext();

    if (!shouldShowTableDisplaySettingsTrigger({columns})) {
        return null;
    }

    if (shouldUseNarrowTableLayout) {
        return (
            <FilterPopupButton
                PopoverComponent={renderTableDisplaySettingsPopover}
                popoverAnchorAlignment={DISPLAY_POPOVER_ANCHOR_ALIGNMENT}
                renderButton={({ref, onPress}) => (
                    <PressableWithFeedback
                        ref={ref}
                        accessibilityLabel={translate('search.display.label')}
                        role={CONST.ROLE.BUTTON}
                        sentryLabel={CONST.SENTRY_LABEL.TABLE.SETTINGS}
                        hoverStyle={styles.buttonHoveredBG}
                        style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.componentSizeNormal, styles.borderRadiusCircle]}
                        onPress={onPress}
                    >
                        <Icon
                            size={CONST.ICON_SIZE.SMALL}
                            src={icons.Eye}
                            fill={theme.icon}
                        />
                    </PressableWithFeedback>
                )}
            />
        );
    }

    return (
        <DropdownButton
            label={translate('search.display.label')}
            sentryLabel={CONST.SENTRY_LABEL.TABLE.SETTINGS}
            value={null}
            wrapperStyle={styles.mt0Half}
            PopoverComponent={renderTableDisplaySettingsPopover}
            popoverAnchorAlignment={DISPLAY_POPOVER_ANCHOR_ALIGNMENT}
        />
    );
}

export {shouldShowTableDisplaySettingsTrigger};
