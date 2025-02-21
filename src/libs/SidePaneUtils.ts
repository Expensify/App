import type {OnyxEntry} from 'react-native-onyx';
import type * as OnyxTypes from '@src/types/onyx';

function isSidePaneHidden(sidePane: OnyxEntry<OnyxTypes.SidePane>, isExtraLargeScreenWidth: boolean) {
    if (!isExtraLargeScreenWidth && !sidePane?.openMobile) {
        return true;
    }

    if (isExtraLargeScreenWidth && !sidePane?.open) {
        return true;
    }

    return false;
}

// eslint-disable-next-line import/prefer-default-export
export {isSidePaneHidden};
