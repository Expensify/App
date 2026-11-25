/**
 * The Tax section of Add rate for UK rates: its header and `Reclaim VAT on fuel` toggle, with the fields for the chosen
 * kind of rate as children. Also exports the section's note row and the government rate's fuel band table.
 */
import Icon from '@components/Icon';
import Switch from '@components/Switch';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type DistanceRateTaxSectionProps = {
    isReclaimVATOn: boolean;

    onToggleReclaimVAT: (isOn: boolean) => void;

    children?: React.ReactNode;
};

type DistanceRateTaxNoteProps = {
    children: React.ReactNode;
};

type FuelBandTaxReclaimable = {
    sourceRateID: string;
    name: string;

    /** Tax reclaimable amount, formatted in the workspace currency */
    amount: string;
};

type FuelBandTaxTableProps = {
    fuelBands: FuelBandTaxReclaimable[];
};

function DistanceRateTaxSection({isReclaimVATOn, onToggleReclaimVAT, children}: DistanceRateTaxSectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <>
            <View style={[styles.sectionDividerLine, styles.mv6]} />
            <Text
                variant="labelStrong"
                style={styles.mb5}
            >
                {translate('workspace.distanceRates.addRatePage.tax')}
            </Text>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                <Text
                    style={styles.textNormal}
                    accessible={false}
                    aria-hidden
                >
                    {translate('workspace.distanceRates.addRatePage.reclaimVATOnFuel')}
                </Text>
                <Switch
                    isOn={isReclaimVATOn}
                    accessibilityLabel={translate('workspace.distanceRates.addRatePage.reclaimVATOnFuel')}
                    sentryLabel={CONST.SENTRY_LABEL.CREATE_DISTANCE_RATE.RECLAIM_VAT_SWITCH}
                    onToggle={onToggleReclaimVAT}
                />
            </View>
            {children}
        </>
    );
}

/** What saving changes outside the rate, shown under the toggle */
function DistanceRateTaxNote({children}: DistanceRateTaxNoteProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Info']);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.mt4]}>
            <Icon
                src={icons.Info}
                fill={theme.icon}
                width={variables.iconSizeNormal}
                height={variables.iconSizeNormal}
            />
            <Text style={[styles.textLabelSupporting, styles.flex1]}>{children}</Text>
        </View>
    );
}

/** The fuel band rates a government rate adds, with what each one reclaims tax on */
function FuelBandTaxTable({fuelBands}: FuelBandTaxTableProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (fuelBands.length === 0) {
        return null;
    }

    return (
        <View style={[styles.highlightBG, styles.br4, styles.mt4]}>
            <View style={[styles.flexRow, styles.justifyContentBetween, styles.gap3, styles.ph4, styles.pv3, styles.borderBottom]}>
                <Text style={styles.textLabelSupporting}>{translate('workspace.distanceRates.addRatePage.fuelType')}</Text>
                <Text style={styles.textLabelSupporting}>{translate('workspace.taxes.taxReclaimableOn')}</Text>
            </View>
            {fuelBands.map((fuelBand, index) => (
                <View
                    key={fuelBand.sourceRateID}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.ph4, styles.pv4, index < fuelBands.length - 1 && styles.borderBottom]}
                >
                    <Text style={styles.flex1}>{fuelBand.name}</Text>
                    <Text>{fuelBand.amount}</Text>
                </View>
            ))}
        </View>
    );
}

export default DistanceRateTaxSection;
export {DistanceRateTaxNote, FuelBandTaxTable};
export type {FuelBandTaxReclaimable};
