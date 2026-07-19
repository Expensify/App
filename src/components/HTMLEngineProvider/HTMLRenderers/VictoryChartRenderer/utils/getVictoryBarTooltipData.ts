import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {sanitizeCurrencyCode} from '@libs/CurrencyUtils';

import CONST from '@src/CONST';

type VictoryBarTooltipPoint = {
    label: string;
    value: number;
    currency?: string;
};

type VictoryBarTooltipData = {
    label: string;
    amount: string;
    percentage: string;
};

function formatVictoryBarTooltipAmount(value: number, currency: string | undefined, numberFormat: LocaleContextProps['numberFormat']): string {
    const fractionDigits = Number.isInteger(value) ? 0 : 2;

    return numberFormat(value, {
        style: 'currency',
        currency: sanitizeCurrencyCode(currency ?? CONST.CURRENCY.USD),
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: 2,
    });
}

function getVictoryBarTooltipData(
    activePoint: VictoryBarTooltipPoint | undefined,
    visibleValues: number[],
    numberFormat: LocaleContextProps['numberFormat'],
): VictoryBarTooltipData | undefined {
    if (!activePoint) {
        return undefined;
    }

    const totalSum = visibleValues.reduce((sum, value) => sum + Math.abs(value), 0);
    const percent = totalSum > 0 ? Math.round((Math.abs(activePoint.value) / totalSum) * 100) : 0;

    return {
        label: activePoint.label,
        amount: formatVictoryBarTooltipAmount(activePoint.value, activePoint.currency, numberFormat),
        percentage: percent < 1 ? '<1%' : `${percent}%`,
    };
}

export type {VictoryBarTooltipData, VictoryBarTooltipPoint};
export default getVictoryBarTooltipData;
