import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type ReceiptHoverAuditProps = {
    /** List of audit notes */
    notes: string[];

    /** Whether to show audit result or not (e.g.`Verified`, `Issue Found`) */
    shouldShowAuditResult: boolean;
};

function ReceiptHoverAudit({notes, shouldShowAuditResult}: ReceiptHoverAuditProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    let auditText = '';
    if (notes.length > 0 && shouldShowAuditResult) {
        auditText = translate('iou.receiptIssuesFound', {count: notes.length});
    } else if (!notes.length && shouldShowAuditResult) {
        auditText = translate('common.verified');
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.ph5, styles.pv4]}>
            <Text style={[styles.textLabel]}>{translate('common.receipt')}</Text>
            {!!auditText && (
                <>
                    <Text style={[styles.textLabel]}>{` • ${auditText}`}</Text>
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
    );
}

export default ReceiptHoverAudit;
