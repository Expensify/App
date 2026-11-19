import SkeletonTextLine from '@components/Skeletons/SkeletonTextLine';

import useThemeStyles from '@hooks/useThemeStyles';

import {lineHeightScale} from '@styles/typography';

import React from 'react';
import {View} from 'react-native';

const LABEL_WIDTH = 80;
const COMPARISON_WIDTH = 200;
const VALUE_WIDTH = 96;

/** Loading skeleton of the Summary section's content */
function InsightsSummarySkeleton() {
    const styles = useThemeStyles();

    const renderTile = () => (
        <View style={[styles.flex1, styles.gap1]}>
            <SkeletonTextLine
                lineHeight={lineHeightScale.label}
                barWidth={LABEL_WIDTH}
            />
            <SkeletonTextLine
                lineHeight={lineHeightScale.text}
                barWidth={VALUE_WIDTH}
            />
        </View>
    );

    return (
        <>
            <View style={[styles.p4, styles.gap1, styles.borderBottom]}>
                <SkeletonTextLine
                    lineHeight={lineHeightScale.label}
                    barWidth={LABEL_WIDTH}
                />
                <SkeletonTextLine
                    lineHeight={lineHeightScale.text}
                    barWidth={COMPARISON_WIDTH}
                />
            </View>
            <View style={[styles.flexRow, styles.gap5, styles.p4, styles.borderBottom]}>
                {renderTile()}
                {renderTile()}
            </View>
            <View style={[styles.flexRow, styles.gap5, styles.p4]}>
                {renderTile()}
                {renderTile()}
            </View>
        </>
    );
}

export default InsightsSummarySkeleton;
