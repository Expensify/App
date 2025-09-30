import React from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import useThemeStyles from '@hooks/useThemeStyles';
import {openLink} from '@libs/actions/Link';
import CONST from '@src/CONST';

type AnchorLabelRendererProps = CustomRendererProps<TText | TPhrasing>;

function AnchorLabelRenderer({tnode}: AnchorLabelRendererProps) {
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const htmlAttribs = tnode.attributes;

    // Get the href attribute from the a-label element
    const attrHref = htmlAttribs.href || '';
    const isAttachment = !!htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE];

    // Apply link styling with the label text styling
    const linkStyle = [
        styles.textLabel,
        {
            color: styles.link.color,
            textDecorationColor: styles.link.textDecorationColor,
        },
    ];

    return (
        <Text
            style={linkStyle}
            onPress={() => openLink(attrHref, environmentURL, isAttachment)}
            suppressHighlighting
        >
            <TNodeChildrenRenderer tnode={tnode} />
        </Text>
    );
}

export default AnchorLabelRenderer;
