type FileType = {
    extension: string;
    mimeType: string;
};

export default {
    TEXT: {
        extension: '.txt',
        mimeType: 'text/plain',
    },
    JSON: {
        extension: '.json',
        mimeType: 'application/json',
    },
    HTML: {
        extension: '.html',
        mimeType: 'text/html',
    },
} as const satisfies Record<string, FileType>;
export type {FileType};
