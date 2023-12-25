import React from 'react';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type NextStepsEmailRendererProps = {
    tnode: {
        data: string;
    };
};

function NextStepsEmailRenderer({tnode}: NextStepsEmailRendererProps) {
    const styles = useThemeStyles();

    return <Text style={[styles.breakWord, styles.textLabelSupporting, styles.textStrong]}>{tnode.data}</Text>;
}

NextStepsEmailRenderer.displayName = 'NextStepsEmailRenderer';

export default NextStepsEmailRenderer;
