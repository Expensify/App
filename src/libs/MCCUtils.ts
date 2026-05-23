import CONST from '@src/CONST';

function getMCCForDisplay(mcc: number | string | null | undefined): string {
    if (!mcc || mcc === CONST.DEFAULT_NUMBER_ID || mcc === String(CONST.DEFAULT_NUMBER_ID)) {
        return '';
    }

    return String(mcc);
}

function hasDisplayableMCC(mcc: number | string | null | undefined): boolean {
    return getMCCForDisplay(mcc) !== '';
}

export {getMCCForDisplay, hasDisplayableMCC};
