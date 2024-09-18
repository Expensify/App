import {useErrorBoundary} from 'react-error-boundary';
import type UsePageRefreshType from './type';

const usePageRefresh: UsePageRefreshType = () => {
    const {resetBoundary} = useErrorBoundary();

    return resetBoundary;
};

export default usePageRefresh;
