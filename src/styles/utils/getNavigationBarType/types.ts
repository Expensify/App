import type {EdgeInsets} from 'react-native-safe-area-context';
import type {NavigationBarType} from '@expensify/nitro-utils';

type GetNavigationBarType = (insets?: EdgeInsets) => NavigationBarType;

export default GetNavigationBarType;
