import type {LocalizedTranslate} from '@components/LocaleContextProvider';

type LocalFileDownload = (fileName: string, textContent: string, translate: LocalizedTranslate, successMessage?: string, shouldShowSuccessAlert?: boolean) => void;

export default LocalFileDownload;
