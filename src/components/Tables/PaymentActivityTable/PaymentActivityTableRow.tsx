import AccountAvatar from '@components/Avatar/connected/AccountAvatar';
import Icon from '@components/Icon';
import Table from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {PaymentActivityRowData} from '.';

type PaymentActivityTableRowProps = {
    /** The active user shown in the row */
    item: PaymentActivityRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;
};

/** A row showing an active user's avatar, name, and email. Pressing it opens the user's profile. */
export default function PaymentActivityTableRow({item, rowIndex}: PaymentActivityTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const accessibilityLabel = [item.name, item.email].filter(Boolean).join(', ');

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.PAYMENT_ACTIVITY_ROW}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                        <AccountAvatar
                            accountID={item.accountID}
                            fallbackDisplayName={item.name || item.email}
                        />
                        <View style={[styles.flex1, styles.gap1]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                text={item.name}
                                style={[styles.optionDisplayName, styles.pre]}
                                numberOfLines={1}
                            />
                            <TextWithTooltip
                                shouldShowTooltip
                                text={item.email}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                numberOfLines={1}
                            />
                        </View>
                    </View>

                    <Icon
                        src={icons.ArrowRight}
                        fill={theme.icon}
                        additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, !hovered && styles.opacitySemiTransparent]}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                </>
            )}
        </Table.Row>
    );
}
