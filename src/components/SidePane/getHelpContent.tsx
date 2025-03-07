/* eslint-disable @typescript-eslint/naming-convention */
import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

type HelpContentMap = Record<
    string,
    {
        /** The content to display for this route */
        content?: (styles: ThemeStyles) => ReactNode;

        /** Any children routes that this route has */
        children?: HelpContentMap;
    }
>;

const helpContentMap: HelpContentMap = {
    r: {
        content: (styles: ThemeStyles) => (
            <>
                <Text style={[styles.textHeadlineH1, styles.mb4]}>Chat Reports</Text>
                <Text style={styles.textNormal}>... general chat reports help ...</Text>
            </>
        ),
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

const getHelpContent = (styles: ThemeStyles, route: string): ReactNode => {
    const [firstPart, ...routeParts] = route.substring(1).split('/');
    let currentNode: HelpContentMap[string] = helpContentMap[firstPart];

    for (const part of routeParts) {
        if (currentNode?.children?.[part]) {
            currentNode = currentNode.children[part];
        } else {
            break;
        }
    }

    if (currentNode?.content) {
        return <View style={styles.ph5}>{currentNode.content(styles)}</View>;
    }

    return (
        <View style={styles.ph5}>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Missing page for route</Text>
            <Text style={styles.textNormal}>{route}</Text>
        </View>
    );
};

export default getHelpContent;
