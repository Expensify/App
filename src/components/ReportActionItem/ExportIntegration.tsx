import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type {OriginalMessageExportIntegration} from '@src/types/onyx/OriginalMessage';

type ExportIntegrationProps = {
    action: OnyxEntry<ReportAction>;
};

function ExportIntegration({action}: ExportIntegrationProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {label, markedManually, reimbursableUrls, nonReimbursableUrls} = (ReportActionUtils.getOriginalMessage(action) ?? {}) as OriginalMessageExportIntegration;
    const wasExportedAfterBase62 = (action?.created ?? '') > '2022-11-14';
    const reportID = action?.reportID ?? '';
    const base62ReportID = ReportUtils.getBase62ReportID(Number(reportID));

    const exportText = markedManually ? translate('report.actions.type.exportedToIntegration.manual', {label}) : translate('report.actions.type.exportedToIntegration.automatic', {label});

    let linkText = '';
    let linkURL = '';
    if (reimbursableUrls.length === 1) {
        linkText = translate('report.actions.type.exportedToIntegration.reimburseableLink');
        linkURL = reimbursableUrls[0];
    } else if (nonReimbursableUrls.length) {
        linkText = translate('report.actions.type.exportedToIntegration.nonReimbursableLink');

        if (nonReimbursableUrls.length === 1) {
            linkURL = nonReimbursableUrls[0];
        } else {
            switch (label) {
                case CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.xero:
                    linkURL = 'https://go.xero.com/Bank/BankAccounts.aspx';
                    break;
                case CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.netsuite:
                    linkURL = 'https://system.netsuite.com/app/common/search/ubersearchresults.nl?quicksearch=T&searchtype=Uber&frame=be&Uber_NAMEtype=KEYWORDSTARTSWITH&Uber_NAME=';
                    linkURL += wasExportedAfterBase62 ? base62ReportID : reportID;
                    break;
                case CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.financialForce:
                    linkURL = '';
                    break;
                default:
                    linkURL = 'https://qbo.intuit.com/app/expenses';
            }
        }
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
