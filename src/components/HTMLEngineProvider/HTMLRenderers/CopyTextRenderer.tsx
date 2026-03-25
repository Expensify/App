import React from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import useThemeStyles from '@hooks/useThemeStyles';

type CopyTextRendererProps = CustomRendererProps<TText | TPhrasing>;

function CopyTextRenderer({tnode}: CopyTextRendererProps) {
    const styles = useThemeStyles();
    const textToCopy = tnode.attributes.text || '';

    if (!textToCopy) {
        return null;
    }

    return (
        <CopyTextToClipboard
            text={textToCopy}
            textStyles={[styles.textBlue]}
        />
    );
}

export default CopyTextRenderer;
