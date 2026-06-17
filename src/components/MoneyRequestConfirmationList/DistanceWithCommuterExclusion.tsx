import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Unit} from '@src/types/onyx/Policy';
import type {Transaction} from '@src/types/onyx';

type DistanceWithCommuterExclusionProps = {
    transaction: Transaction | undefined;
};

function formatDistance(distance: number | undefined | null, unit: Unit | undefined): string {
    if (distance === undefined || distance === null || !unit) {
        return '';
    }
    return `${distance.toFixed(2)} ${unit}`;
}

/**
 * Three-line distance breakdown shown on the confirmation, edit, and history surfaces
 * whenever a workspace commuter exclusion has been applied to the transaction.
 *
 * Reads `comment.customUnit.{quantity, commuterExclusion, reimbursableDistance, distanceUnit}`
 * and renders nothing when `commuterExclusion` is not positive.
 */
function DistanceWithCommuterExclusion({transaction}: DistanceWithCommuterExclusionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const customUnit = transaction?.comment?.customUnit;
    const commuterExclusion = customUnit?.commuterExclusion;

    if (!customUnit || !commuterExclusion || commuterExclusion <= 0) {
        return null;
    }

    const unit = customUnit.distanceUnit;
    const original = customUnit.quantity ?? 0;
    const reimbursable = customUnit.reimbursableDistance ?? Math.max(0, original - commuterExclusion);

    return (
        <View style={[styles.flexColumn, styles.ph5, styles.pv3, styles.gap2]}>
            <View style={[styles.flexRow, styles.justifyContentBetween]}>
                <Text style={[styles.textLabelSupporting]}>{translate('distance.commuterExclusion.originalDistance')}</Text>
                <Text style={[styles.textLabelSupporting]}>{formatDistance(original, unit)}</Text>
            </View>
            <View style={[styles.flexRow, styles.justifyContentBetween]}>
                <Text style={[styles.textLabelSupporting]}>{translate('distance.commuterExclusion.commutingDistance')}</Text>
                <Text style={[styles.textLabelSupporting]}>{`- ${formatDistance(commuterExclusion, unit)}`}</Text>
            </View>
            <View style={[styles.flexRow, styles.justifyContentBetween]}>
                <Text style={[styles.textBold]}>{translate('distance.commuterExclusion.reimbursableDistance')}</Text>
                <Text style={[styles.textBold]}>{formatDistance(reimbursable, unit)}</Text>
            </View>
        </View>
    );
}

DistanceWithCommuterExclusion.displayName = 'DistanceWithCommuterExclusion';

export default DistanceWithCommuterExclusion;
