/** Keeps comparison swatches together so the period label only needs to appear once. */
import type {ChartSeries} from '@components/Charts/types';
import VictoryTheme from '@components/Charts/VictoryTheme';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {formatList} from '@libs/Localize';

import {View} from 'react-native';

type StackedBarChartLegendProps = {
    /** Each stack's first series supplies its group label. Compared swatches follow the primary stage order. */
    stacks: ReadonlyArray<readonly ChartSeries[]>;
};

function StackedBarChartLegend({stacks}: StackedBarChartLegendProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    const renderSwatch = ({key, color}: ChartSeries) => (
        <View
            key={key}
            aria-hidden
            style={[styles.pieChartLegendDot, styles.flexShrink0, StyleUtils.getBackgroundColorStyle(color ?? VictoryTheme.colors.default)]}
        />
    );

    return (
        <View style={[styles.pieChartLegendContainer, styles.justifyContentStart, styles.mh0, styles.mt0, styles.mb3]}>
            {stacks.flatMap((stack) => {
                const firstSeries = stack.at(0);
                if (!firstSeries?.stackLabel) {
                    return stack.map((series) => (
                        <View
                            key={series.key}
                            style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.flexShrink1]}
                        >
                            {renderSwatch(series)}
                            <Text
                                variant="micro"
                                color={theme.icon}
                                style={styles.flexShrink1}
                            >
                                {series.label}
                            </Text>
                        </View>
                    ));
                }

                const {key, stackLabel} = firstSeries;
                const stageLabels = stack.flatMap(({label}) => (label ? [label] : []));
                return [
                    <View
                        key={key}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.flexShrink1]}
                        role="group"
                        accessible
                        accessibilityLabel={formatList([stackLabel, ...stageLabels])}
                    >
                        {stack.map(renderSwatch)}
                        <Text
                            variant="micro"
                            color={theme.icon}
                            style={styles.flexShrink1}
                            aria-hidden
                        >
                            {stackLabel}
                        </Text>
                    </View>,
                ];
            })}
        </View>
    );
}

export default StackedBarChartLegend;
