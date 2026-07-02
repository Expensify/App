import React from 'react';
import Button from '@components/ButtonComposed';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getValidConnectedIntegration} from '@libs/PolicyUtils';
import {getFilteredReportActionsForReportView} from '@libs/ReportActionsUtils';
import {isExported as isExportedUtils} from '@libs/ReportUtils';

import {exportToIntegration} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

type ExportPrimaryActionProps = {
    reportID: string | undefined;
    onExportModalOpen: () => void;
};

function ExportPrimaryAction({reportID, onExportModalOpen}: ExportPrimaryActionProps) {
    const {translate} = useLocalize();
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const connectedIntegration = getValidConnectedIntegration(policy);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(moneyRequestReport?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
    const isExported = isExportedUtils(reportActions, moneyRequestReport);

    return (
        <Button
            variant="success"
            onPress={() => {
                if (!connectedIntegration || !moneyRequestReport) {
                    return;
                }
                if (isExported) {
                    onExportModalOpen();
                    return;
                }
                exportToIntegration(moneyRequestReport.reportID, connectedIntegration);
            }}
        >
            <Button.Text>
                {translate('workspace.common.exportIntegrationSelected', {
                    // connectedIntegration is guaranteed non-null when EXPORT_TO_ACCOUNTING is the primary action
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    connectionName: connectedIntegration!,
                })}
            </Button.Text>
        </Button>
    );
}

export default ExportPrimaryAction;
