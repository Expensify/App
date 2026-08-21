import Button from '@components/ButtonComposed';
import RenderHTML from '@components/RenderHTML';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getConnectedIntegration} from '@libs/PolicyUtils';
import {getExportFailedMessage, getOriginalMessage} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import {reExportFailedReports} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type ExportFailedContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.EXPORT_FAILED>;
    policyID: string | undefined;

    /** The #admins room this action lives in, which the re-export loading state is keyed on */
    reportID: string | undefined;
};

function ExportFailedContent({action, policyID, reportID}: ExportFailedContentProps) {
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`);

    const message = getExportFailedMessage(translate, action, policyID);
    const failedReportIDs = getOriginalMessage(action)?.failedReportIDs ?? [];

    // The action records how many reports are failing, but re-exporting them needs somewhere to export to, and a
    // workspace can be disconnected or moved to another accounting connection while its reports are still failing.
    // So the destination is resolved from the workspace now rather than from whatever it was failing on then, and
    // with nothing connected there is nothing to offer.
    const connectedIntegration = getConnectedIntegration(policy);

    return (
        <View>
            <ReportActionItemBasicMessage message="">
                <RenderHTML html={`<comment><muted-text>${message}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
            {!!connectedIntegration && failedReportIDs.length > 0 && (
                <ActionableItemButtons>
                    <Button
                        isLoading={!!reportLoadingState?.isActionLoading}
                        onPress={() => reExportFailedReports(failedReportIDs.map(String), connectedIntegration, reportID)}
                    >
                        <Button.Text>{translate('report.actions.type.reExportFailedReports')}</Button.Text>
                    </Button>
                </ActionableItemButtons>
            )}
        </View>
    );
}

export default ExportFailedContent;
