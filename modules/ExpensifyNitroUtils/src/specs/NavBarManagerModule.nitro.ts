import type {HybridObject} from 'react-native-nitro-modules';
import type {NavBarButtonStyle, NavigationBarType } from '../NavBarManager/types';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface NavBarManagerModule extends HybridObject<{ios: 'swift', android: 'kotlin'}> {
    setButtonStyle(style: NavBarButtonStyle): void;
    getType(): NavigationBarType;
}

// eslint-disable-next-line import/prefer-default-export
export type {NavBarManagerModule};
