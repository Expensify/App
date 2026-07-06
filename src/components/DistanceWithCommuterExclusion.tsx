import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';

import type {Unit} from '@src/types/onyx/Policy';

import React from 'react';

import Text from './Text';

type DistanceWithCommuterExclusionProps = {
    /** The commuter exclusion distance that was removed */
    commuterExclusion: number;

    /** The unit of distance (mi/km) */
    distanceUnit: Unit;
};

function DistanceWithCommuterExclusion({commuterExclusion, distanceUnit}: DistanceWithCommuterExclusionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const formattedDistance = DistanceRequestUtils.getFormattedDistanceInUnits(commuterExclusion, distanceUnit, translate, false, true);

    return <Text style={[styles.textLabelSupporting, styles.mt1]}>{translate('distance.commuterExclusion.removedCommuterDistance', {formattedDistance})}</Text>;
}

DistanceWithCommuterExclusion.displayName = 'DistanceWithCommuterExclusion';

export default DistanceWithCommuterExclusion;
