import type {TranslationPaths} from '@src/languages/types';
import useDocumentTitle from './useDocumentTitle';
import useLocalize from './useLocalize';

/**
 * Sets the browser document title for domain pages using the format "domainName - PageTitle".
 * Falls back to empty string (default title) if domain name is not yet available.
 */
function useDomainDocumentTitle(domainName: string | undefined, titleKey: TranslationPaths) {
    const {translate} = useLocalize();
    useDocumentTitle(domainName ? `${domainName} - ${translate(titleKey)}` : '');
}

export default useDomainDocumentTitle;
