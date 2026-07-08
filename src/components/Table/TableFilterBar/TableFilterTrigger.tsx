import Button from '@components/ButtonComposed';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import {useTableContext} from '@components/Table/TableContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

import TableFilterPopoverComponent from './TableFilterPopoverComponent';

export default function TableFilterTrigger() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Filter']);
    const {filterConfig, shouldUseNarrowTableLayout} = useTableContext();

    const hasFiltersAvailable = Object.keys(filterConfig ?? {}).length > 0;

    if (!hasFiltersAvailable) {
        return null;
    }

    return (
        <FilterPopupButton
            PopoverComponent={TableFilterPopoverComponent}
            renderButton={({ref, isExpanded, onPress}) => {
                if (shouldUseNarrowTableLayout) {
                    return (
                        <PressableWithFeedback
                            ref={ref}
                            accessibilityLabel={translate('search.filtersHeader')}
                            role={CONST.ROLE.BUTTON}
                            sentryLabel={CONST.SENTRY_LABEL.TABLE.FILTERS}
                            hoverStyle={styles.buttonHoveredBG}
                            style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.componentSizeNormal, styles.borderRadiusCircle]}
                            onPress={onPress}
                        >
                            <Icon
                                small
                                src={icons.Filter}
                                fill={theme.icon}
                            />
                        </PressableWithFeedback>
                    );
                }

                return (
                    <Button
                        ref={ref}
                        size={CONST.BUTTON_SIZE.SMALL}
                        accessibilityLabel={translate('search.filtersHeader')}
                        style={isExpanded ? styles.buttonHoveredBG : undefined}
                        onPress={onPress}
                    >
                        <Button.Icon src={icons.Filter} />
                        <Button.Text>{translate('search.filtersHeader')}</Button.Text>
                    </Button>
                );
            }}
        />
    );
}
