import useSafeAreaInsets from '@hooks/useSafeAreaInsets';

import type {ViewStyle} from 'react-native';

/** The modal navigators keep their content out of the horizontal safe area, while their backdrop still spans the window. */
function useModalHorizontalSafeAreaStyle(): ViewStyle {
    const {left, right} = useSafeAreaInsets();
    return {paddingLeft: left, paddingRight: right};
}

export default useModalHorizontalSafeAreaStyle;
