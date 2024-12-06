import React, {useCallback, useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type AddBankAccountActionButtonProps = {
    /** The ID of the report */
    reportID: string;
};

function AddBankAccountActionButton({reportID}: AddBankAccountActionButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [shouldShow, setShouldShow] = useState(false);
    const [invoiceReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${invoiceReport?.policyID}`);

    useEffect(() => {
        setShouldShow(ReportUtils.hasMissingInvoiceBankAccount(reportID));
    }, [reportID, policy]);

    const openWorkspaceInvoicesPage = useCallback(() => {
        if (!policy) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_INVOICES.getRoute(policy.id));
    }, [policy]);

    if (!shouldShow) {
        return null;
    }

    return (
        <Button
            style={[styles.mt2, styles.alignSelfStart]}
            success
            text={translate('workspace.invoices.paymentMethods.addBankAccount')}
            onPress={openWorkspaceInvoicesPage}
        />
    );
}

export default AddBankAccountActionButton;
