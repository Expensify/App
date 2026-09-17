function parseApprovalLimit(value: string | number | undefined, decimals: number): string | null {
    const normalizedValue = String(value ?? '').trim();

    if (!normalizedValue) {
        return '';
    }

    const valueWithoutFormatting = normalizedValue.replaceAll(/[$€£¥,\s]/g, '');
    const [wholePart, fractionalPart = ''] = valueWithoutFormatting.split('.');

    if (!/^\d+$/.test(wholePart) || !/^\d*$/.test(fractionalPart) || fractionalPart.length > decimals) {
        return null;
    }

    const amountInMinorUnits = `${wholePart}${fractionalPart.padEnd(decimals, '0')}`.replace(/^0+(?=\d)/, '');
    return amountInMinorUnits || '0';
}

function isApprovalLimitChanged(importedApprovalLimit: string, existingApprovalLimit: number | null | undefined): boolean {
    if (importedApprovalLimit === '') {
        return importedApprovalLimit !== String(existingApprovalLimit ?? '');
    }

    return existingApprovalLimit == null || Number(importedApprovalLimit) !== existingApprovalLimit;
}

export {isApprovalLimitChanged, parseApprovalLimit};
