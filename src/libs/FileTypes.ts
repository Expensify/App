type FileType = {
    extension: string;
    fileType: string;
    mimeType: string;
    encoding: string;
};

export default {
    TEXT: {
        extension: '.txt',
        fileType: 'text/plain',
        mimeType: 'text/plain',
        encoding: 'utf-8',
    },
    JSON: {
        extension: '.json',
        fileType: 'application/json',
        mimeType: 'application/json',
        encoding: 'utf-8',
    },
} as const satisfies Record<string, FileType>;
export type {FileType};
