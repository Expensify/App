import type {EmptyStateComponentProps} from '@components/EmptyStateComponent/types';

type UseGenericEmptyStateIllustration = () => Pick<EmptyStateComponentProps, 'headerMedia' | 'headerContentStyles'>;

export default UseGenericEmptyStateIllustration;
