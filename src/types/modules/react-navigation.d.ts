import type {RootStackParamList} from '@libs/Navigation/types';

declare global {
    namespace ReactNavigation {
        // eslint-disable-next-line
        interface RootParamList extends RootStackParamList {}
    }
}
