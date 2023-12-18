import React from 'react';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type NextStepEmailRendererProps = {
    tnode: {
        data: string;
    };
};

function NextStepEmailRenderer({tnode}: NextStepEmailRendererProps) {
    const styles = useThemeStyles();

    return <Text style={[styles.breakWord, styles.textLabelSupporting, styles.textStrong]}>{tnode.data}</Text>;
}

NextStepEmailRenderer.displayName = 'NextStepEmailRenderer';

export default NextStepEmailRenderer;
