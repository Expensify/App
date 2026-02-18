/* eslint-disable react/jsx-key */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/naming-convention */
import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import BulletList from '@components/SidePanel/HelpComponents/HelpBulletList';
import NumberedList from '@components/SidePanel/HelpComponents/HelpNumberedList';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import type {ThemeStyles} from '@styles/index';

type ContentComponent = (props: {styles: ThemeStyles}) => ReactNode;

type HelpContent = {
    /** The content to display for this route */
    content?: ContentComponent;

    /** Any children routes that this route has */
    children?: Record<string, HelpContent>;

    /** Whether this route is an exact match or displays parent content */
    isExact?: boolean;
};

const helpContentMap: HelpContent = {
    children: {
        home: {
            content: ({styles}: {styles: ThemeStyles}) => (
                <View>
                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Navigating Expensify</Text>
                    <Text style={[styles.textNormal]}>Get familiar with Expensify’s intuitive navigation system designed for easy access to all your tools.</Text>
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Left-hand Navigation Bar</Text>
                    <Text style={[styles.textNormal]}>
                        The vertical <Text style={styles.textBold}>left-hand bar</Text> is your main navigation hub:
                    </Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Expensify logo</Text> - Click to return to your Inbox (homepage)
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Inbox</Text> - Your personalized dashboard with action items and reminders
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Reports</Text> - Access all your expense reports and filtering tools
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Workspaces</Text> - Manage company and personal workspace settings
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Account</Text> - Personal settings, profile, and preferences
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Global Create</Text> button - Quick access to create reports, expenses, invoices, and chats
                            </Text>,
                        ]}
                    />
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Inbox Overview</Text>
                    <Text style={[styles.textNormal]}>
                        Your <Text style={styles.textBold}>Inbox</Text> serves as the homepage and shows:
                    </Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>Smart reminders to submit, approve, or reconcile expenses</Text>,
                            <Text style={styles.textNormal}>Real-time updates on recent actions and flagged reports</Text>,
                            <Text style={styles.textNormal}>List of chats with other employees in your organization</Text>,
                            <Text style={styles.textNormal}>Personalized action items based on your role and activity</Text>,
                        ]}
                    />
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Chat Features</Text>
                    <Text style={[styles.textNormal]}>Every expense, report, or workspace has an associated chat for collaboration:</Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Text messages</Text> with rich formatting support
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Images &amp; Documents</Text> via copy/paste, drag/drop, or attach button
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Expenses</Text> to track and submit for reimbursement
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Tasks</Text> to assign and manage work items
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Mentions</Text> to invite anyone by email or phone number
                            </Text>,
                        ]}
                    />
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Reports Section</Text>
                    <Text style={[styles.textNormal]}>
                        The <Text style={styles.textBold}>Reports</Text> tab consolidates filtering and reporting:
                    </Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                Use the <Text style={styles.textBold}>Workspace filter</Text> inside the Filters menu to refine results
                            </Text>,
                            <Text style={styles.textNormal}>Apply filters and queries that update automatically</Text>,
                            <Text style={styles.textNormal}>View all expense reports across your workspaces</Text>,
                        ]}
                    />
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Quick Actions</Text>
                    <Text style={[styles.textNormal]}>
                        Use the green <Text style={styles.textBold}>Create</Text> button to quickly:
                    </Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>Start a new chat or conversation</Text>,
                            <Text style={styles.textNormal}>Create an expense report</Text>,
                            <Text style={styles.textNormal}>Add an expense or receipt</Text>,
                            <Text style={styles.textNormal}>Create a task or invoice</Text>,
                            <Text style={styles.textNormal}>Submit expenses for approval</Text>,
                        ]}
                    />

                    <Text style={[styles.textNormal]}>
                        <Text style={styles.textBold}>Tip:</Text> Navigation is consistent across web and mobile versions of Expensify.
                    </Text>
                </View>
            ),
        },
        distance: {
            content: ({styles}: {styles: ThemeStyles}) => (
                <View>
                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Distance Expense</Text>
                    <Text style={[styles.textNormal]}>
                        Easily track mileage costs using Expensify’s built-in map feature. Create and submit distance-based expenses right from the web or mobile app.
                    </Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                <Text style={[styles.textNormal]}>
                                    <Text style={styles.textBold}>Create distance expenses:</Text> Click the green + button and choose Create expense, then select Distance. Enter your
                                    starting point and destination. You can also add stops if needed.
                                </Text>
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={[styles.textNormal]}>
                                    <Text style={styles.textBold}>Submit for approval:</Text> Choose your workspace and confirm the distance, amount, and date. Add optional notes or
                                    categories, then click Create expense to submit the mileage expense for approval.
                                </Text>
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={[styles.textNormal]}>
                                    <Text style={styles.textBold}>Log a round-trip:</Text> To log a round-trip, use the same location for both start and finish, and include any stops along
                                    the way.
                                </Text>
                            </Text>,
                        ]}
                    />
                </View>
            ),
        },
        r: {
            children: {
                ':concierge': {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Concierge</Text>
                            <Text style={[styles.textNormal]}>
                                Concierge is available 24/7 to answer any question you have about anything — whether that’s how to get set up, how to fix a problem, or general best
                                practices. Concierge is a bot, but it’s really smart and can escalate you to a human whenever you want. Say hi — it’s friendly!
                            </Text>
                        </View>
                    ),
                },
                ':expense': {
                    children: {
                        ':scan': {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Scanned</Text>
                                    <Text style={[styles.textNormal]}>A “scanned” expense was created by extracting the relevant details using the Concierge AI.</Text>
                                </View>
                            ),
                        },
                        ':manual': {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Manual</Text>
                                    <Text style={[styles.textNormal]}>
                                        A “manual” expense has had all its details specified by the workspace member. It was not imported from any system, or scanned from a receipt.
                                    </Text>
                                </View>
                            ),
                        },
                        ':pendingExpensifyCard': {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Expensify Card (pending)</Text>
                                    <Text style={[styles.textNormal, styles.mb4]}>
                                        A “pending” Expensify Card expense represents a purchase that was recently made on the card, but has not yet “posted” – meaning, it has not been
                                        formally recognized as a final, complete transaction.
                                    </Text>
                                    <Text style={[styles.textNormal, styles.mb4]}>Any changes made to this expense will be preserved when the expense posts, typically 2-7 days later.</Text>
                                    <Text style={[styles.textNormal]}>Pending transactions cannot be approved, as the final expense amount will not be confirmed until it posts.</Text>
                                </View>
                            ),
                        },
                        ':expensifyCard': {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Expensify Card</Text>
                                    <Text style={[styles.textNormal, styles.mb4]}>An “Expensify Card” expense corresponds to a “posted” (meaning, finalized by the bank) purchase.</Text>
                                    <Text style={[styles.textNormal]}>
                                        Expensify Card expenses cannot be reimbursed as they are centrally paid by the bank account linked to the workspace.
                                    </Text>
                                </View>
                            ),
                        },
                    },
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Expense</Text>
                            <Text style={[styles.textNormal]}>Every expense gets a dedicated chat to discuss that specific expense. The expense consists of:</Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Receipt</Text> – Attach a photo or document to this expense.
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Amount</Text> – The financial total of this transaction.
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Description</Text> – A general explanation of what this expense was for.
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Merchant</Text> – The business this purchase was made at.
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Date</Text> – The day on which the purchase was made.
                                    </Text>,
                                ]}
                            />
                            <Text style={[styles.textNormal, styles.mt4]}>
                                The expense chat is shared with everyone in the approval flow, and will maintain an audit trail of all historical changes.
                            </Text>
                        </View>
                    ),
                },
                ':chat': {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Chat</Text>
                            <Text style={[styles.textNormal]}>
                                Chat is the foundation of New Expensify. Every expense, expense report, workspace, or member has an associated “chat”, which you can use to record additional
                                details, or collaborate with others. Every chat has the following components:
                            </Text>
                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Header</Text>
                            <Text style={[styles.textNormal]}>
                                This shows who you are chatting with (or what you are chatting about). You can press the header for more details on the chat, or additional actions to take
                                upon it.
                            </Text>
                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Comments</Text>
                            <Text style={[styles.textNormal]}>The core of the chat are its comments, which come in many forms:</Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Text</Text> – Rich text messages stored securely and delivered via web, app, email, or SMS.
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Images &amp; Documents</Text> – Insert photos, screenshots, movies, PDFs, or more, using copy/paste, drag/drop, or the
                                        attach button.
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Expenses</Text> – Share an expense in the chat, either to simply track and document it, or to submit for reimbursement.
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Tasks</Text> – Record a task, and optionally assign it to someone (or yourself!).
                                    </Text>,
                                ]}
                            />
                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Actions</Text>
                            <Text style={[styles.textNormal]}>Hover (or long press) on a comment to see additional options, including:</Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>React</Text> – Throw a ♥️😂🔥 like on anything!
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Reply in thread</Text> – Go deeper by creating a new chat on any comment.
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Mark unread</Text> – Flag it for reading later, at your convenience.
                                    </Text>,
                                ]}
                            />
                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Composer</Text>
                            <Text style={[styles.textNormal]}>Use the composer at the bottom to write new messages:</Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Markdown</Text> – Format text using <Text style={styles.textBold}>bold</Text>,{' '}
                                        <Text style={styles.textItalic}>italics</Text>, and{' '}
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/chat/Send-and-format-chat-messages"
                                            style={styles.link}
                                        >
                                            more
                                        </TextLink>
                                        .
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Mention</Text> – Invite or tag anyone in the world to any chat by putting an @ in front of their email address or phone
                                        number (e.g., <Text style={styles.textBold}>@awong@marslink.web</Text>, or <Text style={styles.textBold}>@415-867-5309</Text>).
                                    </Text>,
                                ]}
                            />
                        </View>
                    ),
                },
                ':policyAdmins': {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>#admins</Text>
                            <Text style={[styles.textNormal]}>
                                Every workspace automatically receives a special #admins chat room. Every admin is automatically added to this room as a member. The #admins room is used for
                                several purposes:
                            </Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Talking with Concierge, your setup specialist, or your account manager</Text> – When you first create the workspace,
                                            Concierge and a setup specialist will be added. Feel free to ask any setup questions you have about how to configure the workspace, onboard your
                                            team, connect your accounting, or anything else you might need.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Monitoring workspace changes</Text> – Every #admins room shows an audit trail of any configuration changes or
                                            significant events happening inside the workspace.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Chatting with other admins</Text> – The #admins room is a useful space for workspace admins to chat with each other
                                            about anything, whether or not it relates to Expensify.
                                        </Text>
                                    </Text>,
                                ]}
                            />
                        </View>
                    ),
                },
                ':expenseReport': {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Expense Report</Text>
                            <Text style={[styles.textNormal]}>Every expense report gets a dedicated chat to discuss expenses, approvals, or anything you like. The expense report chat:</Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>Is shared with everyone in the approval flow configured inside the workspace.</Text>,
                                    <Text style={styles.textNormal}>Will maintain an audit trail of all historical workflow actions (i.e., approvals).</Text>,
                                ]}
                            />
                            <Text style={[styles.textNormal, styles.mt4]}>
                                Press the attach button to add more expenses, or press the header for more options. Press on any expense to go deeper.
                            </Text>
                        </View>
                    ),
                },
                ':policyExpenseChat': {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Workspace</Text>
                            <Text style={[styles.textNormal]}>
                                Every workspace member gets a special chat between them and all workspace admins. This is a good place for workspace members to ask questions about expense
                                policy, for workspace admins to explain changes, or for any “formal” conversation to occur between members and admins. Press the attach button to:
                            </Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Create expense</Text> – This will submit an expense to the workspace for reimbursement.
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Split expense</Text> – This will split an expense between the member and the workspace (e.g., for a business meal that
                                        brings a spouse).
                                    </Text>,
                                ]}
                            />
                            <Text style={[styles.textNormal, styles.mt4]}>All past expense reports are processed here and stored for historical reference.</Text>
                        </View>
                    ),
                },
                ':policyAnnounce': {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Announce Room (#announce)</Text>
                            <Text style={[styles.textNormal]}>
                                The #announce room is a chat space available to all workspace members. It’s perfect for sharing company-wide updates, policy changes, or event reminders. The
                                #announce room is accessible from your <Text style={styles.textBold}>Inbox</Text> in the left-hand menu.
                            </Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Post company-wide announcements:</Text> All members can post in #announce by default, making it easy to communicate
                                            across the workspace.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Restrict posting to admins:</Text> Workspace admins can limit posting to admins only. Open the #announce room, click
                                            the room header, select Settings, and change Who can post to Admins only.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Everyone can read messages:</Text> Even if posting is limited to admins, all workspace members can still view
                                            messages in the #announce room.
                                        </Text>
                                    </Text>,
                                ]}
                            />
                        </View>
                    ),
                },
            },
            content: ({styles}: {styles: ThemeStyles}) => (
                <View>
                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Inbox</Text>
                    <Text style={[styles.textNormal]}>The Inbox is a prioritized “to do” list, highlighting exactly what you need to do next. It consists of:</Text>
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Priorities</Text>
                    <Text style={[styles.textNormal]}>At the top of the Inbox are the most important tasks you should do first, which include:</Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>Expense reports waiting on you</Text>,
                            <Text style={styles.textNormal}>Tasks assigned to you</Text>,
                            <Text style={styles.textNormal}>Chats that have mentioned you</Text>,
                            <Text style={styles.textNormal}>Anything you have pinned</Text>,
                        ]}
                    />
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Chats</Text>
                    <Text style={[styles.textNormal]}>Beneath the priorities are a list of chats (with unread chats highlighted in bold), in one of two view modes:</Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Most Recent</Text> – Lists every chat, ordered by whichever was most recently active.
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Focus</Text> – Only lists chats with unread messages, sorted alphabetically.
                            </Text>,
                        ]}
                    />
                </View>
            ),
        },
        scan: {
            content: ({styles}: {styles: ThemeStyles}) => (
                <View>
                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Scan Receipt</Text>
                    <Text style={[styles.textNormal]}>SmartScan automatically extracts expense details from receipt images.</Text>
                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>How to Scan</Text>
                    <NumberedList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                Click the <Text style={styles.textBold}>+</Text> button and select <Text style={styles.textBold}>Create expense</Text>
                            </Text>,
                            <Text style={styles.textNormal}>
                                Choose <Text style={styles.textBold}>Scan</Text>
                            </Text>,
                            <Text style={styles.textNormal}>Upload an image or take a photo of your receipt</Text>,
                            <Text style={styles.textNormal}>SmartScan extracts merchant, date, amount, and currency</Text>,
                            <Text style={styles.textNormal}>Choose your workspace and add any required details</Text>,
                            <Text style={styles.textNormal}>
                                Click <Text style={styles.textBold}>Create expense</Text>
                            </Text>,
                        ]}
                    />
                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>What SmartScan Detects</Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Amount</Text> and currency
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Merchant</Text> name and location
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Date</Text> of purchase
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Tax</Text> information (when visible)
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Category</Text> suggestions based on merchant type
                            </Text>,
                        ]}
                    />
                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Supported Receipt Types</Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Photos</Text> - Take with your device camera
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Email receipts</Text> - Forward to receipts@expensify.com
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>PDF receipts</Text> - Upload from your device
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Screenshots</Text> - From apps or websites
                            </Text>,
                        ]}
                    />
                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Tips for Best Results</Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>Ensure receipt text is clear and readable</Text>,
                            <Text style={styles.textNormal}>Include the full receipt in the image</Text>,
                            <Text style={styles.textNormal}>Good lighting improves accuracy</Text>,
                            <Text style={styles.textNormal}>Straight angles work better than tilted photos</Text>,
                        ]}
                    />
                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>After Scanning</Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>Review extracted details for accuracy</Text>,
                            <Text style={styles.textNormal}>Add description, category, or tags as needed</Text>,
                            <Text style={styles.textNormal}>SmartScan learns from your corrections</Text>,
                        ]}
                    />
                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Related Links</Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                <TextLink
                                    href="https://help.expensify.com/articles/new-expensify/reports-and-expenses/Create-an-Expense"
                                    style={styles.link}
                                >
                                    Create an Expense
                                </TextLink>
                            </Text>,
                            <Text style={styles.textNormal}>
                                <TextLink
                                    href="https://help.expensify.com/articles/new-expensify/getting-started/Free-Features-in-Expensify"
                                    style={styles.link}
                                >
                                    Free Features in Expensify
                                </TextLink>
                            </Text>,
                        ]}
                    />
                </View>
            ),
        },
        workspaces: {
            children: {
                ':policyID': {
                    children: {
                        accounting: {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Accounting Integrations</Text>
                                    <Text style={[styles.textNormal, styles.mb4]}>
                                        Link your workspace directly to your accounting system to make expense tracking smarter and smoother. We’ll automatically sync your chart of accounts
                                        so your team can code expenses accurately — and approved reports flow right back into your books. Less manual work, more peace of mind.
                                    </Text>
                                    <Text style={[styles.textNormal]}>
                                        <Text style={styles.textBold}>Once connected, you can fine-tune your setup with:</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>Import settings to control what data comes from your accounting system.</Text>,
                                            <Text style={styles.textNormal}>Export settings to choose how expense reports are sent back.</Text>,
                                            <Text style={styles.textNormal}>Advanced options for automation, such as auto-sync and employee settings.</Text>,
                                        ]}
                                    />

                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Supported Integrations</Text>
                                    <Text style={[styles.textNormal]}>
                                        <Text style={styles.textBold}>QuickBooks Online</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>Real-time expense sync</Text>,
                                            <Text style={styles.textNormal}>Category and vendor mapping</Text>,
                                            <Text style={styles.textNormal}>Tax rate sync</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textNormal, styles.mt4]}>
                                        <Text style={styles.textBold}>QuickBooks Desktop</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>File-based import/export</Text>,
                                            <Text style={styles.textNormal}>Chart of accounts sync</Text>,
                                            <Text style={styles.textNormal}>Custom field mapping</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textNormal, styles.mt4]}>
                                        <Text style={styles.textBold}>Xero</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>Auto-sync approved reports</Text>,
                                            <Text style={styles.textNormal}>Import tracking categories</Text>,
                                            <Text style={styles.textNormal}>Manage tax rates seamlessly</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textNormal, styles.mt4]}>
                                        <Text style={styles.textBold}>NetSuite</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>Built for complex orgs with multi-entity support</Text>,
                                            <Text style={styles.textNormal}>Custom dimension mapping</Text>,
                                            <Text style={styles.textNormal}>Automated bill payments</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textNormal, styles.mt4]}>
                                        <Text style={styles.textBold}>Sage Intacct</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>Track departments, classes, and more</Text>,
                                            <Text style={styles.textNormal}>Multi-currency support</Text>,
                                            <Text style={styles.textNormal}>Advanced approval workflows</Text>,
                                        ]}
                                    />

                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>What Syncs Automatically</Text>
                                    <Text style={[styles.textNormal]}>
                                        <Text style={styles.textBold}>From your accounting system:</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>Chart of accounts (as categories)</Text>,
                                            <Text style={styles.textNormal}>Classes, departments, locations (as tags)</Text>,
                                            <Text style={styles.textNormal}>Tax rates and customers</Text>,
                                            <Text style={styles.textNormal}>Vendors and bill payment accounts</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textNormal, styles.mt4]}>
                                        <Text style={styles.textBold}>To your accounting system:</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>Approved expense reports</Text>,
                                            <Text style={styles.textNormal}>Company card transactions</Text>,
                                            <Text style={styles.textNormal}>Vendor bills and journal entries</Text>,
                                            <Text style={styles.textNormal}>Payment records and reconciliation data</Text>,
                                        ]}
                                    />

                                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Learn More</Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <TextLink
                                                    href="https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Connect-to-QuickBooks-Online"
                                                    style={styles.link}
                                                >
                                                    Connect to QuickBooks Online
                                                </TextLink>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <TextLink
                                                    href="https://help.expensify.com/articles/new-expensify/connections/xero/Connect-to-Xero"
                                                    style={styles.link}
                                                >
                                                    Connect to Xero
                                                </TextLink>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <TextLink
                                                    href="https://help.expensify.com/articles/new-expensify/connections/netsuite/Connect-To-NetSuite"
                                                    style={styles.link}
                                                >
                                                    Connect to NetSuite
                                                </TextLink>
                                            </Text>,
                                        ]}
                                    />
                                </View>
                            ),
                        },
                        invoices: {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Create and Send Invoices</Text>
                                    <Text style={[styles.textNormal]}>
                                        Send invoices, track their status, and get paid — even if your customer isn’t on Expensify. Invoicing comes included with all Expensify subscriptions.
                                    </Text>

                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Set Up Invoicing:</Text> Add a business bank account to start sending and receiving invoice payments.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Invoice Balance:</Text> Right up top, you’ll see your current invoice balance — that’s the money you’ve
                                                    collected from paid invoices. If you’ve added a bank account, this balance will transfer automatically.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Customize Your Invoices:</Text> Make your invoices your own. Add your company name, website, and logo —
                                                    they’ll show up on every invoice you send.
                                                </Text>
                                            </Text>,
                                        ]}
                                    />
                                </View>
                            ),
                        },
                        'distance-rates': {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Distance Rates</Text>
                                    <Text style={[styles.textNormal]}>
                                        Distance rates make it easy to pay employees when they use their personal vehicles for work. You can set different rates for different vehicle types
                                        or travel situations. Just make sure at least one rate is active when this feature is turned on.
                                    </Text>

                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>How to set up rates</Text>: Under{' '}
                                                    <Text style={styles.textBold}>Workspaces &gt; [Workspace Name] &gt; Distance rates</Text> and choose{' '}
                                                    <Text style={styles.textBold}>Add rate</Text>. Enter how much you’ll reimburse per mile or kilometer and click{' '}
                                                    <Text style={styles.textBold}>Save</Text>.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Multiple rate options</Text>: Customize rates for personal cars, company vehicles, or different types of
                                                    trips.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Managing your rates</Text>: To save time, you can turn rates on or off, update amounts, or manage them in
                                                    bulk.
                                                </Text>
                                            </Text>,
                                        ]}
                                    />

                                    <Text style={[styles.textNormal]}>
                                        You can learn more about managing distance rates here ➡️{' '}
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/workspaces/Set-distance-rates"
                                            style={styles.link}
                                        >
                                            Set Distance Rates
                                        </TextLink>
                                        .
                                    </Text>
                                </View>
                            ),
                        },
                        workflows: {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Workflows</Text>
                                    <Text style={[styles.textNormal, styles.mb4]}>
                                        Setting up workflows on your workspace automates how expenses move from submission to payment. They keep things organized and help you control when
                                        expenses are submitted, who approves them, and how they get paid.
                                    </Text>
                                    <Text style={[styles.textNormal]}>
                                        <Text style={styles.textBold}>Note:</Text> Only admins can configure workspace workflows.
                                    </Text>

                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Approval setup</Text>: Assign approvers to review expenses before they’re paid. You can even customize
                                                    approvers for different team members.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Submission timing</Text>: Pick a daily or weekly schedule for automatic expense submission so no one forgets
                                                    to submit their expenses.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Automated payments</Text>: Link your business bank account, and Expensify will automatically process
                                                    payments for approved expenses and invoices.
                                                </Text>
                                            </Text>,
                                        ]}
                                    />

                                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Learn More</Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <TextLink
                                                    href="https://help.expensify.com/articles/new-expensify/workspaces/Workspace-Workflows"
                                                    style={styles.link}
                                                >
                                                    Workspace Workflows
                                                </TextLink>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <TextLink
                                                    href="https://help.expensify.com/articles/new-expensify/workspaces/Add-Approvals"
                                                    style={styles.link}
                                                >
                                                    Approval Settings
                                                </TextLink>
                                            </Text>,
                                        ]}
                                    />
                                </View>
                            ),
                        },
                        'expensify-card': {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Expensify Card</Text>
                                    <Text style={[styles.textNormal, styles.mb4]}>
                                        The Expensify Card is a smart company card with real-time controls and built-in cash back. It allows you to issue unlimited virtual cards, set custom
                                        limits for each employee, and manage everything in one place.
                                    </Text>
                                    <Text style={[styles.textNormal]}>
                                        <Text style={styles.textBold}>Note:</Text> You’ll need a connected US business bank account to get started.
                                    </Text>

                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Issue cards</Text>: Hand out virtual or physical cards with flexible spending controls, such as smart
                                                    limits, monthly caps, or fixed amounts.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Smarter spending controls</Text>: Set custom limits, block certain merchant types, and track every swipe in
                                                    real time.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Easy card management</Text>: As a workspace admin, you can see all issued cards at a glance. You can adjust
                                                    limits, rename cards, or deactivate them whenever you need to.
                                                </Text>
                                            </Text>,
                                        ]}
                                    />

                                    <Text style={[styles.textNormal]}>
                                        More details on setting up the Expensify Card for your business can be found here ➡️{' '}
                                        <TextLink
                                            href="https://help.expensify.com/new-expensify/hubs/expensify-card/"
                                            style={styles.link}
                                        >
                                            The Expensify Card
                                        </TextLink>
                                        .
                                    </Text>
                                </View>
                            ),
                        },
                        tags: {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Tag Settings</Text>
                                    <Text style={[styles.textNormal]}>
                                        Tags help you track extra details on expenses—like projects, cost centers, locations, or clients—so you can organize your spend beyond just
                                        categories. You can add them manually or sync them automatically from your accounting software.
                                    </Text>

                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>How to add tags</Text>: Click the green + button to add tags manually, or upload up to 50,000 at once with a
                                                    spreadsheet. Using an accounting integration? Your tags will sync automatically.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Organizing tags</Text>: Use dependent tags (where one relies on another) for more structured tracking, or
                                                    keep things simple with independent tags.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Automatic tagging that gets smarter</Text>: Expensify learns how you tag expenses and starts doing it for
                                                    you, speeding up and simplifying your workflow over time.
                                                </Text>
                                            </Text>,
                                        ]}
                                    />

                                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Learn More</Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <TextLink
                                                    href="https://help.expensify.com/articles/new-expensify/workspaces/Create-expense-tags"
                                                    style={styles.link}
                                                >
                                                    Create Tags
                                                </TextLink>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <TextLink
                                                    href="https://help.expensify.com/articles/new-expensify/workspaces/Require-tags-and-categories-for-expenses"
                                                    style={styles.link}
                                                >
                                                    Require Tags for Expenses
                                                </TextLink>
                                            </Text>,
                                        ]}
                                    />
                                </View>
                            ),
                        },
                        'per-diem': {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Per Diem Settings</Text>
                                    <Text style={[styles.textNormal]}>
                                        Per diem makes it easy to cover travel or recurring allowances with fixed daily rates—no need to track every coffee or cab ride. Employees just pick a
                                        rate and submit. You can create rates manually or import them from a spreadsheet.
                                    </Text>

                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Set up rates</Text>: Create daily rates for different locations, meal types, or travel needs. Just enter the
                                                    amount, and you’re done!
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Default categories</Text>: Assign a default category to keep all your per diem expenses organized and your
                                                    accounting on track.
                                                </Text>
                                            </Text>,
                                        ]}
                                    />

                                    <Text style={[styles.textNormal]}>
                                        Learn more about setting up per diem rates here ➡️{' '}
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/workspaces/Configure-Per-Diem-in-a-workspace"
                                            style={styles.link}
                                        >
                                            Per Diem Settings
                                        </TextLink>
                                        .
                                    </Text>
                                </View>
                            ),
                        },
                        taxes: {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Tax Settings</Text>
                                    <Text style={[styles.textNormal]}>
                                        Track VAT, GST, or any other regional taxes right in Expensify. Perfect for staying compliant—especially if you’re working in non-USD currencies. You
                                        can set up different tax rates for your workspace currency and for foreign currencies, too.
                                    </Text>

                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>How to set up tax rates</Text>: Click the green + button to add a tax rate. Just enter the tax name,
                                                    percentage, and tax code for your records.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Default tax settings</Text>: Set separate default rates for your workspace currency and foreign currencies,
                                                    so everything’s accurate no matter where you’re spending.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Managing tax rates</Text>: You can turn rates on or off, update their values, or delete them entirely. Use
                                                    bulk actions to move faster, or make changes one at a time.
                                                </Text>
                                            </Text>,
                                        ]}
                                    />

                                    <Text style={[styles.textNormal]}>
                                        Learn more about workspace tax settings here ➡️{' '}
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/workspaces/Track-Taxes"
                                            style={styles.link}
                                        >
                                            Track Taxes
                                        </TextLink>
                                        .
                                    </Text>
                                </View>
                            ),
                        },
                        rules: {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Workspace Rules</Text>
                                    <Text style={[styles.textNormal, styles.mb4]}>
                                        Rules help you stick to your expense policy without micromanaging. Set limits, require receipts, and automate approvals. Expensify checks every
                                        expense against your rules and flags anything that’s off.
                                    </Text>
                                    <Text style={[styles.textNormal]}>
                                        <Text style={styles.textBold}>Note:</Text> Workspace rules are only available on the Control plan.
                                    </Text>

                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Expense requirements:</Text> Decide when receipts are required, set a max spend per expense, and control how
                                                    far back expenses can be submitted.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Prohibited expenses:</Text> Let Expensify’s AI catch restricted items like alcohol, gambling, or tobacco—no
                                                    manual review needed.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Automatic approvals:</Text> Save time by auto-approving compliant reports under a certain amount. You can
                                                    even randomly audit a few to keep everyone honest.
                                                </Text>
                                            </Text>,
                                        ]}
                                    />

                                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Learn More</Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <TextLink
                                                    href="https://help.expensify.com/articles/new-expensify/workspaces/Workspace-Rules"
                                                    style={styles.link}
                                                >
                                                    Workspace Rules
                                                </TextLink>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <TextLink
                                                    href="https://help.expensify.com/articles/new-expensify/workspaces/Prohibited-Expense-Rule"
                                                    style={styles.link}
                                                >
                                                    Prohibited Expense Rules
                                                </TextLink>
                                            </Text>,
                                        ]}
                                    />
                                </View>
                            ),
                        },
                        members: {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Workspace Members</Text>
                                    <Text style={[styles.textNormal]}>
                                        Invite teammates to your workspace and assign roles to control their access and keep the expense process running smoothly.
                                    </Text>

                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Member Roles</Text>
                                    <Text style={[styles.textNormal]}>
                                        <Text style={styles.textBold}>Admin</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>Full workspace control and settings access</Text>,
                                            <Text style={styles.textNormal}>Add/remove members and change roles</Text>,
                                            <Text style={styles.textNormal}>Set up integrations and payment methods</Text>,
                                            <Text style={styles.textNormal}>Approve and pay expenses</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textNormal, styles.mt4]}>
                                        <Text style={styles.textBold}>Member</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>Submit expenses and create reports</Text>,
                                            <Text style={styles.textNormal}>Participate in workspace chats</Text>,
                                            <Text style={styles.textNormal}>View assigned expenses and reports</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textNormal, styles.mt4]}>
                                        <Text style={styles.textBold}>Auditor</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>View all workspace reports (read-only)</Text>,
                                            <Text style={styles.textNormal}>Add comments, but cannot modify expenses</Text>,
                                            <Text style={styles.textNormal}>No approval or payment permissions</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Adding Members</Text>
                                    <NumberedList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                Under <Text style={styles.textBold}>Workspaces &gt; [Workspace Name] &gt; Members</Text>, click{' '}
                                                <Text style={styles.textBold}>Invite Member</Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>Enter name, email, or phone number</Text>,
                                            <Text style={styles.textNormal}>Choose a role (defaults to Member)</Text>,
                                            <Text style={styles.textNormal}>
                                                Click <Text style={styles.textBold}>Invite</Text>
                                            </Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textNormal, styles.mt4]}>
                                        <Text style={styles.textBold}>Alternative:</Text> Share the workspace URL or QR code from{' '}
                                        <Text style={styles.textBold}>Account &gt; Profile &gt; Share</Text>
                                    </Text>
                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Managing Members</Text>
                                    <Text style={[styles.textNormal]}>
                                        <Text style={styles.textBold}>Change Role:</Text>
                                    </Text>
                                    <NumberedList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>Click the member’s name</Text>,
                                            <Text style={styles.textNormal}>
                                                Click <Text style={styles.textBold}>Role</Text> and select new role
                                            </Text>,
                                            <Text style={styles.textNormal}>Confirm changes</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textNormal, styles.mt4]}>
                                        <Text style={styles.textBold}>Remove Member:</Text>
                                    </Text>
                                    <NumberedList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>Click the member’s name</Text>,
                                            <Text style={styles.textNormal}>
                                                Click <Text style={styles.textBold}>Remove from Workspace</Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>Confirm removal</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Transfer Ownership of a Workspace</Text>
                                    <NumberedList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                Go to <Text style={styles.textBold}>Members</Text> and click current <Text style={styles.textBold}>Owner</Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                Click <Text style={styles.textBold}>Transfer Owner</Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>Confirm transfer</Text>,
                                            <Text style={styles.textNormal}>You become the new owner</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Learn More</Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <TextLink
                                                    href="https://help.expensify.com/articles/new-expensify/workspaces/Managing-Workspace-Members"
                                                    style={styles.link}
                                                >
                                                    Managing Workspace Members
                                                </TextLink>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <TextLink
                                                    href="https://help.expensify.com/articles/new-expensify/workspaces/Add-Approvals"
                                                    style={styles.link}
                                                >
                                                    Add Approvals
                                                </TextLink>
                                            </Text>,
                                        ]}
                                    />
                                </View>
                            ),
                        },
                        'company-cards': {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Company Cards</Text>
                                    <Text style={[styles.textNormal]}>
                                        Already have business credit cards? You can connect them to Expensify to automatically pull in transactions. Most major banks and card providers are
                                        supported.
                                    </Text>

                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>How to connect cards</Text>: Link your corporate card program to your workspace, assign the cards to the
                                                    corresponding cardholder, and transactions will start syncing automatically as they post—no manual entry needed.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Exporting expenses</Text>: Send card transactions to your accounting system, either to a shared account or
                                                    separate ones for each cardholder.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>eReceipts</Text>: Turn on eReceipts to automatically generate digital receipts for USD transactions under
                                                    $75—no more chasing paper ones.
                                                </Text>
                                            </Text>,
                                        ]}
                                    />

                                    <Text style={[styles.textNormal]}>
                                        More details on connecting your company card program can be found here ➡️{' '}
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/connect-credit-cards/Company-Card-Settings"
                                            style={styles.link}
                                        >
                                            Company Card Settings
                                        </TextLink>
                                        .
                                    </Text>
                                </View>
                            ),
                        },
                        reportFields: {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Report Settings</Text>
                                    <Text style={[styles.textNormal]}>Keep your reports clean, consistent, and easy to manage by customizing titles and adding report-level details.</Text>

                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Report title</Text>: Use the Custom Report Names feature (under workspace Rules) to create naming templates
                                                    for new reports. It’s a smarter way to keep things organized and make reports easier to find. You also have the option to prevent members
                                                    from changing the custom report names you set.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Report fields</Text>: Collect high-level info—like project names, client codes, or trip types—that applies
                                                    to the whole report, not just individual expenses. Report fields are filled out once and apply to all expenses in that report.
                                                </Text>
                                            </Text>,
                                        ]}
                                    />

                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Turn on and Manage Report Fields</Text>
                                    <Text style={[styles.textNormal]}>
                                        <Text style={styles.textBold}>Note:</Text> This setting requires the Control plan.
                                    </Text>
                                    <NumberedList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                Under <Text style={styles.textBold}>Workspaces &gt; More Features</Text>, toggle on <Text style={styles.textBold}>Report fields</Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                Head to <Text style={styles.textBold}>Workspaces &gt; [Workspace Name] &gt; Reports</Text> to add, edit, or delete fields
                                            </Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textNormal, styles.mt4]}>
                                        You can choose from field types like Text, Date, or a List with predefined options — whatever best fits your workflow. Learn more ➡️{' '}
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/workspaces/Enable-Report-Fields"
                                            style={styles.link}
                                        >
                                            Enable Report Fields
                                        </TextLink>
                                        .
                                    </Text>
                                </View>
                            ),
                        },
                        overview: {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Workspace Overview</Text>
                                    <Text style={[styles.textNormal]}>Set up the essentials — name, description, currency, address, and subscription plan — all in one spot.</Text>

                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Choose your workspace currency:</Text> Pick a default currency. No matter what currency members use, we’ll
                                                    convert everything automatically.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Add workspace details:</Text> Give your workspace a name, add a quick description, and drop in your company
                                                    address. These show up on reports and invoices, so make it yours.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Manage your subscription:</Text> Your plan controls what features you get and how much you pay per active
                                                    user. Hit Explore all plans to switch things up or adjust your size.
                                                </Text>
                                            </Text>,
                                        ]}
                                    />
                                </View>
                            ),
                        },
                        categories: {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Category Settings</Text>
                                    <Text style={[styles.textNormal]}>
                                        Categories help you organize expenses so your reports and accounting stay clean and easy to manage. Think of them as your chart of accounts or GL
                                        codes. You can add them manually or, if you use accounting software, import them straight from the integration.
                                    </Text>

                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Category settings made simple:</Text> You can toggle categories on or off, add GL codes, and set rules like
                                                    receipt requirements or spending limits, all in one place under{' '}
                                                    <Text style={styles.textBold}>Workspaces &gt; [Workspace Name] &gt; Categories</Text>.
                                                </Text>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <Text style={[styles.textNormal]}>
                                                    <Text style={styles.textBold}>Smarter categorization, automatically:</Text> Expensify learns how you tag your expenses and starts
                                                    automatically applying those categories to similar merchants. This means less busywork and more accuracy.
                                                </Text>
                                            </Text>,
                                        ]}
                                    />

                                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Learn More</Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>
                                                <TextLink
                                                    href="https://help.expensify.com/articles/new-expensify/workspaces/Create-expense-categories"
                                                    style={styles.link}
                                                >
                                                    Create Expense Categories
                                                </TextLink>
                                            </Text>,
                                            <Text style={styles.textNormal}>
                                                <TextLink
                                                    href="https://help.expensify.com/articles/new-expensify/workspaces/Require-tags-and-categories-for-expenses"
                                                    style={styles.link}
                                                >
                                                    Require Categories
                                                </TextLink>
                                            </Text>,
                                        ]}
                                    />
                                </View>
                            ),
                        },
                    },
                },
            },
            content: ({styles}: {styles: ThemeStyles}) => (
                <View>
                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Workspaces 101</Text>
                    <Text style={[styles.textNormal]}>
                        Think of a workspace as mission control for your company’s expenses. It’s where you set the rules, invite the team, and connect to your accounting tools. Each
                        workspace runs independently, so you can keep things tidy across departments, entities, or clients.
                    </Text>
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Create a new workspace</Text>
                    <Text style={[styles.textNormal]}>
                        Hit the <Text style={styles.textBold}>New workspace</Text> button to get started. Add a name, set a default currency, and you’re ready to get started customizing the
                        workspace settings!
                    </Text>
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Invite your team</Text>
                    <Text style={[styles.textNormal]}>Add teammates to your workspace to manage expenses and approvals in one central place:</Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>Members can submit and approve reports they’re assigned to.</Text>,
                            <Text style={styles.textNormal}>Admins can approve all reports and manage workspace settings.</Text>,
                        ]}
                    />
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Automate approvals</Text>
                    <Text style={[styles.textNormal]}>
                        Toggle on <Text style={styles.textBold}>Add Approvals</Text> under <Text style={styles.textBold}>Workflows</Text> to set a default first approver. Create custom
                        approval flows for individual team members if needed.
                    </Text>
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Connect your accounting system</Text>
                    <Text style={[styles.textNormal]}>Link your workspace with QuickBooks Online, Xero, NetSuite, or Sage Intacct to sync expenses like a pro.</Text>
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Enhance your workspace with extra features</Text>
                    <Text style={[styles.textNormal]}>
                        Under <Text style={styles.textBold}>More Features</Text>, enable extras like the Expensify Card, distance rates, custom categories and tags, and company card
                        connections.
                    </Text>

                    <Text style={[styles.textNormal]}>
                        <Text style={styles.textBold}>Tip:</Text> If you manage multiple departments, clients, or entities, consider creating multiple workspaces. Separate workspaces can
                        help keep settings, approvals, and payments organized and more automated.
                    </Text>
                </View>
            ),
        },
        settings: {
            children: {
                preferences: {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Preferences</Text>
                            <Text style={[styles.textNormal]}>
                                Your preferences shape how Expensify looks and feels just for you. Customize your language, theme, and notification settings to customize your experience
                                across all your devices.
                            </Text>

                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Notifications</Text>: Decide which alerts you want to receive, such as feature updates, news, or sound
                                            notifications. You’re in control.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Priority mode:</Text> Choose how chats appear in your inbox – Focus on unread and pinned chats, or keep everything
                                            visible, with the most recent messages shown at the top of the left-hand menu.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Language options</Text>: You can update your interface in just a few clicks by choosing from 10 supported languages.
                                            Choose your preferred language from the list, and your account will update automatically.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Payment Currency:</Text> Set your default currency for expense tracking and reimbursements.
                                        </Text>
                                    </Text>,
                                    <>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Theme:</Text> Change the app’s appearance to suit your preference:
                                        </Text>

                                        <BulletList
                                            styles={styles}
                                            items={[
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Dark Mode</Text> - Easy on the eyes in low-light environments
                                                </Text>,
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Light Mode</Text> - Bright, clean interface for well-lit spaces
                                                </Text>,
                                                <Text style={styles.textNormal}>
                                                    <Text style={styles.textBold}>Use Device Settings</Text> - Automatically match your device’s theme
                                                </Text>,
                                            ]}
                                        />
                                    </>,
                                ]}
                            />

                            <Text style={[styles.textNormal]}>
                                <Text style={styles.textBold}>Note:</Text> Preference changes only affect your personal account view. Workspace members must update their own settings
                                individually.
                            </Text>
                        </View>
                    ),
                },
                security: {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Security</Text>
                            <Text style={[styles.textNormal]}>
                                This is where you control who can access your account and how secure it is. From adding two-factor authentication to merging accounts, it’s all in one spot.
                            </Text>

                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Two-Factor Authentication</Text>
                            <Text style={[styles.textNormal]}>
                                This adds an extra layer of protection to your Expensify account. Even if someone gets your login info, they won’t be able to access it without a code from
                                your authenticator app.
                            </Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Set it up in a minute:</Text> Use an app like Google Authenticator or Microsoft Authenticator to link your account.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Don’t skip the backup codes:</Text> Download or save your recovery codes somewhere safe. You’ll need them if you
                                            ever lose access to your app.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>How login works:</Text> You’ll log in with your email magic code and a 6-digit code from your authenticator app.
                                        </Text>
                                    </Text>,
                                ]}
                            />

                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Merge Accounts</Text>
                            <Text style={[styles.textNormal]}>
                                If you’ve ended up with two Expensify accounts, you can merge them to keep expense history and workspace access under a single login.
                            </Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Heads up:</Text> Merging is permanent and must be done from your company account by pulling in the personal one.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>How to merge:</Text> Under <Text style={styles.textBold}>Account &gt; Security &gt; Merge accounts</Text>, add the
                                            email address of the account you’re merging and then enter the magic code sent to your email.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>What moves over:</Text> Expenses, reports, cards, co-pilots — everything from the merged account rolls over into
                                            your existing account.
                                        </Text>
                                    </Text>,
                                ]}
                            />

                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Report Suspicious Activity</Text>
                            <Text style={[styles.textNormal]}>
                                If something feels off or you’re concerned a bad actor has gained access to your account, report it by clicking{' '}
                                <Text style={styles.textBold}>Report suspicious activity</Text>. This will fully lock down your account and halt Expensify Card transactions immediately.
                            </Text>

                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Close Account</Text>
                            <Text style={[styles.textNormal]}>If you need to close your Expensify account, you can do that here — there are just a few things to check off first.</Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Before you close:</Text> Make sure to transfer ownerships, clear any balances, and update billing contacts.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>After closing the account:</Text> Shared reports and expenses will still be accessible to workspace admins, but all
                                            your personal data will be wiped.
                                        </Text>
                                    </Text>,
                                ]}
                            />

                            <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Learn More</Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/settings/Two-Factor-Authentication"
                                            style={styles.link}
                                        >
                                            Two-Factor Authentication
                                        </TextLink>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/settings/Lock-Account-Tool"
                                            style={styles.link}
                                        >
                                            Report Suspicious Activity
                                        </TextLink>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/settings/Merge-Accounts"
                                            style={styles.link}
                                        >
                                            Merge Accounts
                                        </TextLink>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/settings/Close-Account"
                                            style={styles.link}
                                        >
                                            Close Account
                                        </TextLink>
                                    </Text>,
                                ]}
                            />
                        </View>
                    ),
                },
                subscription: {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Subscription Plan</Text>
                            <Text style={[styles.textNormal]}>
                                Your subscription plan determines which features are available and how much you’re charged per active member. Choose the one that fits your team’s needs and
                                budget!
                            </Text>

                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Expensify offers two plans – Collect and Control:</Text> The Collect plan is $5 per member each month. The Control
                                            plan ranges from $9 to $36 per member/month, depending on your subscription commitment and how much your team uses the Expensify Card.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Add a payment card:</Text> To pay for your subscription, add a payment card under{' '}
                                            <Text style={styles.textBold}>Account &gt; Subscription</Text>. Charges will automatically be billed to this card each month.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Change plan:</Text> You can switch plans by clicking <Text style={styles.textBold}>Explore all plans</Text>. You can
                                            upgrade your plan or increase your subscription size at any time.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Request Tax-Exempt Status:</Text> Under{' '}
                                            <Text style={styles.textBold}>Account &gt; Subscription &gt; Subscription settings</Text>, click{' '}
                                            <Text style={styles.textBold}>Tax exempt status</Text>. This kicks off a chat with Concierge, where you can request that your account be
                                            tax-exempt and then upload a PDF of your exemption document. Our team will review everything and reach out if we need anything else.
                                        </Text>
                                    </Text>,
                                ]}
                            />

                            <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Learn More</Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/billing-and-subscriptions/Billing-Overview"
                                            style={styles.link}
                                        >
                                            Billing Overview
                                        </TextLink>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/billing-and-subscriptions/Changing-Your-Workspace-Plan"
                                            style={styles.link}
                                        >
                                            Change Workspace Plan
                                        </TextLink>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/billing-and-subscriptions/Tax-Exemption"
                                            style={styles.link}
                                        >
                                            Tax Exemption
                                        </TextLink>
                                    </Text>,
                                ]}
                            />
                        </View>
                    ),
                },
                profile: {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Profile</Text>
                            <Text style={[styles.textNormal]}>
                                Your profile is where you control how you show up in Expensify. Update your photo, name, status, and timezone so teammates know who they’re working with.
                                Private info like your legal name and address stays visible to you only.
                            </Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Setting your status</Text>: Add a custom status (yep, emojis included) to show if you’re in a meeting, out of
                                            office, or just heads-down for a bit.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Managing contact methods</Text>: Add backup emails or phone numbers to keep your account secure and accessible, even
                                            if your primary email changes.
                                        </Text>
                                    </Text>,
                                ]}
                            />
                        </View>
                    ),
                },
                wallet: {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Wallet</Text>
                            <Text style={[styles.textNormal]}>
                                Your Wallet is the hub for all things money in Expensify. This is where you connect and manage your business and personal bank accounts, view company card
                                details, and control how money moves in and out of your organization. Whether you’re reimbursing employees, collecting payments, or issuing Expensify Cards,
                                it all starts here.
                            </Text>

                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Business Bank Accounts</Text>
                            <Text style={[styles.textNormal]}>
                                Connect a verified business bank account to unlock smart features like reimbursements, bill pay, invoice collection, and the Expensify Card.
                            </Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Turn on payments:</Text> Head to{' '}
                                            <Text style={styles.textBold}>Workspaces &gt; [Workspace Name] &gt; More features</Text>, click{' '}
                                            <Text style={styles.textBold}>Enable workflows</Text>, then toggle on <Text style={styles.textBold}>Make or track payments</Text>. From there, hit{' '}
                                            <Text style={styles.textBold}>Connect bank account</Text> to get started.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Connect your account:</Text> Use Plaid to link your account in seconds, or enter your details manually. You’ll need
                                            to upload an ID, add your company info, and verify the account with a few test transactions.
                                        </Text>
                                    </Text>,
                                    <>
                                        <Text style={styles.textBold}>Once your account is verified, you can:</Text>

                                        <BulletList
                                            styles={styles}
                                            items={[
                                                <Text style={styles.textNormal}>Reimburse employees via ACH</Text>,
                                                <Text style={styles.textNormal}>Pay vendors and suppliers</Text>,
                                                <Text style={styles.textNormal}>Issue Expensify Cards to your team</Text>,
                                                <Text style={styles.textNormal}>Collect invoice payments from clients</Text>,
                                            ]}
                                        />
                                    </>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Share access to the bank account with another admin:</Text> Under{' '}
                                        <Text style={styles.textBold}>Settings &gt; Account &gt; Wallet</Text>, click <Text style={styles.textBold}>Share</Text> next to the bank account, and
                                        enter the admin’s email. They’ll just need to revalidate the bank account on their end before they can issue payments.
                                    </Text>,
                                ]}
                            />

                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Personal Bank Accounts</Text>
                            <Text style={[styles.textNormal]}>
                                If you want to get reimbursed or paid directly in Expensify, add a personal bank account — Expensify supports banks in over 190 countries.
                            </Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Add your bank account</Text>: Under <Text style={styles.textBold}>Settings &gt; Wallet &gt; Bank accounts</Text>,
                                            click <Text style={styles.textBold}>Add bank account</Text>, choose your country, and connect via Plaid or enter your info manually.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Note:</Text> Personal bank accounts are for receiving funds only. You’ll need a verified business bank account to
                                            send payments or issue Expensify Cards.
                                        </Text>
                                    </Text>,
                                ]}
                            />

                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Assigned Cards</Text>
                            <Text style={[styles.textNormal]}>
                                Company cards are assigned at the workspace level, but are visible to the individual cardholder in their <Text style={styles.textBold}>Wallet</Text>. The
                                cards sync automatically, so you can skip manually entering credit card expenses.
                            </Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>See card details (Expensify Card):</Text> Click <Text style={styles.textBold}>Reveal details</Text> to check your
                                            card number, expiration date, and security code for online purchases.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Track expenses smarter:</Text> Transactions pull in automatically and match with SmartScanned receipts to keep
                                            records audit-ready.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>View transactions:</Text> Click on a connected card and then <Text style={styles.textBold}>View transactions</Text>{' '}
                                            to see all of the imported expenses from that company card.
                                        </Text>
                                    </Text>,
                                ]}
                            />

                            <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Learn More</Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/wallet-and-payments/Connect-a-Business-Bank-Account"
                                            style={styles.link}
                                        >
                                            Connect a Business Bank Account
                                        </TextLink>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/wallet-and-payments/Connect-a-Personal-Bank-Account"
                                            style={styles.link}
                                        >
                                            Connect a Personal Bank Account
                                        </TextLink>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <TextLink
                                            href="https://help.expensify.com/articles/new-expensify/expensify-card/Cardholder-Settings-and-Features"
                                            style={styles.link}
                                        >
                                            Expensify Cardholder Settings and Features
                                        </TextLink>
                                    </Text>,
                                ]}
                            />
                        </View>
                    ),
                },
            },
        },
        new: {
            children: {
                task: {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Tasks</Text>
                            <Text style={[styles.textNormal]}>
                                Keep conversations organized by letting you create actionable to-dos directly within a chat. You can assign them to yourself or others in both 1:1 and group
                                chats.
                            </Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Create a task:</Text> In any chat, click the + button next to the message field and select Assign a task. Add a
                                            title (required) and an optional description, and choose an assignee from chat participants. You can also leave it unassigned to track it
                                            yourself.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Use tasks to stay on top of action items:</Text> Tasks are great for follow-ups like “Submit expense report,” “Share
                                            slide deck,” or “Update mileage rate.” They’re perfect for 1:1 check-ins, project updates, or organizing next steps after a team discussion.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Edit and manage tasks:</Text> Task creators and assignees can comment, edit the title or description, reassign the
                                            task, or mark it as complete. Just click the task to update any details.
                                        </Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={[styles.textNormal]}>
                                            <Text style={styles.textBold}>Tasks stay visible:</Text> Each task is shared in the chat where it’s created. When completed, it will be clearly
                                            marked in the chat and can be reopened if needed.
                                        </Text>
                                    </Text>,
                                ]}
                            />
                        </View>
                    ),
                },
            },
        },
        search: {
            content: ({styles}: {styles: ThemeStyles}) => (
                <View>
                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Reports Page</Text>
                    <Text style={[styles.textNormal]}>
                        The Reports page helps you explore and filter all reports and related expenses. It complements the Inbox by giving you a complete view of your expense history and
                        what expenses and reports require your action. Use this page to create and download spending reports, track report actions, and view the recent expense activity on
                        your workspace(s).
                    </Text>

                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Expenses &amp; Reports</Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                <Text style={[styles.textNormal]}>
                                    <Text style={styles.textBold}>Managing expenses</Text>: Click on any expense row to see its details in a side panel. Use checkboxes to select multiple
                                    expenses, then use bulk actions like Move, Download, or Delete from the action menu.
                                </Text>
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={[styles.textNormal]}>
                                    <Text style={styles.textBold}>Filters</Text>: Looking for something specific? Use filters to narrow things down by date, category, merchant, tag,
                                    workspace, or report status. You can also combine filters with keywords for even more precise results.
                                </Text>
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={[styles.textNormal]}>
                                    <Text style={styles.textBold}>Sort reports by status</Text>: - Draft – Only you can see it - Outstanding – Waiting on someone else - Approved – Ready to
                                    pay - Done or Paid – All wrapped up
                                </Text>
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={[styles.textNormal]}>
                                    <Text style={styles.textBold}>Download what you need</Text>: Generate a report to download filtered expense data as a CSV. Perfect for spreadsheets,
                                    monthly close, or syncing with accounting.
                                </Text>
                            </Text>,
                        ]}
                    />

                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Chats</Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                <Text style={[styles.textNormal]}>
                                    <Text style={styles.textBold}>Viewing report previews</Text>: Each report preview shows up right in your workspace chat with the status, up to 10
                                    expenses, and buttons like Submit or Approve, depending on your role.
                                </Text>
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={[styles.textNormal]}>
                                    <Text style={styles.textBold}>Filter chats:</Text> Use filters to find the exact chat you’re looking for.
                                </Text>
                            </Text>,
                        ]}
                    />

                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>To-Do</Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                <Text style={[styles.textNormal]}>
                                    <Text style={styles.textBold}>Stay on top of tasks</Text>: The To-do section shows exactly what needs your attention. This is your go-to spot to keep
                                    things moving.
                                </Text>
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={[styles.textNormal]}>
                                    <Text style={styles.textBold}>Action items:</Text> Whether you need to submit, approve, or pay expenses, you can click the corresponding action to
                                    complete any outstanding to-dos.
                                </Text>
                            </Text>,
                        ]}
                    />

                    <Text style={[styles.textHeadlineH2, styles.mt4, styles.mb1]}>Learn More</Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                <TextLink
                                    href="https://help.expensify.com/articles/new-expensify/reports-and-expenses/Getting-Started-with-the-Reports-Page"
                                    style={styles.link}
                                >
                                    The Reports Page
                                </TextLink>
                            </Text>,
                            <Text style={styles.textNormal}>
                                <TextLink
                                    href="https://help.expensify.com/articles/new-expensify/reports-and-expenses/Understanding-Report-Statuses-and-Actions"
                                    style={styles.link}
                                >
                                    Understanding Reports Statuses and Actions
                                </TextLink>
                            </Text>,
                            <Text style={styles.textNormal}>
                                <TextLink
                                    href="https://help.expensify.com/articles/new-expensify/reports-and-expenses/Suggested-Search"
                                    style={styles.link}
                                >
                                    Suggested Search
                                </TextLink>
                            </Text>,
                            <Text style={styles.textNormal}>
                                <TextLink
                                    href="https://help.expensify.com/articles/new-expensify/reports-and-expenses/Search-and-Download-Expenses"
                                    style={styles.link}
                                >
                                    Search and Download Expenses
                                </TextLink>
                            </Text>,
                        ]}
                    />
                </View>
            ),
        },
    },
    content: () => null,
};

export default helpContentMap;
export type {ContentComponent};
