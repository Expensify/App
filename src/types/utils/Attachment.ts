type ImagePickerResponse = {
    height?: number;
    name: string;
    size?: number | null;
    type: string;
    uri: string;
    width?: number;
};

type FileObject = Partial<File | ImagePickerResponse> & {getAsFile?: () => File | null; lastModified?: number; receiptTraceId?: string};

export type {FileObject, ImagePickerResponse};
