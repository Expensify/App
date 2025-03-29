/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import BulletList from '@components/SidePane/HelpComponents/HelpBulletList';
import ExpandableHelp from '@components/SidePane/HelpComponents/HelpExpandable';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

function Workspace({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Workspace</Text>
            <Text style={styles.textNormal}>This is where you configure all the settings of the many features associated with your workspace.</Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Default features</Text>
            <ExpandableHelp
                styles={styles}
                title="Here are the features that are enabled by default:"
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Overview</Text> - Configure how it appears to others.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Members</Text> - Add/remove members and admins.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Workflows</Text> - Configure submission, approval, and reimbursement.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Categories</Text> - Group expenses into a chart of accounts.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Expensify Card</Text> - Issue native Expensify Cards to employees.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Accounting</Text> - Sync with external accounting systems.
                        </Text>,
                    ]}
                />
            </ExpandableHelp>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Optional features</Text>
            <ExpandableHelp
                styles={styles}
                title="These can be enabled via More Features:"
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Distance rates</Text> - Configure mileage reimbursement.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Company card</Text> - Connect and manage third-party corporate card feeds.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Per diem</Text> - Configure daily rates.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Rules</Text> - Customize expense violations and set policy.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Invoices</Text> - Collect revenue from customers.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Tags</Text> - Group expenses by project or client.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Taxes</Text> - Track VAT and other taxes.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Report fields</Text> - Capture extra expense report information.
                        </Text>,
                    ]}
                />
            </ExpandableHelp>
        </>
    );
}

export default Workspace;
