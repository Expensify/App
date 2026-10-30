import type {DynamicFormValues} from '@components/DynamicForm/types';
import getContentFields from '@components/DynamicForm/utils/getContentFields';

import CONST from '@src/CONST';
import type {DynamicFormPage} from '@src/types/onyx';
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

/** Every file field the server holds files for on the given pages, as draft entries. A field it emptied comes back as an empty list. */
function getSavedFileAnswers(documents: Record<string, Record<string, string[] | null> | null> | undefined): DynamicFormValues {
    const answers: DynamicFormValues = {};
    for (const pageDocuments of Object.values(documents ?? {})) {
        for (const [fieldKey, fileKeys] of Object.entries(pageDocuments ?? {})) {
            if (fileKeys) {
                answers[fieldKey] = fileKeys.map(toSavedFile);
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

function getFiles(answer: DynamicFormValues[string]): FileObject[] {
    return Array.isArray(answer) ? answer.filter((item): item is FileObject => typeof item === 'object' && item !== null) : [];
}

/**
 * The parameters of one `UpdateWiseOnboardingAdditionalData` call for a page the user left with Next.
 * Files the server holds are listed in `documents`, new ones are sent as `<field>[<index>]`, and the rest of the answers go in `inputs`.
 * Every file field of the page is listed in `documents`, so a file the user removed, or a field the answers now hide, is removed on the server too.
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

    for (const fieldKey of fileFieldKeys) {
        const files = getFiles(answers[fieldKey]);
        documents[fieldKey] = files.filter(isSavedFile).map((file) => file.savedFileKey);
        const localFiles = files.filter((file) => !isSavedFile(file));
        // An entry that cannot be uploaded would reach the server as "[object Object]", so it is left out. It was never on the server, so nothing is lost there.
        const uploadableFiles = localFiles.filter((file) => isFileUploadable(file));
        for (const [index, file] of uploadableFiles.entries()) {
            newFiles[`${fieldKey}[${index}]`] = file;
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
        inputs: JSON.stringify(inputs),
        ...(fileFieldKeys.size > 0 ? {documents: JSON.stringify(documents)} : {}),
        ...newFiles,
    };
}

export default getWiseOnboardingPageParams;
export {getSavedFileAnswers, toSavedFile};
