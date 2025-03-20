import React from 'react';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';

function Workspaces({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Workspaces</Text>
            <Text style={styles.textNormal}>Workspaces allow for a wide range of features, including:</Text>

            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Categorize</Text> and <Text style={styles.textBold}>submit</Text> expenses.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Approve</Text> and <Text style={styles.textBold}>reimburse</Text> expenses.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} Sync with <Text style={styles.textBold}>accounting packages</Text>.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} Connect to <Text style={styles.textBold}>company card feeds</Text>.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} Manage <Text style={styles.textBold}>Expensify Cards</Text>.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Chat</Text> with colleagues, partners, and clients.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>{CONST.BULLET} … and lots more!</Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Workspace Variations</Text>
            <Text style={styles.textNormal}>Workspaces come in two variations:</Text>

            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Collect</Text> workspaces start at $5/member, and include all the basics for running a small business.
            </Text>
            <Text style={[styles.textNormal, styles.mt2]}>
                {CONST.BULLET} <Text style={styles.textBold}>Control</Text> workspaces start at $9/member, and provide advanced capabilities, more powerful accounting sync, and more
                sophisticated approval flows.
            </Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Managing Workspaces</Text>
            <Text style={styles.textNormal}>In general, you would create one Workspace for each company you manage. You can create and join as many workspaces as you like.</Text>
        </>
    );
}

export default Workspaces;
