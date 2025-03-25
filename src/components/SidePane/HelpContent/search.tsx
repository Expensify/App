/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import BulletList from '@components/SidePane/HelpComponents/HelpBulletList';
import ExpandableHelp from '@components/SidePane/HelpComponents/HelpExpandable';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

function Search({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Reports</Text>
            <Text style={styles.textNormal}>Virtually all data can be analyzed and reported upon in the Reports page. The major elements of this page include:</Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Data type</Text>
            <ExpandableHelp
                styles={styles}
                title="Start first by choosing the type of data you want to analyze, which can be:"
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Expense</Text> - Individual standalone expenses.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Expense reports</Text> - Groups of expenses processed in a batch.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Chats</Text> - Comments written by you and others.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Invoices</Text> - Expenses submitted to clients for payment.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Trips</Text> - Travel expenses booked with Expensify Travel or scanned with SmartScan.
                        </Text>,
                    ]}
                />
            </ExpandableHelp>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Search</Text>
            <Text style={styles.textNormal}>A quick method of narrowing the results by keyword or more.</Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>State filter</Text>
            <ExpandableHelp
                styles={styles}
                title='Simple methods to filter the results by "state", including:'
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textBold}>All</Text>,
                        <>
                            <Text style={styles.textBold}>Expenses/Expense/Invoices reports:</Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>Draft - Only you can see that hasn't been shared yet.</Text>,
                                    <Text style={styles.textNormal}>Outstanding - Submitted to someone and awaiting action.</Text>,
                                    <Text style={styles.textNormal}>Approved - Approved, but awaiting payment.</Text>,
                                    <Text style={styles.textNormal}>Done - Fully processed, no further action needed.</Text>,
                                    <Text style={styles.textNormal}>Paid - Fully paid, no further action needed.</Text>,
                                ]}
                            />
                        </>,
                        <>
                            <Text style={styles.textBold}>Chats:</Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>Unread - Not seen yet by you.</Text>,
                                    <Text style={styles.textNormal}>Sent - Sent by you.</Text>,
                                    <Text style={styles.textNormal}>Attachments - Image, movie, or document.</Text>,
                                    <Text style={styles.textNormal}>Links - Hyperlinks.</Text>,
                                    <Text style={styles.textNormal}>Pinned - Highlighted by you as important.</Text>,
                                ]}
                            />
                        </>,
                        <>
                            <Text style={styles.textBold}>Trips:</Text>
                            <BulletList
                                styles={styles}
                                items={[<Text style={styles.textNormal}>Current - Happening or in the future.</Text>, <Text style={styles.textNormal}>Past - Already happened.</Text>]}
                            />
                        </>,
                    ]}
                />
            </ExpandableHelp>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Results</Text>
            <ExpandableHelp
                styles={styles}
                title="The core of the Reports page are the search results themselves."
            >
                <BulletList
                    styles={styles}
                    items={[<Text style={styles.textNormal}>Select a row to see additional options.</Text>, <Text style={styles.textNormal}>Tap on a row to see more detail.</Text>]}
                />
            </ExpandableHelp>
        </>
    );
}

export default Search;
