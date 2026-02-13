import type {EmptyStateComponentProps} from '@components/EmptyStateComponent/types';

type UseGenericEmptyStateIllustration = () => Pick<EmptyStateComponentProps, 'headerMediaType' | 'headerMedia' | 'headerContentStyles' | 'lottieWebViewStyles'>;

export default UseGenericEmptyStateIllustration;
