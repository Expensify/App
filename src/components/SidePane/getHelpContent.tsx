/* eslint-disable react/no-unescaped-entities */

/* eslint-disable @typescript-eslint/naming-convention */
import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';

type HelpContent = {
    /** The content to display for this route */
    content?: (styles: ThemeStyles) => ReactNode;

    /** Any children routes that this route has */
    children?: Record<string, HelpContent>;

    /** Whether this route is an exact match or displays parent content */
    isExact?: boolean;
};

const helpContentMap: Record<string, HelpContent> = {
    r: {
        content: (styles: ThemeStyles) => (
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
                <Text style={styles.textNormal}>The core of the chat are its comments, which come in many forms:</Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Text</Text> - Rich text messages stored securely and delivered via web, app, email, or SMS.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Images & Documents</Text> - Insert photos, screenshots, movies, PDFs, or more, using copy/paste, drag/drop, or the attach
                    button
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Expenses</Text> - Share an expense in the chat, either to simply track and document it, or to submit for reimbursement.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Tasks</Text> - Record a task, and optionally assign it to someone (or yourself!)
                </Text>

                <Text style={[styles.textHeadlineH2, styles.mv4]}>Actions</Text>
                <Text style={styles.textNormal}>Hover (or long press) on a comment to see additional options, including:</Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>React</Text> - Throw a ♥️😂🔥 like on anything!
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Reply in thread</Text> - Go deeper by creating a new chat on any comment.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Mark unread</Text> - Flag it for reading later, at your convenience.
                </Text>

                <Text style={[styles.textHeadlineH2, styles.mv4]}>Composer</Text>
                <Text style={styles.textNormal}>Use the composer at the bottom to write new messages:</Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Markdown</Text> - Format text using <Text style={styles.textBold}>*bold*</Text>,{' '}
                    <Text style={styles.textItalic}>_italics_</Text>, and more.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Mention</Text> - Invite or tag anyone in the world to any chat by putting an @ in front of their email address or phone
                    number (eg,
                    <Text style={styles.textBold}>@awong@marslink.web</Text>, or <Text style={styles.textBold}>@415-867-5309</Text>).
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Mention</Text> - Invite or tag anyone in the world to any chat by putting an @ in front of their email address or phone
                    number (eg,
                    <Text style={styles.textBold}> @awong@marslink.web</Text>, or <Text style={styles.textBold}>@415-867-5309</Text>).
                </Text>
            </>
        ),
    },
    home: {
        content: (styles: ThemeStyles) => (
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
                <Text style={styles.textNormal}>The core of the chat are its comments, which come in many forms:</Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Text</Text> - Rich text messages stored securely and delivered via web, app, email, or SMS.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Images & Documents</Text> - Insert photos, screenshots, movies, PDFs, or more, using copy/paste, drag/drop, or the attach
                    button
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Expenses</Text> - Share an expense in the chat, either to simply track and document it, or to submit for reimbursement.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Tasks</Text> - Record a task, and optionally assign it to someone (or yourself!)
                </Text>

                <Text style={[styles.textHeadlineH2, styles.mv4]}>Actions</Text>
                <Text style={styles.textNormal}>Hover (or long press) on a comment to see additional options, including:</Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>React</Text> - Throw a ❤️😂🔥 or anything you like on anything!
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Reply in thread</Text> - Go deeper by creating a new chat on any comment.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Mark unread</Text> - Flag it for reading later, at your convenience.
                </Text>

                <Text style={[styles.textHeadlineH2, styles.mv4]}>Composer</Text>
                <Text style={styles.textNormal}>Use the composer at the bottom to write new messages:</Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Markdown</Text> - Format text using <Text style={styles.textBold}>*bold*</Text>,{' '}
                    <Text style={styles.textItalic}>_italics_</Text>, and more.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Mention</Text> - Invite or tag anyone in the world to any chat by putting an @ in front of their email address or phone
                    number (eg,
                    <Text style={styles.textBold}> @awong@marslink.web</Text>, or <Text style={styles.textBold}>@415-867-5309</Text>).
                </Text>
            </>
        ),
    },
    search: {
        content: (styles: ThemeStyles) => (
            <>
                <Text style={[styles.textHeadlineH1, styles.mb4]}>Reports</Text>
                <Text style={styles.textNormal}>Virtually all data can be analyzed and reported upon in the Reports page. The major elements of this page include:</Text>

                <Text style={[styles.textHeadlineH2, styles.mv4]}>Data type</Text>
                <Text style={styles.textNormal}>Start first by choosing the type of data you want to analyze, which can be:</Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Expense</Text> - Individual standalone expenses.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Expense reports</Text> - Groups of expenses processed in a batch.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Chats</Text> - Comments written by you and others.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Invoices</Text> - Expenses submitted to clients for payment.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Trips</Text> - Travel expenses booked with Expensify Travel or scanned with SmartScan.
                </Text>

                <Text style={[styles.textHeadlineH2, styles.mv4]}>Search</Text>
                <Text style={styles.textNormal}>A quick method of narrowing the results by keyword or more.</Text>

                <Text style={[styles.textHeadlineH2, styles.mv4]}>State filter</Text>
                <Text style={styles.textNormal}>Simple methods to filter the results by "state", including:</Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>All</Text> - Everything in every state.
                </Text>

                <Text style={[styles.textLarge, styles.mt5]}>Expenses/Expense Reports/Invoices</Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Draft</Text> - Only you can see that hasn't been shared yet.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Outstanding</Text> - Submitted to someone and awaiting action.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Approved</Text> - Approved, but awaiting payment.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Done</Text> - Fully processed, no further action needed.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Paid</Text> - Fully paid, no further action needed.
                </Text>

                <Text style={[styles.textLarge, styles.mt5]}>Chats</Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Unread</Text> - Not seen yet by you.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Sent</Text> - Sent by you.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Attachments</Text> - Image, movie, or document.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Links</Text> - Hyperlinks.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Pinned</Text> - Highlighted by you as important.
                </Text>

                <Text style={[styles.textLarge, styles.mt5]}>Trips</Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Current</Text> - Happening or in the future.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Past</Text> - Already happened.
                </Text>

                <Text style={[styles.textHeadlineH2, styles.mv4]}>Results</Text>
                <Text style={styles.textNormal}>The core of the Reports page are the search results themselves.</Text>
                <Text style={[styles.textNormal, styles.mt2]}>{CONST.BULLET} Select a row to see additional options.</Text>
                <Text style={[styles.textNormal, styles.mt2]}>{CONST.BULLET} Tap on a row to see more detail.</Text>
            </>
        ),
    },
    settings: {
        content: (styles: ThemeStyles) => (
            <>
                <Text style={[styles.textHeadlineH1, styles.mb4]}>Settings</Text>
                <Text style={styles.textNormal}>Here is where you configure Expensify exactly to your specifications:</Text>

                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Profile</Text> - Configure how you appear to others.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Wallet</Text> - See and manage your credit cards and bank accounts.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Preferences</Text> - Adjust how the app works for you.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Security</Text> - Lock down how you and others access your account.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Workspaces</Text> - Organize expenses for yourself and share with others.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Subscriptions</Text> - Manage payment details and history.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Domains</Text> - Advanced security and corporate card configuration.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Switch to Expensify Classic</Text> - Battle-tested and reliable.
                </Text>
                <Text style={[styles.textNormal, styles.mt2]}>
                    {CONST.BULLET} <Text style={styles.textBold}>Save the World</Text> - Let Expensify.org help your favorite teacher!
                </Text>
            </>
        ),
        children: {
            workspaces: {
                content: (styles: ThemeStyles) => (
                    <>
                        <Text style={[styles.textHeadlineH1, styles.mb4]}>Settings &gt; Workspaces</Text>
                        <Text style={styles.textNormal}>Workspaces allow for a wide range of features, including:</Text>

                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} <Text style={styles.textBold}>Categorize</Text> and <Text style={styles.textBold}>submit</Text> expenses.
                        </Text>
                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} <Text style={styles.textBold}>Approve</Text> and <Text style={styles.textBold}>reimburse</Text> expenses.
                        </Text>
                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} Sync with <Text style={styles.textBold}>accounting packages</Text>.
                        </Text>
                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} Connect to <Text style={styles.textBold}>company card feeds</Text>.
                        </Text>
                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} Manage <Text style={styles.textBold}>Expensify Cards</Text>.
                        </Text>
                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} <Text style={styles.textBold}>Chat</Text> with colleagues, partners, and clients.
                        </Text>
                        <Text style={[styles.textNormal, styles.mt2]}>{CONST.BULLET} … and lots more!</Text>

                        <Text style={[styles.textHeadlineH2, styles.mv4]}>Workspace Variations</Text>
                        <Text style={styles.textNormal}>Workspaces come in two variations:</Text>

                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} <Text style={styles.textBold}>Collect</Text> workspaces start at $5/member, and include all the basics for running a small business.
                        </Text>
                        <Text style={[styles.textNormal, styles.mt2]}>
                            {CONST.BULLET} <Text style={styles.textBold}>Control</Text> workspaces start at $9/member, and provide advanced capabilities, more powerful accounting sync, and
                            more sophisticated approval flows.
                        </Text>

                        <Text style={[styles.textHeadlineH2, styles.mv4]}>Managing Workspaces</Text>
                        <Text style={styles.textNormal}>In general, you would create one Workspace for each company you manage. You can create and join as many workspaces as you like.</Text>
                    </>
                ),
                children: {
                    ':policyID': {
                        content: (styles: ThemeStyles) => (
                            <>
                                <Text style={[styles.textHeadlineH1, styles.mb4]}>Workspaces</Text>
                                <Text style={styles.textNormal}>This is where you configure all the settings of the many features associated with your workspace.</Text>

                                <Text style={[styles.textHeadlineH2, styles.mv4]}>Default Features</Text>
                                <Text style={styles.textNormal}>Here are the features that are enabled by default:</Text>

                                <Text style={[styles.textNormal, styles.mt2]}>
                                    {CONST.BULLET} <Text style={styles.textBold}>Overview</Text> - Configure how it appears to others.
                                </Text>
                                <Text style={[styles.textNormal, styles.mt2]}>
                                    {CONST.BULLET} <Text style={styles.textBold}>Members</Text> - Add/remove members and admins.
                                </Text>
                                <Text style={[styles.textNormal, styles.mt2]}>
                                    {CONST.BULLET} <Text style={styles.textBold}>Workflows</Text> - Configure submission, approval, and reimbursement.
                                </Text>
                                <Text style={[styles.textNormal, styles.mt2]}>
                                    {CONST.BULLET} <Text style={styles.textBold}>Categories</Text> - Group expenses into a chart of accounts.
                                </Text>
                                <Text style={[styles.textNormal, styles.mt2]}>
                                    {CONST.BULLET} <Text style={styles.textBold}>Expensify Card</Text> - Issue native Expensify Cards to employees.
                                </Text>
                                <Text style={[styles.textNormal, styles.mt2]}>
                                    {CONST.BULLET} <Text style={styles.textBold}>Accounting</Text> - Sync with external accounting systems.
                                </Text>

                                <Text style={[styles.textHeadlineH2, styles.mv4]}>Optional Features</Text>
                                <Text style={styles.textNormal}>
                                    These can be enabled via <Text style={styles.textBold}>More Features</Text>:
                                </Text>

                                <Text style={[styles.textNormal, styles.mt2]}>
                                    {CONST.BULLET} <Text style={styles.textBold}>Distance rates</Text> - Configure mileage reimbursement.
                                </Text>
                                <Text style={[styles.textNormal, styles.mt2]}>
                                    {CONST.BULLET} <Text style={styles.textBold}>Company card</Text> - Connect and manage third-party corporate card feeds.
                                </Text>
                                <Text style={[styles.textNormal, styles.mt2]}>
                                    {CONST.BULLET} <Text style={styles.textBold}>Per diem</Text> - Configure daily rates.
                                </Text>
                                <Text style={[styles.textNormal, styles.mt2]}>
                                    {CONST.BULLET} <Text style={styles.textBold}>Rules</Text> - Customize expense violations and set policy.
                                </Text>
                                <Text style={[styles.textNormal, styles.mt2]}>
                                    {CONST.BULLET} <Text style={styles.textBold}>Invoices</Text> - Collect revenue from customers.
                                </Text>
                                <Text style={[styles.textNormal, styles.mt2]}>
                                    {CONST.BULLET} <Text style={styles.textBold}>Tags</Text> - Group expenses by project or client.
                                </Text>
                                <Text style={[styles.textNormal, styles.mt2]}>
                                    {CONST.BULLET} <Text style={styles.textBold}>Taxes</Text> - Track VAT and other taxes.
                                </Text>

                                <Text style={[styles.textHeadlineH2, styles.mv4]}>Report Fields</Text>
                                <Text style={styles.textNormal}>Capture extra expense report information.</Text>
                            </>
                        ),
                    },
                },
            },
        },
    },
};

type DiagnosticDataProps = {
    styles: ThemeStyles;
    route: string;
    currentRoute?: string;
    isExactMatch?: boolean;
    children?: ReactNode;
};

function DiagnosticData({styles, route, currentRoute, children, isExactMatch}: DiagnosticDataProps) {
    const diagnosticTitle = isExactMatch ? 'Help content found for route:' : 'Missing help content for route:';

    return (
        <>
            {!!children && (
                <>
                    {children}
                    <View style={[styles.sectionDividerLine, styles.mv5]} />
                </>
            )}
            <Text style={[styles.textHeadlineH1, styles.mb4]}>{diagnosticTitle}</Text>
            <Text style={styles.textNormal}>{route}</Text>
            {!isExactMatch && !!currentRoute && (
                <>
                    <Text style={[styles.textHeadlineH2, styles.pv4]}>Using content from:</Text>
                    <Text style={styles.textNormal}>{currentRoute}</Text>
                </>
            )}
        </>
    );
}

function getHelpContent(styles: ThemeStyles, route: string, isProduction: boolean): ReactNode {
    const [firstPart, ...routeParts] = route.substring(1).split('/');
    const currentRoute = [firstPart];
    let currentNode: HelpContent = helpContentMap[firstPart];
    let isExactMatch = true;

    for (const part of routeParts) {
        if (currentNode?.children?.[part]) {
            currentNode = currentNode.children[part];
            currentRoute.push(part);
            isExactMatch = true;
        } else {
            isExactMatch = false;
            break;
        }
    }

    if (currentNode?.content) {
        if (isProduction) {
            return currentNode.content(styles);
        }

        return (
            <DiagnosticData
                styles={styles}
                route={route}
                isExactMatch={isExactMatch}
                currentRoute={`/${currentRoute.join('/')}`}
            >
                {currentNode.content(styles)}
            </DiagnosticData>
        );
    }

    return (
        <DiagnosticData
            styles={styles}
            route={route}
        />
    );
}

export default getHelpContent;
