import type {LocalizedTranslate} from '@components/LocaleContextProvider';

type DownloadAttachmentFile = (translate: LocalizedTranslate, url: string, fileName: string, shouldUnlink?: boolean) => void;

export default DownloadAttachmentFile;
