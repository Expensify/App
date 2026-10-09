import type {ShareTempFile} from '@src/types/onyx';

function isShareTempFile(file: unknown): file is ShareTempFile {
    return typeof file === 'object' && file !== null && 'id' in file && typeof file.id === 'string' && 'content' in file && typeof file.content === 'string';
}

function getShareTempFile(processedFiles: unknown): ShareTempFile | undefined {
    if (Array.isArray(processedFiles)) {
        const first: unknown = processedFiles.at(0);
        return isShareTempFile(first) ? first : undefined;
    }

    if (isShareTempFile(processedFiles)) {
        return processedFiles;
    }

    if (typeof processedFiles !== 'string' || processedFiles.trim().length === 0) {
        return undefined;
    }

    try {
        const parsed: unknown = JSON.parse(processedFiles);
        return isShareTempFile(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
}

function normalizeShareFileMimeType(mimeType: string | undefined): string {
    return mimeType?.split(';')[0]?.trim()?.toLowerCase() ?? '';
}

export {getShareTempFile, normalizeShareFileMimeType};
