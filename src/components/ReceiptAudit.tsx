import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

function ReceiptAuditHeader({notes, shouldShowAuditSuccess, shouldShowAuditFailure}: {notes: string[]; shouldShowAuditSuccess?: boolean; shouldShowAuditFailure?: boolean}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    let auditText = '';

    if (notes.length > 0 && shouldShowAuditFailure) {
        auditText = translate('iou.receiptIssuesFound', notes.length);
    } else if (!notes.length && shouldShowAuditSuccess) {
        auditText = translate('common.verified');
    }

    return (
        <View style={[styles.ph5, styles.mbn1]}>
            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                <Text style={[styles.textLabelSupporting]}>{translate('common.receipt')}</Text>
                {auditText && (
                    <>
                        <Text style={[styles.textLabelSupporting]}>{` • ${auditText}`}</Text>
                        <Icon
                            width={12}
                            height={12}
                            src={notes.length ? Expensicons.DotIndicator : Expensicons.Checkmark}
                            fill={notes.length ? theme.danger : theme.success}
                            additionalStyles={styles.ml1}
                        />
                    </>
                )}
            </View>
        </View>
    );
}

function ReceiptAuditMessages({notes = []}: {notes?: string[]}) {
    const styles = useThemeStyles();
    return <View style={[styles.mtn1, styles.mb2, styles.ph5, styles.gap1]}>{notes.length > 0 && notes.map((message) => <Text style={[styles.textLabelError]}>{message}</Text>)}</View>;
}

export {ReceiptAuditHeader, ReceiptAuditMessages};
