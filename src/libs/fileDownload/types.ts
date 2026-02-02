import type {Asset} from 'react-native-image-picker';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {RequestType} from '@src/types/onyx/Request';

type FileDownload = (
    translate: LocalizedTranslate,
    url: string,
    fileName?: string,
    successMessage?: string,
    shouldOpenExternalLink?: boolean,
    formData?: FormData,
    requestType?: RequestType,
    onDownloadFailed?: () => void | Promise<void>,
    shouldUnlink?: boolean,
) => Promise<void>;
type ImageResolution = {width: number; height: number};
type GetImageResolution = (url: File | Asset) => Promise<ImageResolution>;

type ExtensionAndFileName = {fileName: string; fileExtension: string};
type SplitExtensionFromFileName = (fileName: string) => ExtensionAndFileName;

type ReadFileAsync = (path: string, fileName: string, onSuccess: (file: File) => void, onFailure?: (error?: unknown) => void, fileType?: string) => Promise<File | void>;

type AttachmentDetails = {
    previewSourceURL: null | string;
    sourceURL: null | string;
    originalFileName: null | string;
};
type GetAttachmentDetails = (html: string) => AttachmentDetails;

export type {SplitExtensionFromFileName, GetAttachmentDetails, ReadFileAsync, FileDownload, GetImageResolution};
