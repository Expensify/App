import type {ImageSourcePropType} from 'react-native';
import type {FileObject} from '@src/types/utils/Attachment';

type OnFileRead = (source: string, file: FileObject, filename: string) => void;

type OnFileError = (error: unknown) => void;

type AssetExtension = 'jpg' | 'png';

type SetTestReceipt = (asset: ImageSourcePropType, assetExtension: AssetExtension, onFileRead: OnFileRead, onFileError?: OnFileError) => void;

export type {AssetExtension, SetTestReceipt};
