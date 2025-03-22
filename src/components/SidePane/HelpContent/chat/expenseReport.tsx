/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import BulletList from '@components/SidePane/HelpComponents/HelpBulletList';
import ExpandableHelp from '@components/SidePane/HelpComponents/HelpExpandable';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

function ExpenseReportChat({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Expense Report</Text>
            <ExpandableHelp
                styles={styles}
                title="Every expense report gets a dedicated chat to discuss expenses, approvals, or anything you like. The expense report chat:"
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textNormal}>Is shared with everyone in the approval flow configured inside the workspace.</Text>,
                        <Text style={styles.textNormal}>Will maintain an audit trail of all historical workflow actions (i.e., approvals).</Text>,
                    ]}
                />
            </ExpandableHelp>

            <Text style={[styles.textNormal, styles.mt3]}>Press the attach button to add more expenses, or press the header for more options. Press on any expense to go deeper.</Text>
        </>
    );
}

export default ExpenseReportChat;
