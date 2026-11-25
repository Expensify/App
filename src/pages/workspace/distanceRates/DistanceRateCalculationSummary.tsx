import Icon from '@components/Icon';
import SkeletonTextLine from '@components/Skeletons/SkeletonTextLine';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getGovernmentRateNote, hasGovernmentRateNote} from '@libs/PolicyDistanceRatesUtils';
import {getUnitTranslationKey} from '@libs/WorkspaceDisplayUtils';

import {lineHeightScale} from '@styles/typography';
import variables from '@styles/variables';

import type {GovernmentRateCountry} from '@src/CONST';
import type {GovernmentMileageRate} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
import type IconAsset from '@src/types/utils/IconAsset';

import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

const NOTE_SKELETON_WIDTH = 200;

type DistanceRateCalculationSummaryProps = {
    /** Unit the rate is paid in */
    unit: Unit;

    /** Currency the rate is paid in */
    currency: string;

    /** Country of the government rate being added, undefined for a custom rate */
    governmentRateCountry?: GovernmentRateCountry;

    /** Government rate in effect today, undefined while it loads */
    governmentRate?: GovernmentMileageRate;

    /** Whether the rate reclaims VAT on fuel, which is only part of each mile */
    isReclaimingVATOnFuel?: boolean;
};

type SummaryLineProps = {
    icon: IconAsset;
    children: React.ReactNode;
};

function SummaryLine({icon, children}: SummaryLineProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
            <Icon
                src={icon}
                fill={theme.icon}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
            />
            <View style={styles.flex1}>{children}</View>
        </View>
    );
}

/** Explains how a new distance rate is calculated, shown at the bottom of Add rate. */
function DistanceRateCalculationSummary({unit, currency, governmentRateCountry, governmentRate, isReclaimingVATOnFuel = false}: DistanceRateCalculationSummaryProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Car', 'Info']);
    const shouldShowNote = !!governmentRateCountry && hasGovernmentRateNote(governmentRateCountry);
    const note = governmentRateCountry ? getGovernmentRateNote(translate, governmentRateCountry, governmentRate, dateFnsLocale) : undefined;

    return (
        <View style={[styles.mb4, styles.gap3]}>
            {isReclaimingVATOnFuel && (
                <SummaryLine icon={icons.Info}>
                    <Text style={styles.textLabelSupporting}>{translate('workspace.distanceRates.addRatePage.taxOnlyReclaimableOnFuel')}</Text>
                </SummaryLine>
            )}
            <SummaryLine icon={icons.Car}>
                <Text style={styles.textLabelSupporting}>
                    {translate('workspace.distanceRates.addRatePage.unitPaidIn', Str.recapitalize(translate(getUnitTranslationKey(unit))), currency)}
                </Text>
            </SummaryLine>
            {shouldShowNote && (
                <SummaryLine icon={icons.Info}>
                    {note ? (
                        <Text style={styles.textLabelSupporting}>{note}</Text>
                    ) : (
                        <SkeletonTextLine
                            lineHeight={lineHeightScale.label}
                            barWidth={NOTE_SKELETON_WIDTH}
                        />
                    )}
                </SummaryLine>
            )}
        </View>
    );
}

export default DistanceRateCalculationSummary;
