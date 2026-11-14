import type {DynamicFormValues} from '@components/DynamicForm/types';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import isSupportedField from '@components/DynamicForm/utils/isSupportedField';
import {getListItemFiles, getListItems} from '@components/DynamicForm/utils/listItems';

import CONST from '@src/CONST';
import type {DynamicFormPage} from '@src/types/onyx';
import type {WiseSourceOfWealthEntry} from '@src/types/onyx/ReimbursementAccount';
import type {FileObject} from '@src/types/utils/Attachment';

import type {ValueOf} from 'type-fest';

import type {UpdateWiseOnboardingAdditionalDataParams} from './API/parameters';

import isFileUploadable from './isFileUploadable';

/** A file the server already holds, put back in the draft on resume. Its key tells it apart from a file picked on this device. */
type WiseSavedFile = FileObject & {savedFileKey: string};

function isSavedFile(file: FileObject): file is WiseSavedFile {
    return typeof (file as Partial<WiseSavedFile>).savedFileKey === 'string';
}

/** A draft entry for a file the server holds, named after the last part of its key */
function toSavedFile(savedFileKey: string): WiseSavedFile {
    return {
        name: savedFileKey.split('/').at(-1) ?? savedFileKey,
        uri: savedFileKey,
        savedFileKey,
    };
}

/** Separates a labelled file field's key from the file type in the key the server stores its files under */
const FILE_TYPE_SEPARATOR = '-';

/** The key the server stores a labelled file field's files of one type under, such as `proofFile-REVENUE-TAX_DOCUMENTS` */
function getLabelledFileKey(fieldKey: string, fileType: string): string {
    return `${fieldKey}${FILE_TYPE_SEPARATOR}${fileType}`;
}

/** The answers with the files the server holds under one key: a plain field's list, or the entry of one type of a labelled field, which an empty list removes */
function withSavedFiles(answers: DynamicFormValues, fileKey: string, savedFileKeys: string[]): DynamicFormValues {
    const separatorIndex = fileKey.lastIndexOf(FILE_TYPE_SEPARATOR);
    if (separatorIndex === -1) {
        return {...answers, [fileKey]: savedFileKeys.map(toSavedFile)};
    }
    const fieldKey = fileKey.slice(0, separatorIndex);
    const fileType = fileKey.slice(separatorIndex + 1);
    const otherEntries = getListItems(answers[fieldKey]).filter((entry) => entry.fileType !== fileType);
    return {...answers, [fieldKey]: savedFileKeys.length > 0 ? [...otherEntries, {id: fileType, fileType, files: savedFileKeys.map(toSavedFile)}] : otherEntries};
}

/**
 * Every file field the server holds files for on the given pages, as draft entries. A field it emptied comes back as an empty list.
 * The skipped pages are left out, so the local files of a page whose save failed stay in the draft for the next save.
 */
function getSavedFileAnswers(documents: Record<string, Record<string, string[] | null> | null> | undefined, skippedPageKeys: string[] = []): DynamicFormValues {
    let answers: DynamicFormValues = {};
    for (const [pageKey, pageDocuments] of Object.entries(documents ?? {})) {
        if (skippedPageKeys.includes(pageKey)) {
            continue;
        }
        for (const [fileKey, savedFileKeys] of Object.entries(pageDocuments ?? {})) {
            if (savedFileKeys) {
                answers = withSavedFiles(answers, fileKey, savedFileKeys);
            }
        }
    }
    return answers;
}

type WiseOnboardingStep = ValueOf<typeof CONST.WISE.ONBOARDING_STEP>;

const WISE_ONBOARDING_STEPS = new Set<string>(Object.values(CONST.WISE.ONBOARDING_STEP));

function isWiseOnboardingStep(key: string): key is WiseOnboardingStep {
    return WISE_ONBOARDING_STEPS.has(key);
}

function getStrings(answer: unknown): string[] {
    if (!Array.isArray(answer)) {
        return [];
    }
    const items: unknown[] = answer;
    return items.filter((item): item is string => typeof item === 'string');
}

/** The entries of a `sourceOfWealthList` the server stores, ignoring anything malformed */
function getSourceOfWealthEntries(sourceOfWealthList: unknown): WiseSourceOfWealthEntry[] {
    if (!Array.isArray(sourceOfWealthList)) {
        return [];
    }
    const entries: unknown[] = sourceOfWealthList;
    return entries.flatMap((entry) => {
        if (typeof entry !== 'object' || entry === null || !('businessSourceOfWealthInfo' in entry) || typeof entry.businessSourceOfWealthInfo !== 'string') {
            return [];
        }
        const isSourceOfFund = 'isSourceOfFund' in entry && typeof entry.isSourceOfFund === 'boolean' ? entry.isSourceOfFund : undefined;
        return [
            isSourceOfFund === undefined ? {businessSourceOfWealthInfo: entry.businessSourceOfWealthInfo} : {businessSourceOfWealthInfo: entry.businessSourceOfWealthInfo, isSourceOfFund},
        ];
    });
}

/**
 * The page's inputs as Wise takes them. Both source of wealth pages save Wise's whole `sourceOfWealthList`, since the server replaces the saved page on every save,
 * and every entry says whether the source funds daily operations, since Submit needs it for each one. A lone source funds them.
 */
function toWiseInputs(step: WiseOnboardingStep, inputs: DynamicFormValues): Record<string, unknown> {
    if (step !== CONST.WISE.ONBOARDING_STEP.BUSINESS_SOURCE_OF_WEALTH_INFO) {
        return inputs;
    }
    const {[CONST.WISE.SOURCE_OF_WEALTH_INFO_KEY]: sources, [CONST.WISE.SOURCE_OF_FUNDS_KEY]: fundingSources, ...otherInputs} = inputs;
    const pickedSources = getStrings(sources);
    const sourceOfWealthList: WiseSourceOfWealthEntry[] = pickedSources.map((source) => ({
        businessSourceOfWealthInfo: source,
        isSourceOfFund: pickedSources.length === 1 || getStrings(fundingSources).includes(source),
    }));
    return {...otherInputs, [CONST.WISE.SOURCE_OF_WEALTH_LIST_KEY]: sourceOfWealthList};
}

function getFiles(answer: DynamicFormValues[string]): FileObject[] {
    return Array.isArray(answer) ? answer.filter((item): item is FileObject => typeof item === 'object' && item !== null) : [];
}

/** A page's files by the key the server stores them under. A labelled field lists every type it offers, so a type the user emptied is emptied on the server too. */
function getFilesByKey(page: DynamicFormPage, answers: DynamicFormValues): Map<string, FileObject[]> {
    const filesByKey = new Map<string, FileObject[]>();
    for (const field of getContentFields(page.content).filter(isSupportedField)) {
        if (field.type !== 'file') {
            continue;
        }
        if (!field.uploads) {
            filesByKey.set(field.key, getFiles(answers[field.key]));
            continue;
        }
        const entries = getListItems(answers[field.key]);
        for (const {key: fileType} of field.uploads.flatMap((upload) => upload.fileTypes)) {
            const entry = entries.find((candidate) => candidate.fileType === fileType);
            filesByKey.set(getLabelledFileKey(field.key, fileType), entry ? getListItemFiles(entry) : []);
        }
    }
    return filesByKey;
}

/**
 * The parameters of one `UpdateWiseOnboardingAdditionalData` call for a page the user left with Next.
 * Files the server holds are listed in `documents`, new ones are sent as `<key>[<index>]`, and the rest of the answers go in `inputs`. A labelled field's files go under `<field>-<type>`.
 * Every file key of the page is listed in `documents`, so a file the user removed, or a field the answers now hide, is removed on the server too.
 * A page whose key is not a step the server accepts gets nothing, since the server would answer it with 400 Invalid step.
 */
function getWiseOnboardingPageParams(bankAccountID: number, page: DynamicFormPage, answers: DynamicFormValues): UpdateWiseOnboardingAdditionalDataParams | undefined {
    const step = page.key;
    if (!isWiseOnboardingStep(step)) {
        return undefined;
    }
    const fileFieldKeys = new Set(
        getContentFields(page.content)
            .filter((field) => field.type === 'file')
            .map((field) => field.key),
    );
    const inputs: DynamicFormValues = {};
    const documents: Record<string, string[]> = {};
    const newFiles: Record<`${string}[${number}]`, FileObject> = {};

    for (const [fileKey, files] of getFilesByKey(page, answers)) {
        documents[fileKey] = files.filter(isSavedFile).map((file) => file.savedFileKey);
        const localFiles = files.filter((file) => !isSavedFile(file));
        // An entry that cannot be uploaded would reach the server as "[object Object]", so it is left out. It was never on the server, so nothing is lost there.
        const uploadableFiles = localFiles.filter((file) => isFileUploadable(file));
        for (const [index, file] of uploadableFiles.entries()) {
            newFiles[`${fileKey}[${index}]`] = file;
        }
    }
    for (const [key, answer] of Object.entries(answers)) {
        if (!fileFieldKeys.has(key)) {
            inputs[key] = answer;
        }
    }

    return {
        bankAccountID,
        step,
        // The server rejects `[]` as "Inputs is not a valid json object", while `{}` reads as no answers
        inputs: Object.keys(inputs).length > 0 ? JSON.stringify(toWiseInputs(step, inputs)) : '{}',
        ...(fileFieldKeys.size > 0 ? {documents: JSON.stringify(documents)} : {}),
        ...newFiles,
    };
}

export default getWiseOnboardingPageParams;
export {getLabelledFileKey, getSavedFileAnswers, getSourceOfWealthEntries, toSavedFile, withSavedFiles};
