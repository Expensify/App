import type {EmptyStateComponentProps} from '@components/EmptyStateComponent/types';

type UseGenericEmptyStateIllustration = () => Pick<EmptyStateComponentProps, 'headerMediaType' | 'headerMedia' | 'headerContentStyles'>;

export default UseGenericEmptyStateIllustration;
