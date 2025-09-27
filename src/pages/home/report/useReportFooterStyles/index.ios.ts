import {useMemo} from 'react';
import type {ViewStyle} from 'react-native';
import {useAnimatedStyle} from 'react-native-reanimated';
import useKeyboardDismissibleFlatListValues from '@components/KeyboardDismissibleFlatList/useKeyboardDismissibleFlatListValues';
import useKeyboardState from '@hooks/useKeyboardState';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type UseReportFooterStylesParams from './types';

function useReportFooterStyles({composerHeight, headerHeight, isComposerFullSize}: UseReportFooterStylesParams): ViewStyle {
    const StyleUtils = useStyleUtils();
    const {keyboardHeight} = useKeyboardDismissibleFlatListValues();
    const {unmodifiedPaddings} = useSafeAreaPaddings();
    const {isKeyboardActive} = useKeyboardState();
    const {windowHeight} = useWindowDimensions();

    const paddingBottom = useMemo(() => unmodifiedPaddings?.bottom ?? 0, [unmodifiedPaddings.bottom]);
    const paddingTop = useMemo(() => unmodifiedPaddings?.top ?? 0, [unmodifiedPaddings.top]);

    return useAnimatedStyle(() =>
        StyleUtils.getReportFooterIosKeyboardHandlingStyles({keyboardHeight, paddingBottom, paddingTop, isKeyboardActive, windowHeight, composerHeight, headerHeight, isComposerFullSize}),
    );
}

export default useReportFooterStyles;
