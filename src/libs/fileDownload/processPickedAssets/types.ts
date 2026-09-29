import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {Asset} from 'react-native-image-picker';

type ProcessPickedAssetsFunction = (assets: Asset[], showGeneralAlert: (message?: string) => void, translate: LocaleContextProps['translate']) => Promise<Asset[] | undefined>;

export default ProcessPickedAssetsFunction;
