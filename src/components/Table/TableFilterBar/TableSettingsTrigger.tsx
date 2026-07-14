import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import {useTableContext} from '@components/Table/TableContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

import TableSettingsPopoverComponent from './TableSettingsPopoverComponent';

// FilterPopupButton invokes PopoverComponent as a plain function during its own render, so the popover must be
// wrapped in a JSX element here — otherwise its hooks would run inside FilterPopupButton's hook list and crash React.
function renderTableSettingsPopover({closeOverlay}: PopoverComponentProps) {
    return <TableSettingsPopoverComponent closeOverlay={closeOverlay} />;
}

export default function TableSettingsTrigger() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Gear']);
    const {columns, shouldUseNarrowTableLayout, narrowLayoutSortColumn} = useTableContext();

    const hasSortableColumns = columns.some((column) => column.sortable);
    // On narrow layouts, tables with a narrowLayoutSortColumn ignore user sorting entirely, so a sort control would be a no-op.
    const isSortingLockedByLayout = shouldUseNarrowTableLayout && !!narrowLayoutSortColumn;

    if (!hasSortableColumns || isSortingLockedByLayout) {
        return null;
    }

    if (shouldUseNarrowTableLayout) {
        return (
            <FilterPopupButton
                PopoverComponent={renderTableSettingsPopover}
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
                            src={icons.Gear}
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
            PopoverComponent={renderTableSettingsPopover}
        />
    );
}
