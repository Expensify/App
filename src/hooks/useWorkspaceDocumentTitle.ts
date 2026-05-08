import type {TranslationPaths} from '@src/languages/types';
import useDocumentTitle from './useDocumentTitle';
import useLocalize from './useLocalize';

/**
 * Sets the browser document title for workspace pages using the format "PolicyName - PageTitle".
 * Falls back to empty string (default title) if policy name is not yet available.
 */
function useWorkspaceDocumentTitle(policyName: string | undefined, titleKey: TranslationPaths) {
    const {translate} = useLocalize();
    useDocumentTitle(policyName ? `${policyName} - ${translate(titleKey)}` : '');
}

export default useWorkspaceDocumentTitle;
