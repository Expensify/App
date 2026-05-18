import type {EdgeInsets} from 'react-native-safe-area-context';
import type {NavigationBarType} from '@libs/NavBarManager/types';

type GetNavigationBarType = (insets?: EdgeInsets) => NavigationBarType;

export default GetNavigationBarType;
