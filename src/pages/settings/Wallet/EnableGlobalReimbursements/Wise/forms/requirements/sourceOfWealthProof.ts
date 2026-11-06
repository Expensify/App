import CONST from '@src/CONST';
import type {DynamicFormPage} from '@src/types/onyx';

/** A document proving the source of funds picked on BUSINESS_SOURCE_OF_WEALTH_INFO */
const sourceOfWealthProofPage: DynamicFormPage = {
    key: CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_PROOF,
    titleKey: 'walletPage.wiseOnboarding.sourceOfWealthProof.title',
    descriptionKey: 'walletPage.wiseOnboarding.sourceOfWealthProof.description',
    content: [
        {
            key: 'proofFile',
            type: 'file',
            required: true,
            maxFiles: 5,
            labelKey: 'walletPage.wiseOnboarding.sourceOfWealthProof.file',
            descriptionKey: 'walletPage.wiseOnboarding.sourceOfWealthProof.fileDescription',
        },
    ],
};

export default sourceOfWealthProofPage;
