/* eslint-disable react/no-unescaped-entities */

/* eslint-disable @typescript-eslint/naming-convention */
import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import BulletList from '@components/SidePanel/HelpComponents/HelpBulletList';
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
        ':action': {
            children: {
                ':iouType': {
                    children: {
                        start: {
                            children: {
                                ':transactionID': {
                                    children: {
                                        ':reportID': {
                                            children: {
                                                scan: {
                                                    children: {
                                                        ':backToReport': {
                                                            content: ({styles}: {styles: ThemeStyles}) => (
                                                                <View>
                                                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Scan Receipt</Text>
                                                                    <Text style={[styles.textNormal]}>SmartScan automatically extracts expense details from receipt images.</Text>
                                                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>How to Scan</Text>

                                                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>What SmartScan Detects</Text>
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
                                                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Supported Receipt Types</Text>
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
                                                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Tips for Best Results</Text>
                                                                    <BulletList
                                                                        styles={styles}
                                                                        items={[
                                                                            <Text style={styles.textNormal}>Ensure receipt text is clear and readable</Text>,
                                                                            <Text style={styles.textNormal}>Include the full receipt in the image</Text>,
                                                                            <Text style={styles.textNormal}>Good lighting improves accuracy</Text>,
                                                                            <Text style={styles.textNormal}>Straight angles work better than tilted photos</Text>,
                                                                        ]}
                                                                    />
                                                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>After Scanning</Text>
                                                                    <BulletList
                                                                        styles={styles}
                                                                        items={[
                                                                            <Text style={styles.textNormal}>Review extracted details for accuracy</Text>,
                                                                            <Text style={styles.textNormal}>Add description, category, or tags as needed</Text>,
                                                                            <Text style={styles.textNormal}>SmartScan learns from your corrections</Text>,
                                                                        ]}
                                                                    />
                                                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Related Links</Text>
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
                                                    },
                                                },
                                                distance: {
                                                    children: {
                                                        ':backToReport': {
                                                            content: ({styles}: {styles: ThemeStyles}) => (
                                                                <View>
                                                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Distance Expense</Text>
                                                                    <Text style={[styles.textNormal]}>
                                                                        Easily track mileage costs using Expensify’s built-in map feature. Create and submit distance-based expenses right
                                                                        from the web, desktop, or mobile app.
                                                                    </Text>
                                                                    <BulletList
                                                                        styles={styles}
                                                                        items={[
                                                                            <Text style={styles.textNormal}>
                                                                                <Text style={[styles.textNormal]}>
                                                                                    <Text style={styles.textBold}>Create distance expenses:</Text> Click the green + button and choose Create
                                                                                    expense, then select Distance. Enter your starting point and destination. You can also add stops if
                                                                                    needed.
                                                                                </Text>
                                                                            </Text>,
                                                                            <Text style={styles.textNormal}>
                                                                                <Text style={[styles.textNormal]}>
                                                                                    <Text style={styles.textBold}>Submit for approval:</Text> Choose your workspace and confirm the distance,
                                                                                    amount, and date. Add optional notes or categories, then click Create expense to submit the mileage
                                                                                    expense for approval.
                                                                                </Text>
                                                                            </Text>,
                                                                            <Text style={styles.textNormal}>
                                                                                <Text style={[styles.textNormal]}>
                                                                                    <Text style={styles.textBold}>Log a round-trip:</Text> To log a round-trip, use the same location for both
                                                                                    start and finish, and include any stops along the way.
                                                                                </Text>
                                                                            </Text>,
                                                                        ]}
                                                                    />
                                                                </View>
                                                            ),
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
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
                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Chat</Text>
                    <Text style={[styles.textNormal]}>
                        Chat is the foundation of New Expensify. Every expense, expense report, workspace, or member has an associated “chat”, which you can use to record additional details,
                        or collaborate with others. Every chat has the following components:
                    </Text>
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Header</Text>
                    <Text style={[styles.textNormal]}>
                        This shows who you are chatting with (or what you are chatting about). You can press the header for more details on the chat, or additional actions to take upon it.
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
                                <Text style={styles.textBold}>Images & Documents</Text> – Insert photos, screenshots, movies, PDFs, or more, using copy/paste, drag/drop, or the attach
                                button.
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
                                <Text style={styles.textBold}>Markdown</Text> – Format text using <Text style={styles.textBold}>bold</Text>, <Text style={styles.textItalic}>italics</Text>,
                                and{' '}
                                <TextLink
                                    href="https://help.expensify.com/articles/new-expensify/chat/Send-and-format-chat-messages"
                                    style={styles.link}
                                >
                                    more
                                </TextLink>
                                .
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Mention</Text> – Invite or tag anyone in the world to any chat by putting an @ in front of their email address or phone number
                                (e.g., <Text style={styles.textBold}>@awong@marslink.web</Text>, or <Text style={styles.textBold}>@415-867-5309</Text>).
                            </Text>,
                        ]}
                    />

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
        settings: {
            children: {
                preferences: {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Preferences</Text>
                            <Text style={[styles.textNormal]}>Customize your Expensify experience with these preference settings:</Text>
                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Theme</Text>
                            <Text style={[styles.textNormal]}>Change the app’s appearance to suit your preference:</Text>
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
                            <Text style={[styles.textNormal, styles.mt4]}>
                                <Text style={styles.textBold}>To change your theme:</Text>
                            </Text>

                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Language</Text>
                            <Text style={[styles.textNormal]}>Expensify supports multiple languages including:</Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>English, Español, Deutsch, Français, Italiano</Text>,
                                    <Text style={styles.textNormal}>日本語, Nederlands, Polski, Português (BR)</Text>,
                                    <Text style={styles.textNormal}>中文 (简体)</Text>,
                                ]}
                            />
                            <Text style={[styles.textNormal, styles.mt4]}>
                                <Text style={styles.textBold}>To change your language:</Text>
                            </Text>

                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Notifications</Text>
                            <Text style={[styles.textNormal]}>Control how and when you receive updates:</Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Receive relevant feature updates and Expensify news</Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Mute all sounds from Expensify</Text>
                                    </Text>,
                                ]}
                            />
                            <Text style={[styles.textNormal, styles.mt4]}>
                                <Text style={styles.textBold}>To manage notifications:</Text>
                            </Text>

                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Payment Currency</Text>
                            <Text style={[styles.textNormal]}>Set your default currency for expense tracking and reimbursements.</Text>

                            <Text style={[styles.textNormal]}>
                                <Text style={styles.textBold}>Note:</Text> Preference changes only affect your personal account view. Workspace members must update their own settings
                                individually.
                            </Text>
                        </View>
                    ),
                },
                wallet: {
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Business Bank Accounts</Text>
                            <Text style={[styles.textNormal]}>
                                Connect a verified business bank account to unlock payment features like reimbursements, bill pay, invoice collections, and Expensify Card issuance. Supported
                                currencies: USD, CAD, GBP, EUR, and AUD.
                            </Text>
                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Getting Started</Text>
                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Enable Payment Features</Text>

                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Connect Your Bank Account</Text>

                            <Text style={[styles.textHeadlineH2, styles.mv4]}>What You Can Do</Text>
                            <Text style={[styles.textNormal]}>Once your account is verified, you’ll be able to:</Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Reimburse employees</Text> via ACH
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Pay vendors and suppliers</Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Issue Expensify Cards</Text> to your team
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Collect invoice payments</Text> from clients
                                    </Text>,
                                ]}
                            />
                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Sharing Access</Text>

                            <Text style={[styles.textNormal]}>
                                <Text style={styles.textBold}>Heads up:</Text> Your bank account must be fully verified before any payment features go live. The process usually takes 1–2
                                business days.
                            </Text>

                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Personal Bank Accounts</Text>
                            <Text style={[styles.textNormal]}>
                                Add your personal bank account to get reimbursed or paid — no paper checks, no waiting around. Expensify supports banks in over 190 countries.
                            </Text>
                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Adding a Personal Bank Account</Text>

                            <Text style={[styles.textHeadlineH2, styles.mv4]}>What You Can Do</Text>
                            <BulletList
                                styles={styles}
                                items={[
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Get reimbursed</Text> for expense reports
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Receive invoice payments</Text>
                                    </Text>,
                                    <Text style={styles.textNormal}>
                                        <Text style={styles.textBold}>Use multi-currency support</Text> to get paid in your local currency
                                    </Text>,
                                ]}
                            />

                            <Text style={[styles.textNormal]}>
                                <Text style={styles.textBold}>Heads up:</Text> Personal accounts are for receiving funds only. If you want to send payments or issue Expensify Cards, you’ll
                                need to connect a verified business bank account.
                            </Text>
                        </View>
                    ),
                },
            },
            content: ({styles}: {styles: ThemeStyles}) => (
                <View>
                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Settings</Text>
                    <Text style={[styles.textNormal]}>Here is where you configure Expensify exactly to your specifications:</Text>
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
                                    <Text style={[styles.textNormal]}>Connect your workspace to accounting software to sync expenses and streamline financial management.</Text>
                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Supported Integrations</Text>
                                    <Text style={[styles.textNormal]}>
                                        <Text style={styles.textBold}>QuickBooks Online</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>Real-time expense sync</Text>,
                                            <Text style={styles.textNormal}>Category and vendor mapping</Text>,
                                            <Text style={styles.textNormal}>Tax rate synchronization</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textNormal, styles.mt4]}>
                                        <Text style={styles.textBold}>QuickBooks Desktop</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>File-based import/export</Text>,
                                            <Text style={styles.textNormal}>Chart of accounts import</Text>,
                                            <Text style={styles.textNormal}>Custom field mapping</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textNormal, styles.mt4]}>
                                        <Text style={styles.textBold}>Xero</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>Automatic report sync</Text>,
                                            <Text style={styles.textNormal}>Tracking category import</Text>,
                                            <Text style={styles.textNormal}>Tax rate management</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textNormal, styles.mt4]}>
                                        <Text style={styles.textBold}>NetSuite</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>Advanced multi-entity support</Text>,
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
                                            <Text style={styles.textNormal}>Department/class tracking</Text>,
                                            <Text style={styles.textNormal}>Multi-currency support</Text>,
                                            <Text style={styles.textNormal}>Advanced approval workflows</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Getting Started</Text>

                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>What Gets Synced</Text>
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
                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Related Links</Text>
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
                        members: {
                            content: ({styles}: {styles: ThemeStyles}) => (
                                <View>
                                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Workspace Members</Text>
                                    <Text style={[styles.textNormal]}>Manage team access, roles, and permissions for your workspace.</Text>
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
                                            <Text style={styles.textNormal}>Add comments but cannot modify expenses</Text>,
                                            <Text style={styles.textNormal}>No approval or payment permissions</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Adding Members</Text>

                                    <Text style={[styles.textNormal]}>
                                        <Text style={styles.textBold}>Alternative:</Text> Share workspace URL or QR code from{' '}
                                        <Text style={styles.textBold}>Settings &gt Profile &gt Share</Text>
                                    </Text>
                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Managing Members</Text>
                                    <Text style={[styles.textNormal]}>
                                        <Text style={styles.textBold}>Change Role:</Text>
                                    </Text>

                                    <Text style={[styles.textNormal]}>
                                        <Text style={styles.textBold}>Remove Member:</Text>
                                    </Text>

                                    <Text style={[styles.textNormal]}>
                                        <Text style={styles.textBold}>Bulk Actions:</Text>
                                    </Text>
                                    <BulletList
                                        styles={styles}
                                        items={[
                                            <Text style={styles.textNormal}>Select multiple members with checkboxes</Text>,
                                            <Text style={styles.textNormal}>Use dropdown to remove or modify multiple members</Text>,
                                        ]}
                                    />
                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Transfer Ownership</Text>

                                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Related Links</Text>
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
                    },
                    content: ({styles}: {styles: ThemeStyles}) => (
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.mv4]}>Workspace</Text>
                            <Text style={[styles.textNormal]}>This is where you configure all the settings of the many features associated with your workspace.</Text>
                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Default features</Text>
                            <Text style={[styles.textNormal]}>Here are the features that are enabled by default:</Text>
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
                            <Text style={[styles.textHeadlineH2, styles.mv4]}>Optional features</Text>
                            <Text style={[styles.textNormal]}>These can be enabled via More Features:</Text>
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
                        </View>
                    ),
                },
            },
            content: ({styles}: {styles: ThemeStyles}) => (
                <View>
                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Workspaces</Text>
                    <Text style={[styles.textNormal]}>
                        Workspaces help you manage company expenses, enforce policies, and integrate with accounting software. Each workspace has its own rules, settings, and features.
                    </Text>
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Creating a Workspace</Text>
                    <Text style={[styles.textNormal]}>
                        <Text style={styles.textBold}>To create a new workspace:</Text>
                    </Text>

                    <Text style={[styles.textNormal]}>
                        <Text style={styles.textBold}>Your first workspace includes:</Text>
                    </Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>Free 30-day trial</Text>,
                            <Text style={styles.textNormal}>Access to Setup Specialist via #admins chat room</Text>,
                            <Text style={styles.textNormal}>Help from Concierge in your Inbox</Text>,
                        ]}
                    />
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Managing Members</Text>
                    <Text style={[styles.textNormal]}>
                        <Text style={styles.textBold}>To invite team members:</Text>
                    </Text>

                    <Text style={[styles.textNormal]}>
                        <Text style={styles.textBold}>Member vs Admin roles:</Text>
                    </Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Members</Text> can submit their own reports and approve assigned reports
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Admins</Text> can approve all workspace reports, view all reports, and edit workspace settings
                            </Text>,
                        ]}
                    />
                    <Text style={[styles.textNormal, styles.mt4]}>
                        <Text style={styles.textBold}>To assign admin roles:</Text>
                    </Text>

                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Key Features</Text>
                    <Text style={[styles.textNormal, styles.mb4]}>
                        <Text style={styles.textBold}>Categories</Text> - Organize and track expenses (imported automatically if connected to accounting software)
                    </Text>
                    <Text style={[styles.textNormal]}>
                        <Text style={styles.textBold}>Approval Workflows</Text> - Automate expense report reviews:
                    </Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                Toggle <Text style={styles.textBold}>Add Approvals</Text> on under <Text style={styles.textBold}>Workflows</Text>
                            </Text>,
                            <Text style={styles.textNormal}>Set a default first approver for all expenses</Text>,
                            <Text style={styles.textNormal}>Create custom workflows for specific members</Text>,
                        ]}
                    />
                    <Text style={[styles.textNormal, styles.mt4]}>
                        <Text style={styles.textBold}>Accounting Integrations</Text> - Connect to:
                    </Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>QuickBooks Online</Text>,
                            <Text style={styles.textNormal}>Xero</Text>,
                            <Text style={styles.textNormal}>NetSuite</Text>,
                            <Text style={styles.textNormal}>Sage Intacct</Text>,
                        ]}
                    />
                    <Text style={[styles.textNormal, styles.mt4]}>
                        <Text style={styles.textBold}>Additional Features</Text> (enable via <Text style={styles.textBold}>More Features</Text>):
                    </Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>Expensify Cards for company spending</Text>,
                            <Text style={styles.textNormal}>Distance tracking for mileage</Text>,
                            <Text style={styles.textNormal}>Tags for detailed expense coding</Text>,
                            <Text style={styles.textNormal}>Company card connections</Text>,
                        ]}
                    />
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Workspace Settings</Text>
                    <Text style={[styles.textNormal]}>
                        Access all workspace configuration from the <Text style={styles.textBold}>Workspaces</Text> tab:
                    </Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Overview</Text> - Name, currency, description, and sharing options
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Members</Text> - Invite, remove, and manage member roles
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Categories</Text> - Add and organize expense categories
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>Workflows</Text> - Set up approval and payment processes
                            </Text>,
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>More Features</Text> - Enable additional workspace capabilities
                            </Text>,
                        ]}
                    />

                    <Text style={[styles.textNormal]}>
                        <Text style={styles.textBold}>Tip:</Text> Use the <Text style={styles.textBold}>Share</Text> option on your workspace profile to get an invite link or QR code for
                        easy member onboarding.
                    </Text>
                </View>
            ),
        },
        search: {
            content: ({styles}: {styles: ThemeStyles}) => (
                <View>
                    <Text style={[styles.textHeadlineH1, styles.mv4]}>Reports</Text>
                    <Text style={[styles.textNormal]}>Virtually all data can be analyzed and reported upon in the Reports page. The major elements of this page include:</Text>
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Data type</Text>
                    <Text style={[styles.textNormal]}>Start first by choosing the type of data you want to analyze, which can be:</Text>
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
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Search</Text>
                    <Text style={[styles.textNormal]}>A quick method of narrowing the results by keyword or more.</Text>
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>State filter</Text>
                    <Text style={[styles.textNormal]}>Simple methods to filter the results by “state”, including:</Text>
                    <BulletList
                        styles={styles}
                        items={[
                            <Text style={styles.textNormal}>
                                <Text style={styles.textBold}>All</Text>
                            </Text>,
                            <>
                                <Text style={styles.textBold}>Expenses/Expense/Invoices reports:</Text>

                                <BulletList
                                    styles={styles}
                                    items={[
                                        <Text style={styles.textNormal}>Draft - Only you can see that hasn’t been shared yet.</Text>,
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
                                    items={[<Text style={styles.textNormal}>Current - Happening or in the future.</Text>, <Text style={styles.textNormal}>Past - Already happened.</Text>]}
                                />
                            </>,
                        ]}
                    />
                    <Text style={[styles.textHeadlineH2, styles.mv4]}>Results</Text>
                    <Text style={[styles.textNormal]}>The core of the Reports page are the search results themselves.</Text>
                    <BulletList
                        styles={styles}
                        items={[<Text style={styles.textNormal}>Select a row to see additional options.</Text>, <Text style={styles.textNormal}>Tap on a row to see more detail.</Text>]}
                    />
                </View>
            ),
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
                                <Text style={styles.textBold}>Images & Documents</Text> via copy/paste, drag/drop, or attach button
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
                        <Text style={styles.textBold}>Tip:</Text> Navigation is consistent across web, mobile, and desktop versions of Expensify.
                    </Text>
                </View>
            ),
        },
    },
    content: () => null,
};

export default helpContentMap;
export type {ContentComponent};
