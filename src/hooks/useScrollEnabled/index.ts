import {useIsFocused} from '@react-navigation/native';
import usePrevious from '@hooks/usePrevious';
import type UseScrollEnabled from './types';

const useScrollEnabled: UseScrollEnabled = () => {
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    return prevIsFocused && !isFocused ? false : true;
};
export default useScrollEnabled;
