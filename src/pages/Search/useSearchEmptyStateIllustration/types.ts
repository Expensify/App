import type {EmptySearchViewItem} from '@pages/Search/EmptySearchView';

type UseSearchEmptyStateIllustration = () => Record<
    'fireworks' | 'folder',
    Pick<EmptySearchViewItem, 'headerMediaType' | 'headerMedia' | 'headerStyles' | 'headerContentStyles' | 'lottieWebViewStyles'>
>;

export default UseSearchEmptyStateIllustration;
