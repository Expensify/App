/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import BulletList from '@components/SidePane/HelpComponents/HelpBulletList';
import ExpandableHelp from '@components/SidePane/HelpComponents/HelpExpandable';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

function AdminsChatRoom({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>#admins</Text>
            <ExpandableHelp
                styles={styles}
                title="Every workspace automatically receives a special #admins chat room. Every admin is automatically added to this room as a member. The #admins room is used for several purposes:"
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Talking with Concierge, your setup specialist, or your account manager</Text> - When you first create the workspace, Concierge and a
                            setup specialist will be added. Feel free to ask any setup questions you have about how to configure the workspace, onboard your team, connect your accounting, or
                            anything else you might need.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Monitoring workspace changes</Text> - Every #admins room shows an audit trail of any configuration changes or significant events
                            happening inside the workspace.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Chatting with other admins</Text> - The #admins room is a useful space for workspace admins to chat with each other about anything,
                            whether or not it relates to Expensify.
                        </Text>,
                    ]}
                />
            </ExpandableHelp>
        </>
    );
}

export default AdminsChatRoom;
