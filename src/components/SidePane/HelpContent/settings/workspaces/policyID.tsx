import React from 'react';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';

function PolicyID({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Workspace</Text>
            <Text style={styles.textNormal}>This is where you configure all the settings of the many features associated with your workspace.</Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Default Features</Text>
            <Text style={styles.textNormal}>Here are the features that are enabled by default:</Text>

            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Overview</Text> - Configure how it appears to others.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Members</Text> - Add/remove members and admins.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Workflows</Text> - Configure submission, approval, and reimbursement.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Categories</Text> - Group expenses into a chart of accounts.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Expensify Card</Text> - Issue native Expensify Cards to employees.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Accounting</Text> - Sync with external accounting systems.
            </Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Optional Features</Text>
            <Text style={styles.textNormal}>
                These can be enabled via <Text style={styles.textBold}>More Features</Text>:
            </Text>

            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Distance rates</Text> - Configure mileage reimbursement.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Company card</Text> - Connect and manage third-party corporate card feeds.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Per diem</Text> - Configure daily rates.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Rules</Text> - Customize expense violations and set policy.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Invoices</Text> - Collect revenue from customers.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Tags</Text> - Group expenses by project or client.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Taxes</Text> - Track VAT and other taxes.
            </Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Report Fields</Text>
            <Text style={styles.textNormal}>Capture extra expense report information.</Text>
        </>
    );
}

export default PolicyID;
