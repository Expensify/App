/* eslint-disable @typescript-eslint/naming-convention */
import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

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
                <Text style={[styles.textHeadlineH1, styles.mb4]}>Chat Reports</Text>
                <Text style={styles.textNormal}>... general chat reports help ...</Text>
            </>
        ),
        children: {
            ':reportID': {
                content: (styles: ThemeStyles) => (
                    <>
                        <Text style={[styles.textHeadlineH1, styles.mb4]}>Chat Report</Text>
                        <Text style={styles.textNormal}>... general chat report help ...</Text>
                    </>
                ),
            },
        },
    },
    search: {
        content: (styles: ThemeStyles) => (
            <>
                <Text style={[styles.textHeadlineH1, styles.mb4]}>Searching Reports</Text>
                <Text style={styles.textNormal}>... general search help ...</Text>
            </>
        ),
    },
    settings: {
        content: (styles: ThemeStyles) => (
            <>
                <Text style={[styles.textHeadlineH1, styles.mb4]}>Settings</Text>
                <Text style={styles.textNormal}>... general settings help ...</Text>
            </>
        ),
        children: {
            workspaces: {
                content: (styles: ThemeStyles) => (
                    <>
                        <Text style={[styles.textHeadlineH1, styles.mb4]}>Workspaces</Text>
                        <Text style={styles.textNormal}>... general workspaces help ...</Text>
                    </>
                ),
                children: {
                    ':policyID': {
                        content: (styles: ThemeStyles) => (
                            <>
                                <Text style={[styles.textHeadlineH1, styles.mb4]}>Workspace Settings</Text>
                                <Text style={styles.textNormal}>... general workspace settings help ...</Text>
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
    isExactMatch?: boolean;
    children?: ReactNode;
};

function DiagnosticData({styles, route, children, isExactMatch}: DiagnosticDataProps) {
    const diagnosticTitle = isExactMatch ? 'Help content found for route:' : 'Missing help content for route:';

    return (
        <View style={styles.ph5}>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>{diagnosticTitle}</Text>
            <Text style={styles.textNormal}>{route}</Text>
            {!!children && (
                <>
                    <View style={[styles.sectionDividerLine, styles.mv5]} />
                    {children}
                </>
            )}
        </View>
    );
}

function getHelpContent(styles: ThemeStyles, route: string, isProduction: boolean): ReactNode {
    const [firstPart, ...routeParts] = route.substring(1).split('/');
    let currentNode: HelpContent = helpContentMap[firstPart];
    let isExactMatch = true;

    for (const part of routeParts) {
        if (currentNode?.children?.[part]) {
            currentNode = currentNode.children[part];
            isExactMatch = true;
        } else {
            isExactMatch = false;
            break;
        }
    }

    if (currentNode?.content) {
        if (isProduction) {
            return <View style={styles.ph5}>{currentNode.content(styles)}</View>;
        }

        return (
            <DiagnosticData
                styles={styles}
                route={route}
                isExactMatch={isExactMatch}
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
