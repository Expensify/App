import type {CustomRendererProps, TPhrasing, TText} from '@native-html/render';
import React from 'react';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

function NextStepEmailRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();

    return (
        <Text
            testID="email-with-break-opportunities"
            style={[styles.breakWord, styles.textLabelSupporting, styles.textStrong]}
        >
            {'data' in tnode ? tnode.data : ''}
        </Text>
    );
}

export default NextStepEmailRenderer;
