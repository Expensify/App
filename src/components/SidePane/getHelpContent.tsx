/* eslint-disable @typescript-eslint/naming-convention */
import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';
import Chat from './HelpContent/chat';
import Search from './HelpContent/search';
import Settings from './HelpContent/settings';
import Workspaces from './HelpContent/settings/workspaces';
import PolicyID from './HelpContent/settings/workspaces/policyID';

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

    if (isProduction && content) {
        return content;
    }

    return (
        <DiagnosticData
            styles={styles}
            route={route}
            isExactMatch={isExactMatch}
        >
            {content}
        </DiagnosticData>
    );
}

export default getHelpContent;
