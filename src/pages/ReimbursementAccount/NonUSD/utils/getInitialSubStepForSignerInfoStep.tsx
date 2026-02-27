import CONST from '@src/CONST';

const SUBSTEP: Record<string, number> = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SUBSTEP;

function getInitialSubStepForSignerInfoStep(signerEmail: string | undefined, signerName: string | undefined, secondSignerEmail: string | undefined, policyCurrency: string): number {
    if (policyCurrency === CONST.CURRENCY.AUD) {
        if (signerEmail === undefined && secondSignerEmail === undefined) {
            return SUBSTEP.IS_DIRECTOR;
        }

        return SUBSTEP.HANG_TIGHT;
    }

    if (signerEmail === undefined || signerName !== undefined) {
        return SUBSTEP.IS_DIRECTOR;
    }

    return SUBSTEP.HANG_TIGHT;
}

export default getInitialSubStepForSignerInfoStep;
