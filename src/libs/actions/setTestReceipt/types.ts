import type {ImageSourcePropType} from 'react-native';
import type {FileObject} from '@components/AttachmentModal';

type OnFileRead = (source: string, file: FileObject, filename: string) => void;

type OnFileError = (error: unknown) => void;

type AssetExtension = 'jpg' | 'png';

type Asset = ImageSourcePropType;

type SetTestReceipt = (asset: Asset, assetExtension: AssetExtension, onFileRead: OnFileRead, onFileError?: OnFileError) => void;

// eslint-disable-next-line import/prefer-default-export
export type {Asset, AssetExtension, SetTestReceipt};
