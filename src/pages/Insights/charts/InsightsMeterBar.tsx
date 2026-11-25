import VictoryTheme from '@components/Charts/VictoryTheme';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import colors from '@styles/theme/colors';
import variables from '@styles/variables';

import React, {useId} from 'react';
import {View} from 'react-native';
import Svg, {Defs, Path, Pattern, Rect} from 'react-native-svg';

import InsightsAverageMarker from './InsightsAverageMarker';

/** Distance between two hatch stripes, and the width of one stripe */
const HATCH_SPACING = 4;
const HATCH_STRIPE_WIDTH = 2;

/** Side of the square tile one 45° stripe crosses corner to corner, so the stripes keep their spacing */
const HATCH_TILE_SIZE = HATCH_SPACING * Math.SQRT2;

const HATCH_SEGMENTS = [
    [0, 1, 1, 0],
    [-0.5, 0.5, 0.5, -0.5],
    [0.5, 1.5, 1.5, 0.5],
];
const HATCH_PATH = HATCH_SEGMENTS.map(([x1, y1, x2, y2]) => `M${x1 * HATCH_TILE_SIZE},${y1 * HATCH_TILE_SIZE} L${x2 * HATCH_TILE_SIZE},${y2 * HATCH_TILE_SIZE}`).join(' ');

type InsightsMeterBarProps = {
    /** Bar length, as a percentage of the track */
    widthPercent: number;

    /** Fill of the bar, whose average marker is drawn in a darker shade of it */
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
                                    width={HATCH_TILE_SIZE}
                                    height={HATCH_TILE_SIZE}
                                >
                                    <Path
                                        d={HATCH_PATH}
                                        stroke={color ?? colors.green400}
                                        strokeWidth={HATCH_STRIPE_WIDTH}
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
