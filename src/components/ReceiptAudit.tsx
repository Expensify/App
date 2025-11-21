import React from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Icon from './Icon';
import RenderHTML from './RenderHTML';
import Text from './Text';

type ReceiptAuditProps = {
    /** List of audit notes */
    notes: string[];

    /** Whether to show audit result or not (e.g.`Verified`, `Issue Found`) */
    shouldShowAuditResult: boolean;
};

function ReceiptAudit({notes, shouldShowAuditResult}: ReceiptAuditProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'Checkmark'] as const);

    let auditText = '';
    if (notes.length > 0 && shouldShowAuditResult) {
        auditText = translate('iou.receiptIssuesFound', {count: notes.length});
    } else if (!notes.length && shouldShowAuditResult) {
        auditText = translate('common.verified');
    }

    return (
        <View style={[styles.ph5, styles.mbn1]}>
            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                <Text style={[styles.textLabelSupporting]}>{translate('common.receipt')}</Text>
                {!!auditText && (
                    <>
                        <Text style={[styles.textLabelSupporting]}>{` • ${auditText}`}</Text>
                        <Icon
                            width={12}
                            height={12}
                            src={notes.length ? icons.DotIndicator : icons.Checkmark}
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
    return (
        <View style={[styles.mtn1, styles.mb2, styles.ph5, styles.gap1]}>
            {notes.length > 0 &&
                notes.map((message) => (
                    <View key={message}>
                        <RenderHTML html={`<rbr>${message}</rbr>`} />
                    </View>
                ))}
        </View>
    );
}

export {ReceiptAuditMessages};
export default ReceiptAudit;
