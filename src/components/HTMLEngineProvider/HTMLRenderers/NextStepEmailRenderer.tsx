import React from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

function NextStepEmailRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();

    return (
        <Text
            nativeID="email-with-break-opportunities"
            style={[styles.breakWord, styles.textLabelSupporting, styles.textStrong]}
        >
            {'data' in tnode ? tnode.data : ''}
        </Text>
    );
}

NextStepEmailRenderer.displayName = 'NextStepEmailRenderer';

export default NextStepEmailRenderer;
