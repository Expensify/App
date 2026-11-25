import VictoryTheme from '@components/Charts/VictoryTheme';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import colors from '@styles/theme/colors';
import variables from '@styles/variables';

import React, {useId} from 'react';
import {View} from 'react-native';
import Svg, {Defs, Pattern, Rect} from 'react-native-svg';

import InsightsAverageMarker from './InsightsAverageMarker';

/** Distance between the starts of two hatch stripes, and the width of one stripe */
const HATCH_SPACING = 4;
const HATCH_STRIPE_WIDTH = 2;
const HATCH_ANGLE = 45;

type InsightsMeterBarProps = {
    /** Bar length, as a percentage of the track */
    widthPercent: number;

    /** Defaults to the green the ranking table's bars are drawn in */
    color?: string;

    /** Whether the bar is drawn hatched, for a value that may still grow */
    isHatched?: boolean;

    /** Position of the average marker on the track, omitted when the average isn't shown */
    averageWidthPercent?: number;
};

/** Bar filled up to a value along a fixed-length track, with an average as a dashed marker across it. */
function InsightsMeterBar({widthPercent, color, isHatched = false, averageWidthPercent}: InsightsMeterBarProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const patternID = useId();

    return (
        <View style={styles.insightsRankingTableBarTrack}>
            {widthPercent > 0 && (
                <View
                    style={[styles.insightsRankingTableBar(widthPercent), isHatched ? [styles.bgTransparent, styles.overflowHidden] : !!color && StyleUtils.getBackgroundColorStyle(color)]}
                >
                    {isHatched && (
                        <Svg
                            width="100%"
                            height="100%"
                        >
                            <Defs>
                                <Pattern
                                    id={patternID}
                                    patternUnits="userSpaceOnUse"
                                    width={HATCH_SPACING}
                                    height={HATCH_SPACING}
                                    patternTransform={`rotate(${HATCH_ANGLE})`}
                                >
                                    <Rect
                                        width={HATCH_STRIPE_WIDTH}
                                        height={HATCH_SPACING}
                                        fill={color ?? colors.green400}
                                    />
                                </Pattern>
                            </Defs>
                            <Rect
                                width="100%"
                                height="100%"
                                fill={`url(#${patternID})`}
                            />
                        </Svg>
                    )}
                </View>
            )}
            {averageWidthPercent !== undefined && (
                <View style={styles.insightsRankingTableAverageLineAnchor(averageWidthPercent, variables.insightsRankingTableAverageMarkerOverhang)}>
                    <InsightsAverageMarker
                        style={styles.flex1}
                        color={color ? VictoryTheme.colors.getAverageMarkerColor(color) : undefined}
                    />
                </View>
            )}
        </View>
    );
}

export default InsightsMeterBar;
