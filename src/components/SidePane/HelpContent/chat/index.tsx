/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import {View} from 'react-native';
import BulletList from '@components/SidePane/HelpComponents/HelpBulletList';
import ExpandableHelp from '@components/SidePane/HelpComponents/HelpExpandable';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import type {ThemeStyles} from '@styles/index';

function Inbox({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Chat</Text>
            <Text style={styles.textNormal}>
                Chat is the foundation of New Expensify. Every expense, expense report, workspace, or member has an associated "chat", which you can use to record additional details, or
                collaborate with others. Every chat has the following components:
            </Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Header</Text>
            <Text style={styles.textNormal}>
                This shows who you are chatting with (or what you are chatting about). You can press the header for more details on the chat, or additional actions to take upon it.
            </Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Comments</Text>
            <ExpandableHelp
                styles={styles}
                title="The core of the chat are its comments, which come in many forms:"
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Text</Text> - Rich text messages stored securely and delivered via web, app, email, or SMS.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Images & Documents</Text> - Insert photos, screenshots, movies, PDFs, or more, using copy/paste, drag/drop, or the attach button.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Expenses</Text> - Share an expense in the chat, either to simply track and document it, or to submit for reimbursement.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Tasks</Text> - Record a task, and optionally assign it to someone (or yourself!).
                        </Text>,
                    ]}
                />
            </ExpandableHelp>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Actions</Text>
            <ExpandableHelp
                styles={styles}
                title="Hover (or long press) on a comment to see additional options, including:"
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>React</Text> - Throw a ♥️😂🔥 like on anything!
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Reply in thread</Text> - Go deeper by creating a new chat on any comment.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Mark unread</Text> - Flag it for reading later, at your convenience.
                        </Text>,
                    ]}
                />
            </ExpandableHelp>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Composer</Text>
            <ExpandableHelp
                styles={styles}
                title="Use the composer at the bottom to write new messages:"
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Markdown</Text> - Format text using <Text style={styles.textBold}>bold</Text>, <Text style={styles.textItalic}>italics</Text>, and{' '}
                            <TextLink href="https://help.expensify.com/articles/new-expensify/chat/Send-and-format-chat-messages">more</TextLink>.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Mention</Text> - Invite or tag anyone in the world to any chat by putting an @ in front of their email address or phone number
                            (e.g., <Text style={styles.textBold}>@awong@marslink.web</Text>, or <Text style={styles.textBold}>@415-867-5309</Text>).
                        </Text>,
                    ]}
                />
            </ExpandableHelp>

            <View style={[styles.sectionDividerLine, styles.mv5]} />
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Inbox</Text>
            <Text style={styles.textNormal}>The Inbox is a prioritized "to do" list, highlighting exactly what you need to do next. It consists of:</Text>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Priorities</Text>
            <ExpandableHelp
                styles={styles}
                title="At the top of the Inbox are the most important tasks you should do first, which include:"
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textNormal}>Expense reports waiting on you</Text>,
                        <Text style={styles.textNormal}>Tasks assigned to you</Text>,
                        <Text style={styles.textNormal}>Chats that have mentioned you</Text>,
                        <Text style={styles.textNormal}>Anything you have pinned</Text>,
                    ]}
                />
            </ExpandableHelp>

            <Text style={[styles.textHeadlineH2, styles.mv4]}>Chats</Text>
            <ExpandableHelp
                styles={styles}
                title="Beneath the priorities are a list of chats (with unread chats highlighted in bold), in one of two view modes:"
            >
                <BulletList
                    styles={styles}
                    items={[
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Most Recent</Text> - Lists every chat, ordered by whichever was most recently active.
                        </Text>,
                        <Text style={styles.textNormal}>
                            <Text style={styles.textBold}>Focus</Text> - Only lists chats with unread messages, sorted alphabetically.
                        </Text>,
                    ]}
                />
            </ExpandableHelp>
        </>
    );
}

export default Inbox;
