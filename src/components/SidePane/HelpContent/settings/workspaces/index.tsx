/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import BulletList from '@components/SidePane/HelpComponents/HelpBulletList';
import ExpandableHelp from '@components/SidePane/HelpComponents/HelpExpandable';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

function Workspaces({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Workspaces</Text>

            <ExpandableHelp
                styles={styles}
                containerStyle={styles.mb4}
                title="Workspaces allow for a wide range of features, including:"
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Categorize</Text> and <Text style={styles.textBold}>submit</Text> expenses
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Approve</Text> and <Text style={styles.textBold}>reimburse</Text> expenses
                        </Text>,
                        <Text style={styles.textNormal}>
                            Sync with <Text style={styles.textBold}>accounting packages</Text>
                        </Text>,
                        <Text style={styles.textNormal}>
                            Connect to <Text style={styles.textBold}>company card feeds</Text>
                        </Text>,
                        <Text style={styles.textNormal}>
                            Manage <Text style={styles.textBold}>Expensify Cards</Text>
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Chat</Text> with colleagues, partners, and clients
                        </Text>,
                        <Text style={styles.textNormal}>… and lots more!</Text>,
                    ]}
                />
            </ExpandableHelp>

            <ExpandableHelp
                styles={styles}
                containerStyle={styles.mb4}
                title="Workspaces come in two variations:"
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Collect</Text> workspaces start at $5/member, and include all the basics for running a small business.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Control</Text> workspaces start at $9/member, and provide advanced capabilities, more powerful accounting sync, and more
                            sophisticated approval flows.
                        </Text>,
                    ]}
                />
            </ExpandableHelp>

            <Text style={styles.textNormal}>In general you would create one Workspace for each company you manage. You can create and join as many workspaces as you like.</Text>
        </>
    );
}

export default Workspaces;
