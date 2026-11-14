/** Reads the attributes Wise sends with the source of wealth requirements, ignoring anything malformed */

import CONST from '@src/CONST';
import type {WiseKYCRequirement} from '@src/types/onyx/WiseKYCReview';

import type {ValueOf} from 'type-fest';

type SourceOfWealth = ValueOf<typeof CONST.WISE.SOURCE_OF_WEALTH>;

type KYCRequirementAttributes = WiseKYCRequirement['attributes'];

function getStringList(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }
    const items: unknown[] = value;
    return items.filter((item): item is string => typeof item === 'string');
}

/** The sources the user can pick, in the order the App lists them. All of them when Wise lists none. */
function getAcceptedSources(attributes: KYCRequirementAttributes): SourceOfWealth[] {
    const acceptedSources = getStringList(attributes?.acceptedValues);
    return Object.values(CONST.WISE.SOURCE_OF_WEALTH).filter((source) => acceptedSources.length === 0 || acceptedSources.includes(source));
}

/** The document types Wise accepts for a source. Every type when Wise lists none, since it accepts any of them. */
function getAcceptedDocumentTypes(attributes: KYCRequirementAttributes, source: SourceOfWealth): string[] {
    const documentTypesBySource: unknown = attributes?.acceptedDocumentTypesBySource;
    const sourceEntry = typeof documentTypesBySource === 'object' && documentTypesBySource !== null ? Object.entries(documentTypesBySource).find(([key]) => key === source) : undefined;
    const documentTypes = getStringList(sourceEntry?.[1]);
    return documentTypes.length > 0 ? documentTypes : Object.values(CONST.WISE.SOURCE_OF_WEALTH_DOCUMENT_TYPE);
}

/** The sources whose proof needs a bank statement besides the other documents */
function getSourcesNeedingBankStatement(attributes: KYCRequirementAttributes): string[] {
    return getStringList(attributes?.sourcesNeedingBankStatement);
}

/** The picked sources stored under an answer key, in the order the App lists them */
function getAnsweredSources(attributes: KYCRequirementAttributes, answer: unknown): SourceOfWealth[] {
    const answeredSources = getStringList(answer);
    return getAcceptedSources(attributes).filter((source) => answeredSources.includes(source));
}

export {getAcceptedDocumentTypes, getAcceptedSources, getAnsweredSources, getSourcesNeedingBankStatement, getStringList};
export type {SourceOfWealth};
