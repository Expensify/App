import {Asset} from 'react-native-image-picker';

type FileDownload = (url: string, fileName: string) => Promise<void>;

type ImageResolution = {width: number; height: number};
type GetImageResolution = (url: File | Asset) => Promise<ImageResolution>;

type ExtensionAndFileName = {fileName: string; fileExtension: string};
type SplitExtensionFromFileName = (fileName: string) => ExtensionAndFileName;

type ReadFileAsync = (path: string, fileName: string, onSuccess: (file: File) => void, onFailure: (error?: unknown) => void) => Promise<File | void>;

type AttachmentDetails = {
    previewSourceURL: null | string;
    sourceURL: null | string;
    originalFileName: null | string;
};
type GetAttachmentDetails = (html: string) => AttachmentDetails;

export type {SplitExtensionFromFileName, GetAttachmentDetails, ReadFileAsync, FileDownload, GetImageResolution};
