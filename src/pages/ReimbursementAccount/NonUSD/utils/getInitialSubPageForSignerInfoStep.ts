import CONST from '@src/CONST';

const SUB_PAGE_NAMES = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SUB_PAGE_NAMES;

function getInitialSubPageForSignerInfoStep(signerEmail: string | undefined, signerName: string | undefined, secondSignerEmail: string | undefined, policyCurrency: string): string {
    if (policyCurrency === CONST.CURRENCY.AUD) {
        if (signerEmail === undefined && secondSignerEmail === undefined) {
            return SUB_PAGE_NAMES.IS_DIRECTOR;
        }

        return SUB_PAGE_NAMES.HANG_TIGHT;
    }

    if (signerEmail === undefined || signerName !== undefined) {
        return SUB_PAGE_NAMES.IS_DIRECTOR;
    }

    return SUB_PAGE_NAMES.HANG_TIGHT;
}

export default getInitialSubPageForSignerInfoStep;
