import TableContentWidthContext from '@components/HTMLEngineProvider/HTMLRenderers/TableContentWidthContext';
import RenderHTML from '@components/RenderHTML';

import useThemeStyles from '@hooks/useThemeStyles';

import type {OriginalMessageSource} from '@src/types/onyx/OriginalMessage';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

type RenderCommentHTMLProps = {
    source: OriginalMessageSource;
    html: string;
    containsOnlyEmojis: boolean;
};

function RenderCommentHTML({html, source, containsOnlyEmojis}: RenderCommentHTMLProps) {
    const styles = useThemeStyles();
    const commentHtml =
        source === 'email' ? `<email-comment ${containsOnlyEmojis ? 'islarge' : ''}>${html}</email-comment>` : `<comment ${containsOnlyEmojis ? 'islarge' : ''}>${html}</comment>`;

    const [contentWidth, setContentWidth] = useState(0);

    // Tables (only produced by Concierge) need the full message width, which must be measured above
    // react-native-render-html's per-block wrappers because those shrink-wrap to their content. Other comments render
    // without this extra wrapper so their layout is untouched.
    if (!html.includes('<table')) {
        return <RenderHTML html={commentHtml} />;
    }

    return (
        <View
            style={styles.w100}
            onLayout={(event: LayoutChangeEvent) => setContentWidth(event.nativeEvent.layout.width)}
        >
            <TableContentWidthContext.Provider value={contentWidth}>
                <RenderHTML html={commentHtml} />
            </TableContentWidthContext.Provider>
        </View>
    );
}

export default RenderCommentHTML;
