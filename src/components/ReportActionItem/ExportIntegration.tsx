import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import type {ReportAction} from '@src/types/onyx';
import type {OriginalMessageExportIntegration} from '@src/types/onyx/OriginalMessage';

type ExportIntegrationProps = {
    action: OnyxEntry<ReportAction>;
};

function ExportIntegration({action}: ExportIntegrationProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {label, markedManually, reimbursableUrls, nonReimbursableUrls} = (ReportActionUtils.getOriginalMessage(action) ?? {}) as OriginalMessageExportIntegration;

    const exportText = markedManually ? translate('report.actions.type.exportedToIntegration.manual', {label}) : translate('report.actions.type.exportedToIntegration.automatic', {label});

    let linkText = '';
    let linkURL = '';
    if (reimbursableUrls.length === 1) {
        linkText = translate('report.actions.type.exportedToIntegration.reimburseableLink');
        linkURL = reimbursableUrls[0];
    } else if (nonReimbursableUrls.length >= 1) {
        linkText = translate('report.actions.type.exportedToIntegration.nonReimbursableLink');
        linkURL = nonReimbursableUrls[0];
    }

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.breakWord, styles.preWrap]}>
            <Text style={[styles.chatItemMessage, styles.colorMuted]}>{exportText}</Text>
            {linkText && <TextLink href={linkURL}>{linkText}</TextLink>}
        </View>
    );
}

ExportIntegration.displayName = 'ExportIntegration';

export default ExportIntegration;
