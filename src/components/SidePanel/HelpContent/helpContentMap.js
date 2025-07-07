"use strict";
/* eslint-disable react/no-unescaped-entities */
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HelpBulletList_1 = require("@components/SidePanel/HelpComponents/HelpBulletList");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var helpContentMap = {
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
                                                            content: function (_a) {
                                                                var styles = _a.styles;
                                                                return (<react_native_1.View>
                                                                    <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Scan Receipt</Text_1.default>
                                                                    <Text_1.default style={[styles.textNormal]}>SmartScan automatically extracts expense details from receipt images.</Text_1.default>
                                                                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>How to Scan</Text_1.default>

                                                                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>What SmartScan Detects</Text_1.default>
                                                                    <HelpBulletList_1.default styles={styles} items={[
                                                                        <Text_1.default style={styles.textNormal}>
                                                                                <Text_1.default style={styles.textBold}>Amount</Text_1.default> and currency
                                                                            </Text_1.default>,
                                                                        <Text_1.default style={styles.textNormal}>
                                                                                <Text_1.default style={styles.textBold}>Merchant</Text_1.default> name and location
                                                                            </Text_1.default>,
                                                                        <Text_1.default style={styles.textNormal}>
                                                                                <Text_1.default style={styles.textBold}>Date</Text_1.default> of purchase
                                                                            </Text_1.default>,
                                                                        <Text_1.default style={styles.textNormal}>
                                                                                <Text_1.default style={styles.textBold}>Tax</Text_1.default> information (when visible)
                                                                            </Text_1.default>,
                                                                        <Text_1.default style={styles.textNormal}>
                                                                                <Text_1.default style={styles.textBold}>Category</Text_1.default> suggestions based on merchant type
                                                                            </Text_1.default>,
                                                                    ]}/>
                                                                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Supported Receipt Types</Text_1.default>
                                                                    <HelpBulletList_1.default styles={styles} items={[
                                                                        <Text_1.default style={styles.textNormal}>
                                                                                <Text_1.default style={styles.textBold}>Photos</Text_1.default> - Take with your device camera
                                                                            </Text_1.default>,
                                                                        <Text_1.default style={styles.textNormal}>
                                                                                <Text_1.default style={styles.textBold}>Email receipts</Text_1.default> - Forward to receipts@expensify.com
                                                                            </Text_1.default>,
                                                                        <Text_1.default style={styles.textNormal}>
                                                                                <Text_1.default style={styles.textBold}>PDF receipts</Text_1.default> - Upload from your device
                                                                            </Text_1.default>,
                                                                        <Text_1.default style={styles.textNormal}>
                                                                                <Text_1.default style={styles.textBold}>Screenshots</Text_1.default> - From apps or websites
                                                                            </Text_1.default>,
                                                                    ]}/>
                                                                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Tips for Best Results</Text_1.default>
                                                                    <HelpBulletList_1.default styles={styles} items={[
                                                                        <Text_1.default style={styles.textNormal}>Ensure receipt text is clear and readable</Text_1.default>,
                                                                        <Text_1.default style={styles.textNormal}>Include the full receipt in the image</Text_1.default>,
                                                                        <Text_1.default style={styles.textNormal}>Good lighting improves accuracy</Text_1.default>,
                                                                        <Text_1.default style={styles.textNormal}>Straight angles work better than tilted photos</Text_1.default>,
                                                                    ]}/>
                                                                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>After Scanning</Text_1.default>
                                                                    <HelpBulletList_1.default styles={styles} items={[
                                                                        <Text_1.default style={styles.textNormal}>Review extracted details for accuracy</Text_1.default>,
                                                                        <Text_1.default style={styles.textNormal}>Add description, category, or tags as needed</Text_1.default>,
                                                                        <Text_1.default style={styles.textNormal}>SmartScan learns from your corrections</Text_1.default>,
                                                                    ]}/>
                                                                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Related Links</Text_1.default>
                                                                    <HelpBulletList_1.default styles={styles} items={[
                                                                        <Text_1.default style={styles.textNormal}>
                                                                                <TextLink_1.default href="https://help.expensify.com/articles/new-expensify/reports-and-expenses/Create-an-Expense" style={styles.link}>
                                                                                    Create an Expense
                                                                                </TextLink_1.default>
                                                                            </Text_1.default>,
                                                                        <Text_1.default style={styles.textNormal}>
                                                                                <TextLink_1.default href="https://help.expensify.com/articles/new-expensify/getting-started/Free-Features-in-Expensify" style={styles.link}>
                                                                                    Free Features in Expensify
                                                                                </TextLink_1.default>
                                                                            </Text_1.default>,
                                                                    ]}/>
                                                                </react_native_1.View>);
                                                            },
                                                        },
                                                    },
                                                },
                                                distance: {
                                                    children: {
                                                        ':backToReport': {
                                                            content: function (_a) {
                                                                var styles = _a.styles;
                                                                return (<react_native_1.View>
                                                                    <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Distance Expense</Text_1.default>
                                                                    <Text_1.default style={[styles.textNormal]}>
                                                                        Easily track mileage costs using Expensify’s built-in map feature. Create and submit distance-based expenses right
                                                                        from the web, desktop, or mobile app.
                                                                    </Text_1.default>
                                                                    <HelpBulletList_1.default styles={styles} items={[
                                                                        <Text_1.default style={styles.textNormal}>
                                                                                <Text_1.default style={[styles.textNormal]}>
                                                                                    <Text_1.default style={styles.textBold}>Create distance expenses:</Text_1.default> Click the green + button and choose Create
                                                                                    expense, then select Distance. Enter your starting point and destination. You can also add stops if
                                                                                    needed.
                                                                                </Text_1.default>
                                                                            </Text_1.default>,
                                                                        <Text_1.default style={styles.textNormal}>
                                                                                <Text_1.default style={[styles.textNormal]}>
                                                                                    <Text_1.default style={styles.textBold}>Submit for approval:</Text_1.default> Choose your workspace and confirm the distance,
                                                                                    amount, and date. Add optional notes or categories, then click Create expense to submit the mileage
                                                                                    expense for approval.
                                                                                </Text_1.default>
                                                                            </Text_1.default>,
                                                                        <Text_1.default style={styles.textNormal}>
                                                                                <Text_1.default style={[styles.textNormal]}>
                                                                                    <Text_1.default style={styles.textBold}>Log a round-trip:</Text_1.default> To log a round-trip, use the same location for both
                                                                                    start and finish, and include any stops along the way.
                                                                                </Text_1.default>
                                                                            </Text_1.default>,
                                                                    ]}/>
                                                                </react_native_1.View>);
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
        },
        r: {
            children: {
                ':concierge': {
                    content: function (_a) {
                        var styles = _a.styles;
                        return (<react_native_1.View>
                            <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Concierge</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>
                                Concierge is available 24/7 to answer any question you have about anything — whether that’s how to get set up, how to fix a problem, or general best
                                practices. Concierge is a bot, but it’s really smart and can escalate you to a human whenever you want. Say hi — it’s friendly!
                            </Text_1.default>
                        </react_native_1.View>);
                    },
                },
                ':expense': {
                    children: {
                        ':scan': {
                            content: function (_a) {
                                var styles = _a.styles;
                                return (<react_native_1.View>
                                    <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Scanned</Text_1.default>
                                    <Text_1.default style={[styles.textNormal]}>A “scanned” expense was created by extracting the relevant details using the Concierge AI.</Text_1.default>
                                </react_native_1.View>);
                            },
                        },
                        ':manual': {
                            content: function (_a) {
                                var styles = _a.styles;
                                return (<react_native_1.View>
                                    <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Manual</Text_1.default>
                                    <Text_1.default style={[styles.textNormal]}>
                                        A “manual” expense has had all its details specified by the workspace member. It was not imported from any system, or scanned from a receipt.
                                    </Text_1.default>
                                </react_native_1.View>);
                            },
                        },
                        ':pendingExpensifyCard': {
                            content: function (_a) {
                                var styles = _a.styles;
                                return (<react_native_1.View>
                                    <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Expensify Card (pending)</Text_1.default>
                                    <Text_1.default style={[styles.textNormal, styles.mb4]}>
                                        A “pending” Expensify Card expense represents a purchase that was recently made on the card, but has not yet “posted” – meaning, it has not been
                                        formally recognized as a final, complete transaction.
                                    </Text_1.default>
                                    <Text_1.default style={[styles.textNormal, styles.mb4]}>Any changes made to this expense will be preserved when the expense posts, typically 2-7 days later.</Text_1.default>
                                    <Text_1.default style={[styles.textNormal]}>Pending transactions cannot be approved, as the final expense amount will not be confirmed until it posts.</Text_1.default>
                                </react_native_1.View>);
                            },
                        },
                        ':expensifyCard': {
                            content: function (_a) {
                                var styles = _a.styles;
                                return (<react_native_1.View>
                                    <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Expensify Card</Text_1.default>
                                    <Text_1.default style={[styles.textNormal, styles.mb4]}>An “Expensify Card” expense corresponds to a “posted” (meaning, finalized by the bank) purchase.</Text_1.default>
                                    <Text_1.default style={[styles.textNormal]}>
                                        Expensify Card expenses cannot be reimbursed as they are centrally paid by the bank account linked to the workspace.
                                    </Text_1.default>
                                </react_native_1.View>);
                            },
                        },
                    },
                    content: function (_a) {
                        var styles = _a.styles;
                        return (<react_native_1.View>
                            <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Expense</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>Every expense gets a dedicated chat to discuss that specific expense. The expense consists of:</Text_1.default>
                            <HelpBulletList_1.default styles={styles} items={[
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Receipt</Text_1.default> – Attach a photo or document to this expense.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Amount</Text_1.default> – The financial total of this transaction.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Description</Text_1.default> – A general explanation of what this expense was for.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Merchant</Text_1.default> – The business this purchase was made at.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Date</Text_1.default> – The day on which the purchase was made.
                                    </Text_1.default>,
                            ]}/>
                            <Text_1.default style={[styles.textNormal, styles.mt4]}>
                                The expense chat is shared with everyone in the approval flow, and will maintain an audit trail of all historical changes.
                            </Text_1.default>
                        </react_native_1.View>);
                    },
                },
                ':policyAdmins': {
                    content: function (_a) {
                        var styles = _a.styles;
                        return (<react_native_1.View>
                            <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>#admins</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>
                                Every workspace automatically receives a special #admins chat room. Every admin is automatically added to this room as a member. The #admins room is used for
                                several purposes:
                            </Text_1.default>
                            <HelpBulletList_1.default styles={styles} items={[
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={[styles.textNormal]}>
                                            <Text_1.default style={styles.textBold}>Talking with Concierge, your setup specialist, or your account manager</Text_1.default> – When you first create the workspace,
                                            Concierge and a setup specialist will be added. Feel free to ask any setup questions you have about how to configure the workspace, onboard your
                                            team, connect your accounting, or anything else you might need.
                                        </Text_1.default>
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={[styles.textNormal]}>
                                            <Text_1.default style={styles.textBold}>Monitoring workspace changes</Text_1.default> – Every #admins room shows an audit trail of any configuration changes or
                                            significant events happening inside the workspace.
                                        </Text_1.default>
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={[styles.textNormal]}>
                                            <Text_1.default style={styles.textBold}>Chatting with other admins</Text_1.default> – The #admins room is a useful space for workspace admins to chat with each other
                                            about anything, whether or not it relates to Expensify.
                                        </Text_1.default>
                                    </Text_1.default>,
                            ]}/>
                        </react_native_1.View>);
                    },
                },
                ':expenseReport': {
                    content: function (_a) {
                        var styles = _a.styles;
                        return (<react_native_1.View>
                            <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Expense Report</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>Every expense report gets a dedicated chat to discuss expenses, approvals, or anything you like. The expense report chat:</Text_1.default>
                            <HelpBulletList_1.default styles={styles} items={[
                                <Text_1.default style={styles.textNormal}>Is shared with everyone in the approval flow configured inside the workspace.</Text_1.default>,
                                <Text_1.default style={styles.textNormal}>Will maintain an audit trail of all historical workflow actions (i.e., approvals).</Text_1.default>,
                            ]}/>
                            <Text_1.default style={[styles.textNormal, styles.mt4]}>
                                Press the attach button to add more expenses, or press the header for more options. Press on any expense to go deeper.
                            </Text_1.default>
                        </react_native_1.View>);
                    },
                },
                ':policyExpenseChat': {
                    content: function (_a) {
                        var styles = _a.styles;
                        return (<react_native_1.View>
                            <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Workspace</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>
                                Every workspace member gets a special chat between them and all workspace admins. This is a good place for workspace members to ask questions about expense
                                policy, for workspace admins to explain changes, or for any “formal” conversation to occur between members and admins. Press the attach button to:
                            </Text_1.default>
                            <HelpBulletList_1.default styles={styles} items={[
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Create expense</Text_1.default> – This will submit an expense to the workspace for reimbursement.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Split expense</Text_1.default> – This will split an expense between the member and the workspace (e.g., for a business meal that
                                        brings a spouse).
                                    </Text_1.default>,
                            ]}/>
                            <Text_1.default style={[styles.textNormal, styles.mt4]}>All past expense reports are processed here and stored for historical reference.</Text_1.default>
                        </react_native_1.View>);
                    },
                },
                ':policyAnnounce': {
                    content: function (_a) {
                        var styles = _a.styles;
                        return (<react_native_1.View>
                            <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Announce Room (#announce)</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>
                                The #announce room is a chat space available to all workspace members. It’s perfect for sharing company-wide updates, policy changes, or event reminders. The
                                #announce room is accessible from your <Text_1.default style={styles.textBold}>Inbox</Text_1.default> in the left-hand menu.
                            </Text_1.default>
                            <HelpBulletList_1.default styles={styles} items={[
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={[styles.textNormal]}>
                                            <Text_1.default style={styles.textBold}>Post company-wide announcements:</Text_1.default> All members can post in #announce by default, making it easy to communicate
                                            across the workspace.
                                        </Text_1.default>
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={[styles.textNormal]}>
                                            <Text_1.default style={styles.textBold}>Restrict posting to admins:</Text_1.default> Workspace admins can limit posting to admins only. Open the #announce room, click
                                            the room header, select Settings, and change Who can post to Admins only.
                                        </Text_1.default>
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={[styles.textNormal]}>
                                            <Text_1.default style={styles.textBold}>Everyone can read messages:</Text_1.default> Even if posting is limited to admins, all workspace members can still view
                                            messages in the #announce room.
                                        </Text_1.default>
                                    </Text_1.default>,
                            ]}/>
                        </react_native_1.View>);
                    },
                },
            },
            content: function (_a) {
                var styles = _a.styles;
                return (<react_native_1.View>
                    <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Chat</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>
                        Chat is the foundation of New Expensify. Every expense, expense report, workspace, or member has an associated “chat”, which you can use to record additional details,
                        or collaborate with others. Every chat has the following components:
                    </Text_1.default>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Header</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>
                        This shows who you are chatting with (or what you are chatting about). You can press the header for more details on the chat, or additional actions to take upon it.
                    </Text_1.default>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Comments</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>The core of the chat are its comments, which come in many forms:</Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Text</Text_1.default> – Rich text messages stored securely and delivered via web, app, email, or SMS.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Images & Documents</Text_1.default> – Insert photos, screenshots, movies, PDFs, or more, using copy/paste, drag/drop, or the attach
                                button.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Expenses</Text_1.default> – Share an expense in the chat, either to simply track and document it, or to submit for reimbursement.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Tasks</Text_1.default> – Record a task, and optionally assign it to someone (or yourself!).
                            </Text_1.default>,
                    ]}/>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Actions</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>Hover (or long press) on a comment to see additional options, including:</Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>React</Text_1.default> – Throw a ♥️😂🔥 like on anything!
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Reply in thread</Text_1.default> – Go deeper by creating a new chat on any comment.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Mark unread</Text_1.default> – Flag it for reading later, at your convenience.
                            </Text_1.default>,
                    ]}/>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Composer</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>Use the composer at the bottom to write new messages:</Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Markdown</Text_1.default> – Format text using <Text_1.default style={styles.textBold}>bold</Text_1.default>, <Text_1.default style={styles.textItalic}>italics</Text_1.default>,
                                and{' '}
                                <TextLink_1.default href="https://help.expensify.com/articles/new-expensify/chat/Send-and-format-chat-messages" style={styles.link}>
                                    more
                                </TextLink_1.default>
                                .
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Mention</Text_1.default> – Invite or tag anyone in the world to any chat by putting an @ in front of their email address or phone number
                                (e.g., <Text_1.default style={styles.textBold}>@awong@marslink.web</Text_1.default>, or <Text_1.default style={styles.textBold}>@415-867-5309</Text_1.default>).
                            </Text_1.default>,
                    ]}/>

                    <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Inbox</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>The Inbox is a prioritized “to do” list, highlighting exactly what you need to do next. It consists of:</Text_1.default>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Priorities</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>At the top of the Inbox are the most important tasks you should do first, which include:</Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>Expense reports waiting on you</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Tasks assigned to you</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Chats that have mentioned you</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Anything you have pinned</Text_1.default>,
                    ]}/>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Chats</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>Beneath the priorities are a list of chats (with unread chats highlighted in bold), in one of two view modes:</Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Most Recent</Text_1.default> – Lists every chat, ordered by whichever was most recently active.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Focus</Text_1.default> – Only lists chats with unread messages, sorted alphabetically.
                            </Text_1.default>,
                    ]}/>
                </react_native_1.View>);
            },
        },
        settings: {
            children: {
                preferences: {
                    content: function (_a) {
                        var styles = _a.styles;
                        return (<react_native_1.View>
                            <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Preferences</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>Customize your Expensify experience with these preference settings:</Text_1.default>
                            <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Theme</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>Change the app’s appearance to suit your preference:</Text_1.default>
                            <HelpBulletList_1.default styles={styles} items={[
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Dark Mode</Text_1.default> - Easy on the eyes in low-light environments
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Light Mode</Text_1.default> - Bright, clean interface for well-lit spaces
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Use Device Settings</Text_1.default> - Automatically match your device’s theme
                                    </Text_1.default>,
                            ]}/>
                            <Text_1.default style={[styles.textNormal, styles.mt4]}>
                                <Text_1.default style={styles.textBold}>To change your theme:</Text_1.default>
                            </Text_1.default>

                            <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Language</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>Expensify supports multiple languages including:</Text_1.default>
                            <HelpBulletList_1.default styles={styles} items={[
                                <Text_1.default style={styles.textNormal}>English, Español, Deutsch, Français, Italiano</Text_1.default>,
                                <Text_1.default style={styles.textNormal}>日本語, Nederlands, Polski, Português (BR)</Text_1.default>,
                                <Text_1.default style={styles.textNormal}>中文 (简体)</Text_1.default>,
                            ]}/>
                            <Text_1.default style={[styles.textNormal, styles.mt4]}>
                                <Text_1.default style={styles.textBold}>To change your language:</Text_1.default>
                            </Text_1.default>

                            <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Notifications</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>Control how and when you receive updates:</Text_1.default>
                            <HelpBulletList_1.default styles={styles} items={[
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Receive relevant feature updates and Expensify news</Text_1.default>
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Mute all sounds from Expensify</Text_1.default>
                                    </Text_1.default>,
                            ]}/>
                            <Text_1.default style={[styles.textNormal, styles.mt4]}>
                                <Text_1.default style={styles.textBold}>To manage notifications:</Text_1.default>
                            </Text_1.default>

                            <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Payment Currency</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>Set your default currency for expense tracking and reimbursements.</Text_1.default>

                            <Text_1.default style={[styles.textNormal]}>
                                <Text_1.default style={styles.textBold}>Note:</Text_1.default> Preference changes only affect your personal account view. Workspace members must update their own settings
                                individually.
                            </Text_1.default>
                        </react_native_1.View>);
                    },
                },
                wallet: {
                    content: function (_a) {
                        var styles = _a.styles;
                        return (<react_native_1.View>
                            <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Business Bank Accounts</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>
                                Connect a verified business bank account to unlock payment features like reimbursements, bill pay, invoice collections, and Expensify Card issuance. Supported
                                currencies: USD, CAD, GBP, EUR, and AUD.
                            </Text_1.default>
                            <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Getting Started</Text_1.default>
                            <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Enable Payment Features</Text_1.default>

                            <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Connect Your Bank Account</Text_1.default>

                            <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>What You Can Do</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>Once your account is verified, you’ll be able to:</Text_1.default>
                            <HelpBulletList_1.default styles={styles} items={[
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Reimburse employees</Text_1.default> via ACH
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Pay vendors and suppliers</Text_1.default>
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Issue Expensify Cards</Text_1.default> to your team
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Collect invoice payments</Text_1.default> from clients
                                    </Text_1.default>,
                            ]}/>
                            <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Sharing Access</Text_1.default>

                            <Text_1.default style={[styles.textNormal]}>
                                <Text_1.default style={styles.textBold}>Heads up:</Text_1.default> Your bank account must be fully verified before any payment features go live. The process usually takes 1–2
                                business days.
                            </Text_1.default>

                            <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Personal Bank Accounts</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>
                                Add your personal bank account to get reimbursed or paid — no paper checks, no waiting around. Expensify supports banks in over 190 countries.
                            </Text_1.default>
                            <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Adding a Personal Bank Account</Text_1.default>

                            <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>What You Can Do</Text_1.default>
                            <HelpBulletList_1.default styles={styles} items={[
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Get reimbursed</Text_1.default> for expense reports
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Receive invoice payments</Text_1.default>
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Use multi-currency support</Text_1.default> to get paid in your local currency
                                    </Text_1.default>,
                            ]}/>

                            <Text_1.default style={[styles.textNormal]}>
                                <Text_1.default style={styles.textBold}>Heads up:</Text_1.default> Personal accounts are for receiving funds only. If you want to send payments or issue Expensify Cards, you’ll
                                need to connect a verified business bank account.
                            </Text_1.default>
                        </react_native_1.View>);
                    },
                },
            },
            content: function (_a) {
                var styles = _a.styles;
                return (<react_native_1.View>
                    <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Settings</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>Here is where you configure Expensify exactly to your specifications:</Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Profile</Text_1.default> - Configure how you appear to others.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Wallet</Text_1.default> - See and manage your credit cards and bank accounts.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Preferences</Text_1.default> - Adjust how the app works for you.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Security</Text_1.default> - Lock down how you and others access your account.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Workspaces</Text_1.default> - Organize expenses for yourself and share with others.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Subscriptions</Text_1.default> - Manage payment details and history.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Domains</Text_1.default> - Advanced security and corporate card configuration.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Switch to Expensify Classic</Text_1.default> - Battle tested and reliable.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Save the World</Text_1.default> - Let Expensify.org help your favorite teacher!
                            </Text_1.default>,
                    ]}/>
                </react_native_1.View>);
            },
        },
        workspaces: {
            children: {
                ':policyID': {
                    children: {
                        accounting: {
                            content: function (_a) {
                                var styles = _a.styles;
                                return (<react_native_1.View>
                                    <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Accounting Integrations</Text_1.default>
                                    <Text_1.default style={[styles.textNormal]}>Connect your workspace to accounting software to sync expenses and streamline financial management.</Text_1.default>
                                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Supported Integrations</Text_1.default>
                                    <Text_1.default style={[styles.textNormal]}>
                                        <Text_1.default style={styles.textBold}>QuickBooks Online</Text_1.default>
                                    </Text_1.default>
                                    <HelpBulletList_1.default styles={styles} items={[
                                        <Text_1.default style={styles.textNormal}>Real-time expense sync</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Category and vendor mapping</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Tax rate synchronization</Text_1.default>,
                                    ]}/>
                                    <Text_1.default style={[styles.textNormal, styles.mt4]}>
                                        <Text_1.default style={styles.textBold}>QuickBooks Desktop</Text_1.default>
                                    </Text_1.default>
                                    <HelpBulletList_1.default styles={styles} items={[
                                        <Text_1.default style={styles.textNormal}>File-based import/export</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Chart of accounts import</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Custom field mapping</Text_1.default>,
                                    ]}/>
                                    <Text_1.default style={[styles.textNormal, styles.mt4]}>
                                        <Text_1.default style={styles.textBold}>Xero</Text_1.default>
                                    </Text_1.default>
                                    <HelpBulletList_1.default styles={styles} items={[
                                        <Text_1.default style={styles.textNormal}>Automatic report sync</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Tracking category import</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Tax rate management</Text_1.default>,
                                    ]}/>
                                    <Text_1.default style={[styles.textNormal, styles.mt4]}>
                                        <Text_1.default style={styles.textBold}>NetSuite</Text_1.default>
                                    </Text_1.default>
                                    <HelpBulletList_1.default styles={styles} items={[
                                        <Text_1.default style={styles.textNormal}>Advanced multi-entity support</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Custom dimension mapping</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Automated bill payments</Text_1.default>,
                                    ]}/>
                                    <Text_1.default style={[styles.textNormal, styles.mt4]}>
                                        <Text_1.default style={styles.textBold}>Sage Intacct</Text_1.default>
                                    </Text_1.default>
                                    <HelpBulletList_1.default styles={styles} items={[
                                        <Text_1.default style={styles.textNormal}>Department/class tracking</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Multi-currency support</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Advanced approval workflows</Text_1.default>,
                                    ]}/>
                                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Getting Started</Text_1.default>

                                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>What Gets Synced</Text_1.default>
                                    <Text_1.default style={[styles.textNormal]}>
                                        <Text_1.default style={styles.textBold}>From your accounting system:</Text_1.default>
                                    </Text_1.default>
                                    <HelpBulletList_1.default styles={styles} items={[
                                        <Text_1.default style={styles.textNormal}>Chart of accounts (as categories)</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Classes, departments, locations (as tags)</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Tax rates and customers</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Vendors and bill payment accounts</Text_1.default>,
                                    ]}/>
                                    <Text_1.default style={[styles.textNormal, styles.mt4]}>
                                        <Text_1.default style={styles.textBold}>To your accounting system:</Text_1.default>
                                    </Text_1.default>
                                    <HelpBulletList_1.default styles={styles} items={[
                                        <Text_1.default style={styles.textNormal}>Approved expense reports</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Company card transactions</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Vendor bills and journal entries</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Payment records and reconciliation data</Text_1.default>,
                                    ]}/>
                                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Related Links</Text_1.default>
                                    <HelpBulletList_1.default styles={styles} items={[
                                        <Text_1.default style={styles.textNormal}>
                                                <TextLink_1.default href="https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Connect-to-QuickBooks-Online" style={styles.link}>
                                                    Connect to QuickBooks Online
                                                </TextLink_1.default>
                                            </Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>
                                                <TextLink_1.default href="https://help.expensify.com/articles/new-expensify/connections/xero/Connect-to-Xero" style={styles.link}>
                                                    Connect to Xero
                                                </TextLink_1.default>
                                            </Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>
                                                <TextLink_1.default href="https://help.expensify.com/articles/new-expensify/connections/netsuite/Connect-To-NetSuite" style={styles.link}>
                                                    Connect to NetSuite
                                                </TextLink_1.default>
                                            </Text_1.default>,
                                    ]}/>
                                </react_native_1.View>);
                            },
                        },
                        members: {
                            content: function (_a) {
                                var styles = _a.styles;
                                return (<react_native_1.View>
                                    <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Workspace Members</Text_1.default>
                                    <Text_1.default style={[styles.textNormal]}>Manage team access, roles, and permissions for your workspace.</Text_1.default>
                                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Member Roles</Text_1.default>
                                    <Text_1.default style={[styles.textNormal]}>
                                        <Text_1.default style={styles.textBold}>Admin</Text_1.default>
                                    </Text_1.default>
                                    <HelpBulletList_1.default styles={styles} items={[
                                        <Text_1.default style={styles.textNormal}>Full workspace control and settings access</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Add/remove members and change roles</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Set up integrations and payment methods</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Approve and pay expenses</Text_1.default>,
                                    ]}/>
                                    <Text_1.default style={[styles.textNormal, styles.mt4]}>
                                        <Text_1.default style={styles.textBold}>Member</Text_1.default>
                                    </Text_1.default>
                                    <HelpBulletList_1.default styles={styles} items={[
                                        <Text_1.default style={styles.textNormal}>Submit expenses and create reports</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Participate in workspace chats</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>View assigned expenses and reports</Text_1.default>,
                                    ]}/>
                                    <Text_1.default style={[styles.textNormal, styles.mt4]}>
                                        <Text_1.default style={styles.textBold}>Auditor</Text_1.default>
                                    </Text_1.default>
                                    <HelpBulletList_1.default styles={styles} items={[
                                        <Text_1.default style={styles.textNormal}>View all workspace reports (read-only)</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Add comments but cannot modify expenses</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>No approval or payment permissions</Text_1.default>,
                                    ]}/>
                                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Adding Members</Text_1.default>

                                    <Text_1.default style={[styles.textNormal]}>
                                        <Text_1.default style={styles.textBold}>Alternative:</Text_1.default> Share workspace URL or QR code from{' '}
                                        <Text_1.default style={styles.textBold}>Settings &gt Profile &gt Share</Text_1.default>
                                    </Text_1.default>
                                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Managing Members</Text_1.default>
                                    <Text_1.default style={[styles.textNormal]}>
                                        <Text_1.default style={styles.textBold}>Change Role:</Text_1.default>
                                    </Text_1.default>

                                    <Text_1.default style={[styles.textNormal]}>
                                        <Text_1.default style={styles.textBold}>Remove Member:</Text_1.default>
                                    </Text_1.default>

                                    <Text_1.default style={[styles.textNormal]}>
                                        <Text_1.default style={styles.textBold}>Bulk Actions:</Text_1.default>
                                    </Text_1.default>
                                    <HelpBulletList_1.default styles={styles} items={[
                                        <Text_1.default style={styles.textNormal}>Select multiple members with checkboxes</Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>Use dropdown to remove or modify multiple members</Text_1.default>,
                                    ]}/>
                                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Transfer Ownership</Text_1.default>

                                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Related Links</Text_1.default>
                                    <HelpBulletList_1.default styles={styles} items={[
                                        <Text_1.default style={styles.textNormal}>
                                                <TextLink_1.default href="https://help.expensify.com/articles/new-expensify/workspaces/Managing-Workspace-Members" style={styles.link}>
                                                    Managing Workspace Members
                                                </TextLink_1.default>
                                            </Text_1.default>,
                                        <Text_1.default style={styles.textNormal}>
                                                <TextLink_1.default href="https://help.expensify.com/articles/new-expensify/workspaces/Add-Approvals" style={styles.link}>
                                                    Add Approvals
                                                </TextLink_1.default>
                                            </Text_1.default>,
                                    ]}/>
                                </react_native_1.View>);
                            },
                        },
                    },
                    content: function (_a) {
                        var styles = _a.styles;
                        return (<react_native_1.View>
                            <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Workspace</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>This is where you configure all the settings of the many features associated with your workspace.</Text_1.default>
                            <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Default features</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>Here are the features that are enabled by default:</Text_1.default>
                            <HelpBulletList_1.default styles={styles} items={[
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Overview</Text_1.default> - Configure how it appears to others.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Members</Text_1.default> - Add/remove members and admins.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Workflows</Text_1.default> - Configure submission, approval, and reimbursement.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Categories</Text_1.default> - Group expenses into a chart of accounts.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Expensify Card</Text_1.default> - Issue native Expensify Cards to employees.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Accounting</Text_1.default> - Sync with external accounting systems.
                                    </Text_1.default>,
                            ]}/>
                            <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Optional features</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>These can be enabled via More Features:</Text_1.default>
                            <HelpBulletList_1.default styles={styles} items={[
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Distance rates</Text_1.default> - Configure mileage reimbursement.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Company card</Text_1.default> - Connect and manage third-party corporate card feeds.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Per diem</Text_1.default> - Configure daily rates.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Rules</Text_1.default> - Customize expense violations and set policy.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Invoices</Text_1.default> - Collect revenue from customers.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Tags</Text_1.default> - Group expenses by project or client.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Taxes</Text_1.default> - Track VAT and other taxes.
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={styles.textBold}>Report fields</Text_1.default> - Capture extra expense report information.
                                    </Text_1.default>,
                            ]}/>
                        </react_native_1.View>);
                    },
                },
            },
            content: function (_a) {
                var styles = _a.styles;
                return (<react_native_1.View>
                    <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Workspaces</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>
                        Workspaces help you manage company expenses, enforce policies, and integrate with accounting software. Each workspace has its own rules, settings, and features.
                    </Text_1.default>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Creating a Workspace</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>
                        <Text_1.default style={styles.textBold}>To create a new workspace:</Text_1.default>
                    </Text_1.default>

                    <Text_1.default style={[styles.textNormal]}>
                        <Text_1.default style={styles.textBold}>Your first workspace includes:</Text_1.default>
                    </Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>Free 30-day trial</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Access to Setup Specialist via #admins chat room</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Help from Concierge in your Inbox</Text_1.default>,
                    ]}/>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Managing Members</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>
                        <Text_1.default style={styles.textBold}>To invite team members:</Text_1.default>
                    </Text_1.default>

                    <Text_1.default style={[styles.textNormal]}>
                        <Text_1.default style={styles.textBold}>Member vs Admin roles:</Text_1.default>
                    </Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Members</Text_1.default> can submit their own reports and approve assigned reports
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Admins</Text_1.default> can approve all workspace reports, view all reports, and edit workspace settings
                            </Text_1.default>,
                    ]}/>
                    <Text_1.default style={[styles.textNormal, styles.mt4]}>
                        <Text_1.default style={styles.textBold}>To assign admin roles:</Text_1.default>
                    </Text_1.default>

                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Key Features</Text_1.default>
                    <Text_1.default style={[styles.textNormal, styles.mb4]}>
                        <Text_1.default style={styles.textBold}>Categories</Text_1.default> - Organize and track expenses (imported automatically if connected to accounting software)
                    </Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>
                        <Text_1.default style={styles.textBold}>Approval Workflows</Text_1.default> - Automate expense report reviews:
                    </Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>
                                Toggle <Text_1.default style={styles.textBold}>Add Approvals</Text_1.default> on under <Text_1.default style={styles.textBold}>Workflows</Text_1.default>
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Set a default first approver for all expenses</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Create custom workflows for specific members</Text_1.default>,
                    ]}/>
                    <Text_1.default style={[styles.textNormal, styles.mt4]}>
                        <Text_1.default style={styles.textBold}>Accounting Integrations</Text_1.default> - Connect to:
                    </Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>QuickBooks Online</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Xero</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>NetSuite</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Sage Intacct</Text_1.default>,
                    ]}/>
                    <Text_1.default style={[styles.textNormal, styles.mt4]}>
                        <Text_1.default style={styles.textBold}>Additional Features</Text_1.default> (enable via <Text_1.default style={styles.textBold}>More Features</Text_1.default>):
                    </Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>Expensify Cards for company spending</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Distance tracking for mileage</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Tags for detailed expense coding</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Company card connections</Text_1.default>,
                    ]}/>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Workspace Settings</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>
                        Access all workspace configuration from the <Text_1.default style={styles.textBold}>Workspaces</Text_1.default> tab:
                    </Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Overview</Text_1.default> - Name, currency, description, and sharing options
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Members</Text_1.default> - Invite, remove, and manage member roles
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Categories</Text_1.default> - Add and organize expense categories
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Workflows</Text_1.default> - Set up approval and payment processes
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>More Features</Text_1.default> - Enable additional workspace capabilities
                            </Text_1.default>,
                    ]}/>

                    <Text_1.default style={[styles.textNormal]}>
                        <Text_1.default style={styles.textBold}>Tip:</Text_1.default> Use the <Text_1.default style={styles.textBold}>Share</Text_1.default> option on your workspace profile to get an invite link or QR code for
                        easy member onboarding.
                    </Text_1.default>
                </react_native_1.View>);
            },
        },
        search: {
            content: function (_a) {
                var styles = _a.styles;
                return (<react_native_1.View>
                    <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Reports</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>Virtually all data can be analyzed and reported upon in the Reports page. The major elements of this page include:</Text_1.default>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Data type</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>Start first by choosing the type of data you want to analyze, which can be:</Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Expense</Text_1.default> - Individual standalone expenses.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Expense reports</Text_1.default> - Groups of expenses processed in a batch.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Chats</Text_1.default> - Comments written by you and others.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Invoices</Text_1.default> - Expenses submitted to clients for payment.
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Trips</Text_1.default> - Travel expenses booked with Expensify Travel or scanned with SmartScan.
                            </Text_1.default>,
                    ]}/>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Search</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>A quick method of narrowing the results by keyword or more.</Text_1.default>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>State filter</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>Simple methods to filter the results by “state”, including:</Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>All</Text_1.default>
                            </Text_1.default>,
                        <>
                                <Text_1.default style={styles.textBold}>Expenses/Expense/Invoices reports:</Text_1.default>

                                <HelpBulletList_1.default styles={styles} items={[
                                <Text_1.default style={styles.textNormal}>Draft - Only you can see that hasn’t been shared yet.</Text_1.default>,
                                <Text_1.default style={styles.textNormal}>Outstanding - Submitted to someone and awaiting action.</Text_1.default>,
                                <Text_1.default style={styles.textNormal}>Approved - Approved, but awaiting payment.</Text_1.default>,
                                <Text_1.default style={styles.textNormal}>Done - Fully processed, no further action needed.</Text_1.default>,
                                <Text_1.default style={styles.textNormal}>Paid - Fully paid, no further action needed.</Text_1.default>,
                            ]}/>
                            </>,
                        <>
                                <Text_1.default style={styles.textBold}>Chats:</Text_1.default>

                                <HelpBulletList_1.default styles={styles} items={[
                                <Text_1.default style={styles.textNormal}>Unread - Not seen yet by you.</Text_1.default>,
                                <Text_1.default style={styles.textNormal}>Sent - Sent by you.</Text_1.default>,
                                <Text_1.default style={styles.textNormal}>Attachments - Image, movie, or document.</Text_1.default>,
                                <Text_1.default style={styles.textNormal}>Links - Hyperlinks.</Text_1.default>,
                                <Text_1.default style={styles.textNormal}>Pinned - Highlighted by you as important.</Text_1.default>,
                            ]}/>
                            </>,
                        <>
                                <Text_1.default style={styles.textBold}>Trips:</Text_1.default>

                                <HelpBulletList_1.default styles={styles} items={[<Text_1.default style={styles.textNormal}>Current - Happening or in the future.</Text_1.default>, <Text_1.default style={styles.textNormal}>Past - Already happened.</Text_1.default>]}/>
                            </>,
                    ]}/>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Results</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>The core of the Reports page are the search results themselves.</Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[<Text_1.default style={styles.textNormal}>Select a row to see additional options.</Text_1.default>, <Text_1.default style={styles.textNormal}>Tap on a row to see more detail.</Text_1.default>]}/>
                </react_native_1.View>);
            },
        },
        new: {
            children: {
                task: {
                    content: function (_a) {
                        var styles = _a.styles;
                        return (<react_native_1.View>
                            <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Tasks</Text_1.default>
                            <Text_1.default style={[styles.textNormal]}>
                                Keep conversations organized by letting you create actionable to-dos directly within a chat. You can assign them to yourself or others in both 1:1 and group
                                chats.
                            </Text_1.default>
                            <HelpBulletList_1.default styles={styles} items={[
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={[styles.textNormal]}>
                                            <Text_1.default style={styles.textBold}>Create a task:</Text_1.default> In any chat, click the + button next to the message field and select Assign a task. Add a
                                            title (required) and an optional description, and choose an assignee from chat participants. You can also leave it unassigned to track it
                                            yourself.
                                        </Text_1.default>
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={[styles.textNormal]}>
                                            <Text_1.default style={styles.textBold}>Use tasks to stay on top of action items:</Text_1.default> Tasks are great for follow-ups like “Submit expense report,” “Share
                                            slide deck,” or “Update mileage rate.” They’re perfect for 1:1 check-ins, project updates, or organizing next steps after a team discussion.
                                        </Text_1.default>
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={[styles.textNormal]}>
                                            <Text_1.default style={styles.textBold}>Edit and manage tasks:</Text_1.default> Task creators and assignees can comment, edit the title or description, reassign the
                                            task, or mark it as complete. Just click the task to update any details.
                                        </Text_1.default>
                                    </Text_1.default>,
                                <Text_1.default style={styles.textNormal}>
                                        <Text_1.default style={[styles.textNormal]}>
                                            <Text_1.default style={styles.textBold}>Tasks stay visible:</Text_1.default> Each task is shared in the chat where it’s created. When completed, it will be clearly
                                            marked in the chat and can be reopened if needed.
                                        </Text_1.default>
                                    </Text_1.default>,
                            ]}/>
                        </react_native_1.View>);
                    },
                },
            },
        },
        home: {
            content: function (_a) {
                var styles = _a.styles;
                return (<react_native_1.View>
                    <Text_1.default style={[styles.textHeadlineH1, styles.mv4]}>Navigating Expensify</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>Get familiar with Expensify’s intuitive navigation system designed for easy access to all your tools.</Text_1.default>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Left-hand Navigation Bar</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>
                        The vertical <Text_1.default style={styles.textBold}>left-hand bar</Text_1.default> is your main navigation hub:
                    </Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Expensify logo</Text_1.default> - Click to return to your Inbox (homepage)
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Inbox</Text_1.default> - Your personalized dashboard with action items and reminders
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Reports</Text_1.default> - Access all your expense reports and filtering tools
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Workspaces</Text_1.default> - Manage company and personal workspace settings
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Account</Text_1.default> - Personal settings, profile, and preferences
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Global Create</Text_1.default> button - Quick access to create reports, expenses, invoices, and chats
                            </Text_1.default>,
                    ]}/>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Inbox Overview</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>
                        Your <Text_1.default style={styles.textBold}>Inbox</Text_1.default> serves as the homepage and shows:
                    </Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>Smart reminders to submit, approve, or reconcile expenses</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Real-time updates on recent actions and flagged reports</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>List of chats with other employees in your organization</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Personalized action items based on your role and activity</Text_1.default>,
                    ]}/>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Chat Features</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>Every expense, report, or workspace has an associated chat for collaboration:</Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Text messages</Text_1.default> with rich formatting support
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Images & Documents</Text_1.default> via copy/paste, drag/drop, or attach button
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Expenses</Text_1.default> to track and submit for reimbursement
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Tasks</Text_1.default> to assign and manage work items
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>
                                <Text_1.default style={styles.textBold}>Mentions</Text_1.default> to invite anyone by email or phone number
                            </Text_1.default>,
                    ]}/>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Reports Section</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>
                        The <Text_1.default style={styles.textBold}>Reports</Text_1.default> tab consolidates filtering and reporting:
                    </Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>
                                Use the <Text_1.default style={styles.textBold}>Workspace filter</Text_1.default> inside the Filters menu to refine results
                            </Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Apply filters and queries that update automatically</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>View all expense reports across your workspaces</Text_1.default>,
                    ]}/>
                    <Text_1.default style={[styles.textHeadlineH2, styles.mv4]}>Quick Actions</Text_1.default>
                    <Text_1.default style={[styles.textNormal]}>
                        Use the green <Text_1.default style={styles.textBold}>Create</Text_1.default> button to quickly:
                    </Text_1.default>
                    <HelpBulletList_1.default styles={styles} items={[
                        <Text_1.default style={styles.textNormal}>Start a new chat or conversation</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Create an expense report</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Add an expense or receipt</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Create a task or invoice</Text_1.default>,
                        <Text_1.default style={styles.textNormal}>Submit expenses for approval</Text_1.default>,
                    ]}/>

                    <Text_1.default style={[styles.textNormal]}>
                        <Text_1.default style={styles.textBold}>Tip:</Text_1.default> Navigation is consistent across web, mobile, and desktop versions of Expensify.
                    </Text_1.default>
                </react_native_1.View>);
            },
        },
    },
    content: function () { return null; },
};
exports.default = helpContentMap;
