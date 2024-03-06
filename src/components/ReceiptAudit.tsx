import React from 'react';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

export default function ReceiptAudit({notes}: {notes: string[]}) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.mt2, styles.mb1, styles.ph5]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                <View style={[styles.receiptAuditTitleContainer, {backgroundColor: notes.length ? theme.danger : theme.success}]}>
                    <Icon
                        width={18}
                        height={18}
                        src={notes.length > 0 ? Expensicons.Receipt : Expensicons.Checkmark}
                        fill={theme.white}
                    />
                    <Text style={[styles.textLabel, styles.textStrong, styles.textWhite]}>
                        {notes.length > 0 ? `Receipt Audit : ${notes.length} Issue(s) Found` : 'Receipt Verified : No issues Found'}
                    </Text>
                </View>
            </View>

            {/* // If notes is a array of strings, map through it & show notes. */}
            <View style={[styles.mv1, styles.gap1]}>{notes.length > 0 && notes.map((message) => <Text style={[styles.textLabelError]}>{message}</Text>)}</View>
        </View>
    );
}
