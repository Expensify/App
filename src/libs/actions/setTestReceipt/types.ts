import type {ImageSourcePropType} from 'react-native';
import type {FileObject} from '@components/AttachmentModal';

type OnFileRead = (source: string, file: FileObject, filename: string) => void;

type ReceiptExtension = 'jpg' | 'png';

type SetTestReceipt = (asset: ImageSourcePropType, assetExtension: ReceiptExtension, onFileRead: OnFileRead) => void;

// eslint-disable-next-line import/prefer-default-export
export type {SetTestReceipt};
