import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';

import React from 'react';
import {TNodeChildrenRenderer} from 'react-native-render-html';

/**
 * Renders the `<gbr>` (green brick road) tag, the success-tone counterpart to `<rbr>`.
 */
function GBRRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();
    const htmlAttribs = tnode.attributes;
    const isSmall = htmlAttribs?.issmall !== undefined;
    const shouldShowEllipsis = htmlAttribs?.shouldshowellipsis !== undefined;

    return (
        <TNodeChildrenRenderer
            tnode={tnode}
            renderChild={(props) => {
                return (
                    <Text
                        numberOfLines={shouldShowEllipsis ? 1 : 0}
                        ellipsizeMode="tail"
                        key={props.key}
                        style={[styles.textLabelError, styles.lineHeightNormal, styles.mb0, styles.badgeSuccessText, isSmall ? styles.textMicro : {}]}
                    >
                        {props.childElement}
                    </Text>
                );
            }}
        />
    );
}

export default GBRRenderer;
