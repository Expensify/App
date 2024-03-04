import type {NavigationContainerRefWithCurrent} from '@react-navigation/core';
import type {RootStackParamList} from '@libs/Navigation/types';

type UseFlipper = (ref: NavigationContainerRefWithCurrent<RootStackParamList>) => void;

export default UseFlipper;
