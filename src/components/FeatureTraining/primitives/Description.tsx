import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type DescriptionProps = {
    /** Description text to render */
    children?: string;

    /** Whether the description is HTML markup and should be rendered via RenderHTML */
    shouldRenderHTML?: boolean;
};

function Description({children, shouldRenderHTML = false}: DescriptionProps) {
    const styles = useThemeStyles();

    if (!children) {
        return null;
    }

    if (shouldRenderHTML) {
        return (
            <View style={[styles.flexRow, styles.w100, styles.mb2, styles.renderHTML]}>
                <RenderHTML html={children} />
            </View>
        );
    }

    return <Text style={styles.textSupporting}>{children}</Text>;
}

Description.displayName = 'FeatureTraining.Description';

export default Description;
