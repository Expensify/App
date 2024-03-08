import getIsPad from '@libs/getIsPad';
import getIsSmallScreenWidth from '@libs/getIsSmallScreenWidth';

export default function getIsNarrowLayout() {
    if (getIsPad()) {
        return getIsSmallScreenWidth();
    }

    return true;
}
