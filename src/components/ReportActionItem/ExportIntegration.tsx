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

    const links: Array<{text: string; url: string}> = [];

    if (reimbursableUrls.length === 1) {
        links.push({
            text: translate('report.actions.type.exportedToIntegration.reimburseableLink'),
            url: reimbursableUrls[0],
        });
    }

    if (nonReimbursableUrls.length) {
        const text = translate('report.actions.type.exportedToIntegration.nonReimbursableLink');
        let url = '';

        if (nonReimbursableUrls.length === 1) {
            url = nonReimbursableUrls[0];
        } else {
            switch (label) {
                case CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.xero:
                    url = 'https://go.xero.com/Bank/BankAccounts.aspx';
                    break;
                case CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.netsuite:
                    url = 'https://system.netsuite.com/app/common/search/ubersearchresults.nl?quicksearch=T&searchtype=Uber&frame=be&Uber_NAMEtype=KEYWORDSTARTSWITH&Uber_NAME=';
                    url += wasExportedAfterBase62 ? base62ReportID : reportID;
                    break;
                case CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.financialForce:
                    url = '';
                    break;
                default:
                    url = 'https://qbo.intuit.com/app/expenses';
            }
        }

        links.push({text, url});
    }

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.breakWord, styles.preWrap]}>
            <Text style={[styles.chatItemMessage, styles.colorMuted]}>{exportText} </Text>
            {links.map((link) => (
                <TextLink href={link.url}>{link.text} </TextLink>
            ))}
        </View>
    );
}

ExportIntegration.displayName = 'ExportIntegration';

export default ExportIntegration;
