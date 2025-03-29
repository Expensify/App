/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import BulletList from '@components/SidePane/HelpComponents/HelpBulletList';
import ExpandableHelp from '@components/SidePane/HelpComponents/HelpExpandable';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

function WorkspaceChat({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Workspace</Text>

            <ExpandableHelp
                styles={styles}
                title='Every workspace member gets a special chat between them and all workspace admins. This is a good place for workspace members to ask questions about expense policy, for workspace admins to explain changes, or for any "formal" conversation to occur between members and admins. Press the attach button to:'
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Create expense</Text> - This will submit an expense to the workspace for reimbursement.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Split expense</Text> - This will split an expense between the member and the workspace (e.g., for a business meal that brings a
                            spouse).
                        </Text>,
                    ]}
                />
            </ExpandableHelp>

            <Text style={[styles.textNormal, styles.mt3]}>All past expense reports are processed here and stored for historical reference.</Text>
        </>
    );
}

export default WorkspaceChat;
