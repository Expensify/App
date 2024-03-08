import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

export default function ReceiptAudit({notes = []}: {notes?: string[]}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const issuesFoundText = notes.length > 0 ? translate('iou.receiptIssuesFound', notes.length) : translate('iou.receiptNoIssuesFound');
    return (
        <View style={[styles.mt1, styles.mb2, styles.ph5]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                <View style={[styles.receiptAuditTitleContainer, {backgroundColor: notes.length ? theme.danger : theme.success}]}>
                    <Icon
                        width={18}
                        height={18}
                        src={notes.length > 0 ? Expensicons.Receipt : Expensicons.Checkmark}
                        fill={theme.white}
                    />
                    <Text style={[styles.textLabel, styles.textStrong, styles.textWhite]}>{notes.length > 0 ? translate('iou.receiptAudit') : translate('iou.receiptVerified')}</Text>
                </View>
                <Text style={[styles.textLabel, styles.textSupporting]}>{issuesFoundText}</Text>
            </View>
            <View style={[styles.mt2, styles.gap1]}>{notes.length > 0 && notes.map((message) => <Text style={[styles.textLabelError]}>{message}</Text>)}</View>
        </View>
    );
}
