/* eslint-disable @typescript-eslint/naming-convention */
import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';
import Chat from './chat';
import AdminsChatRoom from './chat/admins';
import Concierge from './chat/concierge';
import ExpenseChat from './chat/expense';
import ExpensifyCardExpense from './chat/expense/expensifyCard';
import ManualExpense from './chat/expense/manual';
import ExpensifyCardPendingExpense from './chat/expense/pendingExpensifyCard';
import ScanExpense from './chat/expense/scan';
import ExpenseReportChat from './chat/expenseReport';
import WorkspaceChat from './chat/workspace';
import Search from './search';
import Settings from './settings';
import Workspaces from './settings/workspaces';
import PolicyID from './settings/workspaces/policyID';

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
            content: Chat,
            children: {
                [`:${CONST.REPORT.HELP_TYPE.POLICY_ADMINS}`]: {
                    content: AdminsChatRoom,
                },
                [`:${CONST.REPORT.HELP_TYPE.CHAT_CONCIERGE}`]: {
                    content: Concierge,
                },
                [`:${CONST.REPORT.HELP_TYPE.POLICY_EXPENSE_CHAT}`]: {
                    content: WorkspaceChat,
                },
                [`:${CONST.REPORT.HELP_TYPE.EXPENSE_REPORT}`]: {
                    content: ExpenseReportChat,
                },
                [`:${CONST.REPORT.HELP_TYPE.EXPENSE}`]: {
                    content: ExpenseChat,
                    children: {
                        [`:${CONST.IOU.EXPENSE_TYPE.MANUAL}`]: {
                            content: ManualExpense,
                        },
                        [`:${CONST.IOU.EXPENSE_TYPE.SCAN}`]: {
                            content: ScanExpense,
                        },
                        [`:${CONST.IOU.EXPENSE_TYPE.EXPENSIFY_CARD}`]: {
                            content: ExpensifyCardExpense,
                        },
                        [`:${CONST.IOU.EXPENSE_TYPE.PENDING_EXPENSIFY_CARD}`]: {
                            content: ExpensifyCardPendingExpense,
                        },
                    },
                },
            },
        },
        home: {
            content: Chat,
        },
        search: {
            content: Search,
        },
        settings: {
            content: Settings,
            children: {
                workspaces: {
                    content: Workspaces,
                    children: {
                        ':policyID': {
                            content: PolicyID,
                        },
                    },
                },
            },
        },
    },
};

type DiagnosticDataProps = {
    /** The styles to apply to the diagnostic data */
    styles: ThemeStyles;

    /** The route that was attempted to be accessed */
    route: string;

    /** Whether the route is an exact match */
    isExactMatch?: boolean;

    /** Help content to display */
    children?: ReactNode;
};

function DiagnosticData({styles, route, children, isExactMatch}: DiagnosticDataProps) {
    const diagnosticTitle = isExactMatch ? 'Help content found for route:' : 'Missing help content for route:';

    return (
        <>
            {!!children && (
                <>
                    {children}
                    <View style={[styles.sectionDividerLine, styles.mv5]} />
                </>
            )}
            <Text style={[styles.textLabelSupportingNormal, styles.mb4]}>Diagnostic data (visible only on staging)</Text>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>{diagnosticTitle}</Text>
            <Text style={styles.textNormal}>{route}</Text>
        </>
    );
}

function getHelpContent(styles: ThemeStyles, route: string, isProduction: boolean): ReactNode {
    const routeParts = route.substring(1).split('/');
    const helpContentComponents: ContentComponent[] = [];
    let activeHelpContent = helpContentMap;
    let isExactMatch = true;

    for (const part of routeParts) {
        if (activeHelpContent?.children?.[part]) {
            activeHelpContent = activeHelpContent.children[part];
            helpContentComponents.push(activeHelpContent.content);
        } else {
            if (helpContentComponents.length === 0) {
                // eslint-disable-next-line react/no-unescaped-entities
                helpContentComponents.push(() => <Text style={styles.textHeadlineH1}>We couldn't find any help content for this route.</Text>);
            }
            isExactMatch = false;
            break;
        }
    }

    const content = helpContentComponents.reverse().map((HelpContentNode, index) => {
        return (
            <>
                <HelpContentNode
                    // eslint-disable-next-line react/no-array-index-key
                    key={`help-content-${index}`}
                    styles={styles}
                />
                {index < helpContentComponents.length - 1 && <View style={[styles.sectionDividerLine, styles.mv5]} />}
            </>
        );
    });

    if (isProduction) {
        return content;
    }

    return (
        <DiagnosticData
            key="diagnostic-data"
            styles={styles}
            route={route}
            isExactMatch={isExactMatch}
        >
            {content}
        </DiagnosticData>
    );
}

export default getHelpContent;
