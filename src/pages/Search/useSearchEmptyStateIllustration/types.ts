import type {EmptySearchViewItem} from '@pages/Search/EmptySearchView';

type UseSearchEmptyStateIllustration = () => Pick<EmptySearchViewItem, 'headerMediaType' | 'headerMedia' | 'headerStyles' | 'headerContentStyles' | 'lottieWebViewStyles'>;

export default UseSearchEmptyStateIllustration;
