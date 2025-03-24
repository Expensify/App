import React from 'react';
import BulletList from '@components/SidePane/HelpComponents/HelpBulletList';
import ExpandableHelp from '@components/SidePane/HelpComponents/HelpExpandable';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

function Settings({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Settings</Text>
            <ExpandableHelp
                styles={styles}
                title="Here is where you configure Expensify exactly to your specifications:"
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Profile</Text> - Configure how you appear to others.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Wallet</Text> - See and manage your credit cards and bank accounts.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Preferences</Text> - Adjust how the app works for you.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Security</Text> - Lock down how you and others access your account.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Workspaces</Text> - Organize expenses for yourself and share with others.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Subscriptions</Text> - Manage payment details and history.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Domains</Text> - Advanced security and corporate card configuration.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Switch to Expensify Classic</Text> - Battle tested and reliable.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Save the World</Text> - Let Expensify.org help your favorite teacher!
                        </Text>,
                    ]}
                />
            </ExpandableHelp>
        </>
    );
}

export default Settings;
