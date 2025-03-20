import React from 'react';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';

function Search({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Reports</Text>
            <Text style={styles.textNormal}>Virtually all data can be analyzed and reported upon in the Reports page. The major elements of this page include:</Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Data type</Text>
            <Text style={styles.textNormal}>Start first by choosing the type of data you want to analyze, which can be:</Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Expense</Text> - Individual standalone expenses.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Expense reports</Text> - Groups of expenses processed in a batch.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Chats</Text> - Comments written by you and others.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Invoices</Text> - Expenses submitted to clients for payment.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Trips</Text> - Travel expenses booked with Expensify Travel or scanned with SmartScan.
            </Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Search</Text>
            <Text style={styles.textNormal}>A quick method of narrowing the results by keyword or more.</Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>State filter</Text>
            <Text style={styles.textNormal}>Simple methods to filter the results by "state", including:</Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>All</Text> - Everything in every state.
            </Text>

            <Text style={[styles.textLarge, styles.mt5]}>Expenses/Expense Reports/Invoices</Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Draft</Text> - Only you can see that hasn't been shared yet.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Outstanding</Text> - Submitted to someone and awaiting action.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Approved</Text> - Approved, but awaiting payment.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Done</Text> - Fully processed, no further action needed.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Paid</Text> - Fully paid, no further action needed.
            </Text>

            <Text style={[styles.textLarge, styles.mt5]}>Chats</Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Unread</Text> - Not seen yet by you.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Sent</Text> - Sent by you.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Attachments</Text> - Image, movie, or document.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Links</Text> - Hyperlinks.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Pinned</Text> - Highlighted by you as important.
            </Text>

            <Text style={[styles.textLarge, styles.mt5]}>Trips</Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Current</Text> - Happening or in the future.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Past</Text> - Already happened.
            </Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Results</Text>
            <Text style={styles.textNormal}>The core of the Reports page are the search results themselves.</Text>
            <Text style={[styles.textNormal, styles.mt2]}>{CONST.BULLET} Select a row to see additional options.</Text>
            <Text style={[styles.textNormal, styles.mt2]}>{CONST.BULLET} Tap on a row to see more detail.</Text>
        </>
    );
}

export default Search;
