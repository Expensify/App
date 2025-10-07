type ImagePickerResponse = {
    height?: number;
    name: string;
    size?: number | null;
    type: string;
    uri: string;
    width?: number;
};

type FileObject = Partial<File | ImagePickerResponse> & {getAsFile?: () => File | null};

const isFileObjectWithGetAsFile = (item: FileObject): item is FileObject => {
    return 'getAsFile' in item && typeof item.getAsFile === 'function' && item.getAsFile?.() !== null;
};

export type {FileObject, ImagePickerResponse};
export {isFileObjectWithGetAsFile};
