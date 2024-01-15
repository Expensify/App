import React from 'react';
import type {CustomRendererProps, TText} from 'react-native-render-html';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

function NextStepEmailRenderer({tnode}: CustomRendererProps<TText>) {
    const styles = useThemeStyles();

    return <Text style={[styles.breakWord, styles.textLabelSupporting, styles.textStrong]}>{tnode.data}</Text>;
}

NextStepEmailRenderer.displayName = 'NextStepEmailRenderer';

export default NextStepEmailRenderer;
