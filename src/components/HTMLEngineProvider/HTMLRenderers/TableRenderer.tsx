import useThemeStyles from '@hooks/useThemeStyles';

import type {CustomRendererProps, TBlock} from 'react-native-render-html';

import React from 'react';
import {ScrollView, View} from 'react-native';
import {TNodeRenderer} from 'react-native-render-html';

function TableRenderer({tnode}: CustomRendererProps<TBlock>) {
    const styles = useThemeStyles();

    // Skip whitespace-only text nodes that sit between block elements in the source HTML.
    const sections = tnode.children.filter((child) => !!child.tagName);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.w100}
            contentContainerStyle={styles.htmlTableScrollContainerContent}
        >
            <View style={styles.htmlTable}>
                {sections.map((child, index) => {
                    const key = `${child.tagName ?? 'node'}-${index}`;
                    return (
                        <TNodeRenderer
                            key={key}
                            tnode={child}
                            renderIndex={index}
                            renderLength={sections.length}
                        />
                    );
                })}
            </View>
        </ScrollView>
    );
}

export default TableRenderer;
