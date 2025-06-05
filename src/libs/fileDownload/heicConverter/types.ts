import type {FileObject} from '@components/AttachmentModal';

type HeicConverterCallbacks = {
    onSuccess?: (convertedFile: FileObject) => void;
    onError?: (error: unknown, originalFile: FileObject) => void;
    onStart?: () => void;
    onFinish?: () => void;
};

type HeicConverterFunction = (file: FileObject, callbacks?: HeicConverterCallbacks) => void;

export type {HeicConverterCallbacks, HeicConverterFunction};
