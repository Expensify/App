import {createNavigationContainerRef, NavigationContainerRefWithCurrent} from '@react-navigation/native';
import {RootStackParamList} from '@src/types/modules/react-navigation';

const navigationRef: NavigationContainerRefWithCurrent<RootStackParamList> = createNavigationContainerRef();

export default navigationRef;
