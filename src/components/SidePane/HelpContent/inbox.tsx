import React from 'react';
import {View} from 'react-native';
import ExpandableHelp from '@components/SidePane/ExpandableHelp';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';

function Inbox({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Inbox</Text>
            <Text style={styles.textNormal}>
                Chat is the foundation of New Expensify. Every expense, expense report, workspace, or member has an associated "chat", which you can use to record additional details, or
                collaborate with others. Every chat has the following components:
            </Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Header</Text>
            <Text style={styles.textNormal}>
                This shows who you are chatting with (or what you are chatting about). You can press the header for more details on the chat, or additional actions to take upon it.
            </Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Comments</Text>
            <Text style={styles.textNormal}>
                The core of the chat are its comments, which come in many forms:
                <ExpandableHelp styles={styles}>
                    <View>
                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} <Text style={styles.textBold}>Text</Text> - Rich text messages stored securely and delivered via web, app, email, or SMS.
                        </Text>
                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} <Text style={styles.textBold}>Images & Documents</Text> - Insert photos, screenshots, movies, PDFs, or more, using copy/paste, drag/drop, or the
                            attach button.
                        </Text>
                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} <Text style={styles.textBold}>Expenses</Text> - Share an expense in the chat, either to simply track and document it, or to submit for
                            reimbursement.
                        </Text>
                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} <Text style={styles.textBold}>Tasks</Text> - Record a task, and optionally assign it to someone (or yourself!).
                        </Text>
                    </View>
                </ExpandableHelp>
            </Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Actions</Text>
            <Text style={styles.textNormal}>
                Hover (or long press) on a comment to see additional options, including:
                <ExpandableHelp styles={styles}>
                    <View>
                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} <Text style={styles.textBold}>React</Text> - Throw a ♥️😂🔥 like on anything!
                        </Text>
                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} <Text style={styles.textBold}>Reply in thread</Text> - Go deeper by creating a new chat on any comment.
                        </Text>
                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} <Text style={styles.textBold}>Mark unread</Text> - Flag it for reading later, at your convenience.
                        </Text>
                    </View>
                </ExpandableHelp>
            </Text>
            <Text style={[styles.textHeadlineH2, styles.mv4]}>Composer</Text>
            <Text style={styles.textNormal}>
                Use the composer at the bottom to write new messages:
                <ExpandableHelp styles={styles}>
                    <View>
                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} <Text style={styles.textBold}>Markdown</Text> - Format text using <Text style={styles.textBold}>bold</Text>,{' '}
                            <Text style={styles.textItalic}>italics</Text>, and{' '}
                            <TextLink href="https://help.expensify.com/articles/new-expensify/chat/Send-and-format-chat-messages">more</TextLink>.
                        </Text>
                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} <Text style={styles.textBold}>Mention</Text> - Invite or tag anyone in the world to any chat by putting an @ in front of their email address or
                            phone number (e.g., <Text style={styles.textBold}>@awong@marslink.web</Text>, or <Text style={styles.textBold}>@415-867-5309</Text>).
                        </Text>
                    </View>
                </ExpandableHelp>
            </Text>
        </>
    );
}

export default Inbox;
