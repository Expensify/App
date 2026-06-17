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

    return (
        <View style={[styles.w100, styles.flexRow, styles.gap3, styles.justifyContentBetween, styles.pb3, styles.ph5]}>
            <TableSearchBar label={label} />

            <View style={[styles.flexRow, styles.gap1, styles.flexShrink0]}>
                {!shouldUseNarrowTableLayout && (
                    <Button
                        small
                        text="Filters"
                        icon={icons.Filter}
                    />
                )}

                {shouldUseNarrowTableLayout && (
                    <PressableWithFeedback
                        accessibilityLabel={translate('search.filtersHeader')}
                        role={CONST.ROLE.BUTTON}
                        style={[styles.searchActionsBar(true)]}
                        hoverStyle={styles.buttonHoveredBG}
                        sentryLabel={''}
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
        </View>
    );
}
