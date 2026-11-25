/**
 * The Tax section of Add rate for UK rates. A government rate lists the fuel-band amounts it adds, and a custom rate
 * asks for its own tax reclaimable amount.
 */
import AmountForm from '@components/AmountForm';
import InputWrapper from '@components/Form/InputWrapper';
import Icon from '@components/Icon';
import Switch from '@components/Switch';
import Text from '@components/Text';
import type {ValuePickerItem} from '@components/ValuePicker/types';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/PolicyCreateDistanceRateForm';

import React from 'react';
import {View} from 'react-native';

import DistanceRateTaxRateDropdown from './DistanceRateTaxRateDropdown';

type FuelBandTaxReclaimable = {
    sourceRateID: string;
    name: string;

    /** Tax reclaimable amount, formatted in the workspace currency */
    amount: string;
};

type DistanceRateTaxSectionProps = {
    /** Whether the rate being added is a government rate, which shows the fuel-band amounts instead of an amount field */
    isGovernmentRate: boolean;

    isReclaimVATOn: boolean;

    onToggleReclaimVAT: (isOn: boolean) => void;

    /** What saving changes outside this rate, shown under the toggle */
    note?: string;

    /** Whether the tax rate field shows. It's hidden when there is no tax rate the bands could use yet. */
    shouldShowTaxRate: boolean;

    taxRates: ValuePickerItem[];

    selectedTaxRateCode: string | undefined;

    onSelectTaxRate: (taxRateCode: string) => void;

    fuelBands: FuelBandTaxReclaimable[];

    currency: string;
};

function DistanceRateTaxSection({
    isGovernmentRate,
    isReclaimVATOn,
    onToggleReclaimVAT,
    note,
    shouldShowTaxRate,
    taxRates,
    selectedTaxRateCode,
    onSelectTaxRate,
    fuelBands,
    currency,
}: DistanceRateTaxSectionProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Info']);
    const taxReclaimableLabel = translate('workspace.taxes.taxReclaimableOn');

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
            {!!note && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.mt4]}>
                    <Icon
                        src={icons.Info}
                        fill={theme.icon}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                    <Text style={[styles.textLabelSupporting, styles.flex1]}>{note}</Text>
                </View>
            )}
            {isReclaimVATOn && shouldShowTaxRate && (
                <View style={[styles.mhn4, styles.mt4]}>
                    <DistanceRateTaxRateDropdown
                        label={translate('workspace.taxes.taxRate')}
                        selectedTaxRateCode={selectedTaxRateCode}
                        taxRates={taxRates}
                        onSelectTaxRate={onSelectTaxRate}
                    />
                </View>
            )}
            {isReclaimVATOn && isGovernmentRate && fuelBands.length > 0 && (
                <View style={[styles.highlightBG, styles.br4, styles.mt4]}>
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.gap3, styles.ph4, styles.pv3, styles.borderBottom]}>
                        <Text style={styles.textLabelSupporting}>{translate('workspace.distanceRates.addRatePage.fuelType')}</Text>
                        <Text style={styles.textLabelSupporting}>{taxReclaimableLabel}</Text>
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
            )}
            {isReclaimVATOn && !isGovernmentRate && (
                <View style={styles.mt4}>
                    <InputWrapper
                        InputComponent={AmountForm}
                        inputID={INPUT_IDS.TAX_CLAIMABLE_VALUE}
                        decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
                        currency={currency}
                        isCurrencyPressable={false}
                        displayAsTextInput
                        label={taxReclaimableLabel}
                    />
                </View>
            )}
        </>
    );
}

export default DistanceRateTaxSection;
export type {FuelBandTaxReclaimable};
