import type {LocalizedTranslate} from '@components/LocaleContextProvider';

type DownloadAttachmentFile = (translate: LocalizedTranslate, url: string, fileName: string, shouldUnlink?: boolean, shouldOpenExternalLink?: boolean) => Promise<void>;

export default DownloadAttachmentFile;
