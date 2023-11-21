import {NavigationContainerRefWithCurrent} from '@react-navigation/core';
import {RootStackParamList} from '@src/types/modules/react-navigation';

type UseFlipper = (ref: NavigationContainerRefWithCurrent<RootStackParamList>) => void;

export default UseFlipper;
