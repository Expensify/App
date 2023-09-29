import {Asset} from 'react-native-image-picker';

type FileDownload = (url: string, fileName: string) => Promise<void>;
type GetImageResolution = (url: File | Asset) => Promise<{width: number; height: number}>;

type SplitExtensionFromFileName = (fileName: string) => {fileName: string; fileExtension: string};
type ReadFileAsync = (path: string, fileName: string) => Promise<File | void>;

export type {SplitExtensionFromFileName, ReadFileAsync, FileDownload, GetImageResolution};
