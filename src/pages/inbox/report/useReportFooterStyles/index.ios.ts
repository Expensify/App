import {useMemo} from 'react';
import {useAnimatedStyle} from 'react-native-reanimated';
import useKeyboardDismissibleFlatListValues from '@components/KeyboardDismissibleFlatList/useKeyboardDismissibleFlatListValues';
import useKeyboardState from '@hooks/useKeyboardState';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {UseReportFooterStyles} from './types';

const useReportFooterStyles: UseReportFooterStyles = ({composerHeight, headerHeight, isComposerFullSize}) => {
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
};

export default useReportFooterStyles;
