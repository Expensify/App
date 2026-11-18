import type {SourceOfWealth} from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/kycRequirementAttributes';
import {getAcceptedDocumentTypes, getAcceptedSources, getSourcesNeedingBankStatement} from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/kycRequirementAttributes';

import CONST from '@src/CONST';
import type {DynamicFormContentItem, DynamicFormFieldOption, DynamicFormFileUpload, DynamicFormPage} from '@src/types/onyx';
import type {WiseKYCRequirement} from '@src/types/onyx/WiseKYCReview';

import type {ValueOf} from 'type-fest';

type SourceOfWealthDocumentType = ValueOf<typeof CONST.WISE.SOURCE_OF_WEALTH_DOCUMENT_TYPE>;

const KNOWN_DOCUMENT_TYPES = new Set<string>(Object.values(CONST.WISE.SOURCE_OF_WEALTH_DOCUMENT_TYPE));

function isKnownDocumentType(documentType: string): documentType is SourceOfWealthDocumentType {
    return KNOWN_DOCUMENT_TYPES.has(documentType);
}

/** A document type the App has no name for keeps Wise's key as its label, so the user can still pick it */
function getDocumentTypeOption(documentType: string): DynamicFormFieldOption {
    if (!isKnownDocumentType(documentType)) {
        return {key: documentType, label: documentType};
    }
    return {key: documentType, labelKey: `walletPage.wiseOnboarding.sourceOfWealthProof.documentTypes.${documentType}`};
}

/** An upload button for the given document types. A button for one type is named after it. */
function getUpload(documentTypes: string[]): DynamicFormFileUpload {
    const [onlyType] = documentTypes;
    return {
        fileTypes: documentTypes.map(getDocumentTypeOption),
        ...(documentTypes.length === 1 && onlyType && isKnownDocumentType(onlyType) ? {labelKey: `walletPage.wiseOnboarding.sourceOfWealthProof.uploadButtons.${onlyType}` as const} : {}),
    };
}

/** A source's upload buttons: one for the documents to pick from, and one for the bank statement when the source needs it besides them */
function getUploads(attributes: WiseKYCRequirement['attributes'], source: SourceOfWealth): DynamicFormFileUpload[] {
    const documentTypes = getAcceptedDocumentTypes(attributes, source);
    const bankStatement = CONST.WISE.SOURCE_OF_WEALTH_DOCUMENT_TYPE.BANK_STATEMENT;
    const needsBankStatement = getSourcesNeedingBankStatement(attributes).includes(source) && documentTypes.includes(bankStatement);
    const otherTypes = needsBankStatement ? documentTypes.filter((documentType) => documentType !== bankStatement) : documentTypes;
    return [
        ...(otherTypes.length > 0 ? [getUpload(otherTypes)] : []),
        ...(needsBankStatement ? [{...getUpload([bankStatement]), descriptionKey: `walletPage.wiseOnboarding.sourceOfWealthProof.bankStatementHints.${source}` as const}] : []),
    ];
}

/**
 * A source's heading and its upload buttons, shown while the source is picked, since Wise needs proof of every source, funding daily operations or not. The field key names the source, so each saved file's key names its source and its document type.
 * The heading lists the documents to pick from when a button offers a choice, since a button for one document is named after it.
 */
function getSourceSection(attributes: WiseKYCRequirement['attributes'], source: SourceOfWealth): DynamicFormContentItem[] {
    const showWhen = {key: CONST.WISE.SOURCE_OF_WEALTH_INFO_KEY, equals: [source]};
    const uploads = getUploads(attributes, source);
    return [
        {
            key: `${source}-heading`,
            titleKey: `walletPage.wiseOnboarding.sourceOfWealth.options.${source}`,
            ...(uploads.some((upload) => upload.fileTypes.length > 1) ? {descriptionKey: `walletPage.wiseOnboarding.sourceOfWealthProof.hints.${source}` as const} : {}),
            showWhen,
        },
        {
            key: `proofFile-${source}`,
            type: 'file',
            required: true,
            // Wise takes up to 10 files in one review
            maxFiles: 10,
            labelKey: `walletPage.wiseOnboarding.sourceOfWealth.options.${source}`,
            uploads,
            showWhen,
        },
    ];
}

/** Documents proving each picked source, each labelled with a document type Wise accepts for its source */
function getSourceOfWealthProofPage(attributes: WiseKYCRequirement['attributes']): DynamicFormPage {
    return {
        key: CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_PROOF,
        titleKey: 'walletPage.wiseOnboarding.sourceOfWealthProof.title',
        descriptionKey: 'walletPage.wiseOnboarding.sourceOfWealthProof.description',
        content: getAcceptedSources(attributes).flatMap((source) => getSourceSection(attributes, source)),
    };
}

export default getSourceOfWealthProofPage;
