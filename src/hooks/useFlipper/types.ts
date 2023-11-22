import {NavigationContainerRefWithCurrent} from '@react-navigation/core';
import {RootStackParamList} from '@libs/Navigation/types';

type UseFlipper = (ref: NavigationContainerRefWithCurrent<RootStackParamList>) => void;

export default UseFlipper;
