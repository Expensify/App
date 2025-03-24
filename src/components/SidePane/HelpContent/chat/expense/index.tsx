/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import BulletList from '@components/SidePane/HelpComponents/HelpBulletList';
import ExpandableHelp from '@components/SidePane/HelpComponents/HelpExpandable';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

function ExpenseChat({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Expense</Text>
            <ExpandableHelp
                styles={styles}
                title="Every expense gets a dedicated chat to discuss that specific expense. The expense consists of:"
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Receipt</Text> - Attach a photo or document to this expense.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Amount</Text> - The financial total of this transaction.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Description</Text> - A general explanation of what this expense was for.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Merchant</Text> - The business this purchase was made at.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Date</Text> - The day on which the purchase was made.
                        </Text>,
                    ]}
                />
            </ExpandableHelp>

            <Text style={[styles.textNormal, styles.pt3]}>The expense chat is shared with everyone in the approval flow, and will maintain an audit trail of all historical changes.</Text>
        </>
    );
}

export default ExpenseChat;
