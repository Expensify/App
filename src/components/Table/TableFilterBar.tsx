import React from 'react';
import type {PropsWithChildren} from 'react';
import {View} from 'react-native-web';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {useTableContext} from './TableContext';
import TableSearchBar from './TableSearchBar';

type TableFilterBarProps = PropsWithChildren<{
    /** Label and accessibility label for the search input. */
    label: string;
}>;

export default function TableFilterBar({label, children}: TableFilterBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Filter']);
    const {filterConfig, shouldUseNarrowTableLayout} = useTableContext();

    const hasFiltersAvailable = Object.keys(filterConfig ?? {}).length > 0;
    const actionColumnVisible = hasFiltersAvailable || !!children;

    return (
        <View style={[styles.w100, styles.flexRow, styles.gap3, styles.justifyContentBetween, styles.pb3, styles.ph5]}>
            <TableSearchBar label={label} />

            {actionColumnVisible && (
                <View style={[styles.flexRow, styles.gap1]}>
                    {!shouldUseNarrowTableLayout && hasFiltersAvailable && (
                        <Button
                            small
                            text="Filters"
                            icon={icons.Filter}
                        />
                    )}

                    {shouldUseNarrowTableLayout && hasFiltersAvailable && (
                        <PressableWithFeedback
                            accessibilityLabel={translate('search.filtersHeader')}
                            role={CONST.ROLE.BUTTON}
                            sentryLabel={CONST.SENTRY_LABEL.TABLE.FILTERS}
                            hoverStyle={styles.buttonHoveredBG}
                            style={[styles.justifyContentCenter, styles.componentSizeNormal, styles.borderRadiusCircle]}
                        >
                            <Icon
                                small
                                src={icons.Filter}
                                fill={theme.icon}
                            />
                        </PressableWithFeedback>
                    )}

                    {children}
                </View>
            )}
        </View>
    );
}
