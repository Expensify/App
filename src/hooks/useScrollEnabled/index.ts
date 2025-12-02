import {useIsFocused} from '@react-navigation/native';
import type UseScrollEnabled from './types';

const useScrollEnabled: UseScrollEnabled = () => {
    const isFocused = useIsFocused();
    return isFocused;
};
export default useScrollEnabled;
