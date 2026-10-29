import type {DynamicFormValues} from '@components/DynamicForm/types';
import getContentFields from '@components/DynamicForm/utils/getContentFields';

import type {UpdateWiseOnboardingAdditionalDataParams} from '@libs/API/parameters';
import isFileUploadable from '@libs/isFileUploadable';

import type {DynamicFormPage} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

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

function getFiles(answer: DynamicFormValues[string]): FileObject[] {
    return Array.isArray(answer) ? answer.filter((item): item is FileObject => typeof item === 'object' && item !== null) : [];
}

/**
 * The parameters of one `UpdateWiseOnboardingAdditionalData` call for a page the user left with Next.
 * Files the server holds are listed in `documents`, new ones are sent as `<field>[<index>]`, and the rest of the answers go in `inputs`.
 * Every file field of the page is listed in `documents`, so a file the user removed, or a field the answers now hide, is removed on the server too.
 * When a drafted file cannot be uploaded, `documents` is left out, so the server keeps the page's files instead of dropping one the user still sees.
 */
function getWiseOnboardingPageParams(
    bankAccountID: number,
    page: DynamicFormPage,
    answers: DynamicFormValues,
    sensitiveAnswers: DynamicFormValues,
): UpdateWiseOnboardingAdditionalDataParams {
    const fileFieldKeys = new Set(
        getContentFields(page.content)
            .filter((field) => field.type === 'file')
            .map((field) => field.key),
    );
    const inputs: DynamicFormValues = {};
    const documents: Record<string, string[]> = {};
    const newFiles: Record<`${string}[${number}]`, FileObject> = {};
    let hasFileWithoutData = false;

    for (const fieldKey of fileFieldKeys) {
        const files = getFiles(answers[fieldKey]);
        documents[fieldKey] = files.filter(isSavedFile).map((file) => file.savedFileKey);
        const localFiles = files.filter((file) => !isSavedFile(file));
        // An entry that cannot be uploaded would reach the server as "[object Object]", so it is left out
        const uploadableFiles = localFiles.filter((file) => isFileUploadable(file));
        hasFileWithoutData ||= uploadableFiles.length < localFiles.length;
        for (const [index, file] of uploadableFiles.entries()) {
            newFiles[`${fieldKey}[${index}]`] = file;
        }
    }
    for (const [key, answer] of Object.entries(answers)) {
        if (!fileFieldKeys.has(key)) {
            inputs[key] = answer;
        }
    }

    // A blank SSN keeps the one the server holds, so it is only sent when the user typed one
    const ssn = typeof sensitiveAnswers.ssn === 'string' && sensitiveAnswers.ssn !== '' ? sensitiveAnswers.ssn : undefined;

    return {
        bankAccountID,
        step: page.key,
        inputs: JSON.stringify(inputs),
        ...(fileFieldKeys.size > 0 && !hasFileWithoutData ? {documents: JSON.stringify(documents)} : {}),
        ...(ssn ? {ssn} : {}),
        ...newFiles,
    };
}

export default getWiseOnboardingPageParams;
export {toSavedFile};
