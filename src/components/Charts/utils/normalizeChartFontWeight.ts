type ChartLabelFontWeight = 'normal' | 'bold';

function normalizeChartFontWeight(fontWeight: string | number | undefined): ChartLabelFontWeight {
    if (fontWeight === 'bold') {
        return 'bold';
    }

    const numericWeight = Number(fontWeight);

    if (!Number.isNaN(numericWeight) && numericWeight >= 600) {
        return 'bold';
    }

    return 'normal';
}

export default normalizeChartFontWeight;
export type {ChartLabelFontWeight};
