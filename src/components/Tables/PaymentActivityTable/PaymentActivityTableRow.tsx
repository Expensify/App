import AccountAvatar from '@components/Avatar/connected/AccountAvatar';
import Table from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type {PaymentActivityRowData} from '.';

type PaymentActivityTableRowProps = {
    /** The active user shown in the row */
    item: PaymentActivityRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;
};

/** A read-only row showing an active user's avatar, name, and email. */
export default function PaymentActivityTableRow({item, rowIndex}: PaymentActivityTableRowProps) {
    const styles = useThemeStyles();

    const accessibilityLabel = [item.name, item.email].filter(Boolean).join(', ');

    return (
        <Table.Row
            interactive={false}
            rowIndex={rowIndex}
            accessibilityLabel={accessibilityLabel}
        >
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
        </Table.Row>
    );
}
