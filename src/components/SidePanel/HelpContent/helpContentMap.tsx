/* eslint-disable react/no-unescaped-entities */

/* eslint-disable @typescript-eslint/naming-convention */
import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import BulletList from '@components/SidePanel/HelpComponents/HelpBulletList';
import ExpandableHelp from '@components/SidePanel/HelpComponents/HelpExpandable';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import type {ThemeStyles} from '@styles/index';

type ContentComponent = (props: {styles: ThemeStyles}) => ReactNode;

type HelpContent = {
    /** The content to display for this route */
    content: ContentComponent;

    /** Any children routes that this route has */
    children?: Record<string, HelpContent>;

    /** Whether this route is an exact match or displays parent content */
    isExact?: boolean;
};

const helpContentMap: HelpContent = {
    content: () => null,
    children: {
        r: {
            content: ({styles}: {styles: ThemeStyles}) => (
                <>
                    <Text style={[styles.textHeadlineH1, styles.mb4]}>Chat</Text>
                    <Text style={styles.textNormal}>
                        Chat is the foundation of New Expensify. Every expense, expense report, workspace, or member has an associated "chat", which you can use to record additional details,
                        or collaborate with others. Every chat has the following components:
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
                                    <Text style={styles.textBold}>Images & Documents</Text> - Insert photos, screenshots, movies, PDFs, or more, using copy/paste, drag/drop, or the attach
                                    button.
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
                                    <Text style={styles.textBold}>Markdown</Text> - Format text using <Text style={styles.textBold}>bold</Text>,{' '}
                                    <Text style={styles.textItalic}>italics</Text>, and{' '}
                                    <TextLink href="https://help.expensify.com/articles/new-expensify/chat/Send-and-format-chat-messages">more</TextLink>.
                                </Text>,
                                <Text style={styles.textNormal}>
                                    <Text style={styles.textBold}>Mention</Text> - Invite or tag anyone in the world to any chat by putting an @ in front of their email address or phone
                                    number (e.g., <Text style={styles.textBold}>@awong@marslink.web</Text>, or <Text style={styles.textBold}>@415-867-5309</Text>).
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
            ),
            children: {
                ':policyAdmins': {
                    content: ({styles}: {styles: ThemeStyles}) => (
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
                                            <Text style={styles.textBold}>Talking with Concierge, your setup specialist, or your account manager</Text> - When you first create the workspace,
                                            Concierge and a setup specialist will be added. Feel free to ask any setup questions you have about how to configure the workspace, onboard your
                                            team, connect your accounting, or anything else you might need.
                                        </Text>,
                                        <Text style={styles.textNormal}>
                                            <Text style={styles.textBold}>Monitoring workspace changes</Text> - Every #admins room shows an audit trail of any configuration changes or
                                            significant events happening inside the workspace.
                                        </Text>,
                                        <Text style={styles.textNormal}>
                                            <Text style={styles.textBold}>Chatting with other admins</Text> - The #admins room is a useful space for workspace admins to chat with each other
                                            about anything, whether or not it relates to Expensify.
                                        </Text>,
                                    ]}
                                />
                            </ExpandableHelp>
                        </>
                    ),
                },
                ':concierge': {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <>
                            <Text style={[styles.textHeadlineH1, styles.mb4]}>Concierge</Text>
                            <Text style={styles.textNormal}>
                                Concierge is available 24/7 to answer any question you have about anything, whether that's how to get set up, how to fix a problem, or general best practices.
                                Concierge is a bot, but is really smart, and can escalate you to a human whenever you want. Say hi, it's friendly!
                            </Text>
                        </>
                    ),
                },
                ':policyExpenseChat': {
                    content: ({styles}: {styles: ThemeStyles}) => (
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
                                            <Text style={styles.textBold}>Split expense</Text> - This will split an expense between the member and the workspace (e.g., for a business meal
                                            that brings a spouse).
                                        </Text>,
                                    ]}
                                />
                            </ExpandableHelp>

                            <Text style={[styles.textNormal, styles.mt3]}>All past expense reports are processed here and stored for historical reference.</Text>
                        </>
                    ),
                },
                ':expenseReport': {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <>
                            <Text style={[styles.textHeadlineH1, styles.mb4]}>Expense Report</Text>
                            <ExpandableHelp
                                styles={styles}
                                title="Every expense report gets a dedicated chat to discuss expenses, approvals, or anything you like. The expense report chat:"
                            >
                                <BulletList
                                    styles={styles}
                                    items={[
                                        <Text style={styles.textNormal}>Is shared with everyone in the approval flow configured inside the workspace.</Text>,
                                        <Text style={styles.textNormal}>Will maintain an audit trail of all historical workflow actions (i.e., approvals).</Text>,
                                    ]}
                                />
                            </ExpandableHelp>

                            <Text style={[styles.textNormal, styles.mt3]}>
                                Press the attach button to add more expenses, or press the header for more options. Press on any expense to go deeper.
                            </Text>
                        </>
                    ),
                },
                ':expense': {
                    content: ({styles}: {styles: ThemeStyles}) => (
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

                            <Text style={[styles.textNormal, styles.pt3]}>
                                The expense chat is shared with everyone in the approval flow, and will maintain an audit trail of all historical changes.
                            </Text>
                        </>
                    ),
                    children: {
                        ':manual': {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <>
                                    <Text style={[styles.textHeadlineH1, styles.mb4]}>Manual</Text>
                                    <Text style={styles.textNormal}>
                                        A "manual" expense has had all its details specified by the workspace member. It was not imported from any system, or scanned from a receipt.
                                    </Text>
                                </>
                            ),
                        },
                        ':scan': {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <>
                                    <Text style={[styles.textHeadlineH1, styles.mb4]}>Scanned</Text>
                                    <Text style={styles.textNormal}>A "scanned" expense was created by extracting the relevant details using the Concierge AI.</Text>
                                </>
                            ),
                        },
                        ':expensifyCard': {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <>
                                    <Text style={[styles.textHeadlineH1, styles.mb4]}>Expensify Card</Text>
                                    <Text style={styles.textNormal}>An "Expensify Card" expense corresponds to a "posted" (meaning, finalized by the bank) purchase.</Text>
                                    <Text style={[styles.textNormal, styles.pt3]}>
                                        Expensify Card expenses cannot be reimbursed as they are centrally paid by the bank account linked to the workspace.
                                    </Text>
                                </>
                            ),
                        },
                        ':pendingExpensifyCard': {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <>
                                    <Text style={[styles.textHeadlineH1, styles.mb4]}>Expensify Card (pending)</Text>
                                    <Text style={styles.textNormal}>
                                        A "pending" Expensify Card expense represents a purchase that was recently made on the card, but has not yet "posted" – meaning, it has not been
                                        formally recognized as a final, complete transaction.
                                    </Text>
                                    <Text style={[styles.textNormal, styles.pt3]}>Any changes made to this expense will be preserved when the expense posts, typically 2-7 days later.</Text>
                                    <Text style={[styles.textNormal, styles.pt3]}>
                                        Pending transactions cannot be approved, as the final expense amount will not be confirmed until it posts.
                                    </Text>
                                </>
                            ),
                        },
                    },
                },
            },
        },
        home: {
            content: ({styles}: {styles: ThemeStyles}) => (
                <>
                    <Text style={[styles.textHeadlineH1, styles.mb4]}>Chat</Text>
                    <Text style={styles.textNormal}>
                        Chat is the foundation of New Expensify. Every expense, expense report, workspace, or member has an associated "chat", which you can use to record additional details,
                        or collaborate with others. Every chat has the following components:
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
                                    <Text style={styles.textBold}>Images & Documents</Text> - Insert photos, screenshots, movies, PDFs, or more, using copy/paste, drag/drop, or the attach
                                    button.
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
                                    <Text style={styles.textBold}>Markdown</Text> - Format text using <Text style={styles.textBold}>bold</Text>,{' '}
                                    <Text style={styles.textItalic}>italics</Text>, and{' '}
                                    <TextLink href="https://help.expensify.com/articles/new-expensify/chat/Send-and-format-chat-messages">more</TextLink>.
                                </Text>,
                                <Text style={styles.textNormal}>
                                    <Text style={styles.textBold}>Mention</Text> - Invite or tag anyone in the world to any chat by putting an @ in front of their email address or phone
                                    number (e.g., <Text style={styles.textBold}>@awong@marslink.web</Text>, or <Text style={styles.textBold}>@415-867-5309</Text>).
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
            ),
        },
        search: {
            content: ({styles}: {styles: ThemeStyles}) => (
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
                                        items={[
                                            <Text style={styles.textNormal}>Current - Happening or in the future.</Text>,
                                            <Text style={styles.textNormal}>Past - Already happened.</Text>,
                                        ]}
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
            ),
        },
        settings: {
            content: ({styles}: {styles: ThemeStyles}) => (
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
            ),
            children: {
                workspaces: {
                    content: ({styles}: {styles: ThemeStyles}) => (
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
                                            <Text style={styles.textBold}>Control</Text> workspaces start at $9/member, and provide advanced capabilities, more powerful accounting sync, and
                                            more sophisticated approval flows.
                                        </Text>,
                                    ]}
                                />
                            </ExpandableHelp>

                            <Text style={styles.textNormal}>
                                In general you would create one Workspace for each company you manage. You can create and join as many workspaces as you like.
                            </Text>
                        </>
                    ),
                    children: {
                        ':policyID': {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <>
                                    <Text style={[styles.textHeadlineH1, styles.mb4]}>Workspace</Text>
                                    <Text style={styles.textNormal}>This is where you configure all the settings of the many features associated with your workspace.</Text>

                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Default features</Text>
                                    <ExpandableHelp
                                        styles={styles}
                                        title="Here are the features that are enabled by default:"
                                    >
                                        <BulletList
                                            styles={styles}
                                            items={[
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Overview</Text> - Configure how it appears to others.
                                                </Text>,
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Members</Text> - Add/remove members and admins.
                                                </Text>,
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Workflows</Text> - Configure submission, approval, and reimbursement.
                                                </Text>,
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Categories</Text> - Group expenses into a chart of accounts.
                                                </Text>,
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Expensify Card</Text> - Issue native Expensify Cards to employees.
                                                </Text>,
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Accounting</Text> - Sync with external accounting systems.
                                                </Text>,
                                            ]}
                                        />
                                    </ExpandableHelp>

                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Optional features</Text>
                                    <ExpandableHelp
                                        styles={styles}
                                        title="These can be enabled via More Features:"
                                    >
                                        <BulletList
                                            styles={styles}
                                            items={[
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Distance rates</Text> - Configure mileage reimbursement.
                                                </Text>,
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Company card</Text> - Connect and manage third-party corporate card feeds.
                                                </Text>,
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Per diem</Text> - Configure daily rates.
                                                </Text>,
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Rules</Text> - Customize expense violations and set policy.
                                                </Text>,
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Invoices</Text> - Collect revenue from customers.
                                                </Text>,
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Tags</Text> - Group expenses by project or client.
                                                </Text>,
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Taxes</Text> - Track VAT and other taxes.
                                                </Text>,
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Report fields</Text> - Capture extra expense report information.
                                                </Text>,
                                            ]}
                                        />
                                    </ExpandableHelp>
                                </>
                            ),
                        },
                    },
                },
            },
        },
    },
};

export default helpContentMap;
export type {ContentComponent};
