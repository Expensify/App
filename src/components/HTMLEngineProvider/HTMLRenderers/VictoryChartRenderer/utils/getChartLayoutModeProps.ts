import type {ChartExplicitSize, ChartLayoutModeProps} from 'victory-native';

/**
 * Maps optional CLI headless props to victory-native's discriminated layout union.
 */
function getChartLayoutModeProps(explicitSize?: ChartExplicitSize, headless?: boolean): ChartLayoutModeProps {
    if (!explicitSize) {
        return {};
    }

    return {explicitSize, headless: headless ?? true};
}

export default getChartLayoutModeProps;
