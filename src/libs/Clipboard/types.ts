import {FileObject} from '@components/AttachmentModal';

type SetString = (text: string) => void;
type SetHtml = (html: string, text: string) => void;
type CanSetHtml = (() => (...args: ClipboardItems) => Promise<void>) | (() => boolean);
type GetImage = () => Promise<FileObject | undefined>;

export type {SetString, CanSetHtml, SetHtml, GetImage};
