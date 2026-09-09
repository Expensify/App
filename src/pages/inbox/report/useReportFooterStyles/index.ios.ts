import useKeyboardDismissibleFlashListValues from '@components/KeyboardDismissibleFlashList/useKeyboardDismissibleFlashListValues';

import useKeyboardState from '@hooks/useKeyboardState';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';

import type {ViewStyle} from 'react-native';

import {useMemo} from 'react';
import {useAnimatedStyle} from 'react-native-reanimated';

import type UseReportFooterStylesParams from './types';

const useReportFooterStyles = ({composerHeight, headerHeight, isComposerFullSize}: UseReportFooterStylesParams) => {
    const StyleUtils = useStyleUtils();
    const {keyboardHeight} = useKeyboardDismissibleFlashListValues();
    const {unmodifiedPaddings} = useSafeAreaPaddings();
    const {isKeyboardActive} = useKeyboardState();
    const {windowHeight} = useWindowDimensions();

    const paddingBottom = useMemo(() => unmodifiedPaddings?.bottom ?? 0, [unmodifiedPaddings.bottom]);
    const paddingTop = useMemo(() => unmodifiedPaddings?.top ?? 0, [unmodifiedPaddings.top]);

    return useAnimatedStyle<ViewStyle>(() =>
        StyleUtils.getReportFooterIosKeyboardHandlingStyles({keyboardHeight, paddingBottom, paddingTop, isKeyboardActive, windowHeight, composerHeight, headerHeight, isComposerFullSize}),
    );
};

export default useReportFooterStyles;
