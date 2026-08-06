import type {NavigationBarType} from '@libs/NavBarManager/types';

import type {EdgeInsets} from 'react-native-safe-area-context';

type GetNavigationBarType = (insets?: EdgeInsets) => NavigationBarType;

export default GetNavigationBarType;
