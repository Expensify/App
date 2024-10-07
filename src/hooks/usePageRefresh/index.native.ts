import {useErrorBoundary} from 'react-error-boundary';
import type UsePageRefresh from './type';

const usePageRefresh: UsePageRefresh = () => {
    const {resetBoundary} = useErrorBoundary();

    return resetBoundary;
};

export default usePageRefresh;
