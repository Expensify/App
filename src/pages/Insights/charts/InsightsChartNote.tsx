/** Small secondary-text note shown under an Insights chart, like what the chart leaves out or where its data starts. */
import Text from '@components/Text';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type InsightsChartNoteProps = {
    /** The note's text, which can include inline links */
    children: React.ReactNode;
};

function InsightsChartNote({children}: InsightsChartNoteProps) {
    const styles = useThemeStyles();
    const {cardPaddingHorizontal, cardPaddingBottom} = useLayoutSpacing();

    return (
        <View style={[cardPaddingHorizontal, cardPaddingBottom]}>
            <Text
                variant="label"
                style={styles.textSupporting}
            >
                {children}
            </Text>
        </View>
    );
}

export default InsightsChartNote;
