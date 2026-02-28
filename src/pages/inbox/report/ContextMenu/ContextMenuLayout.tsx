import type {ReactNode, RefObject} from 'react';
import {View} from 'react-native';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';

type ContextMenuLayoutProps = {
    isMini: boolean;
    isVisible: boolean;
    shouldKeepOpen: boolean;
    contentRef?: RefObject<View | null>;
    children: ReactNode;
};

function ContextMenuLayout({isMini, isVisible, shouldKeepOpen, contentRef, children}: ContextMenuLayoutProps) {
    const StyleUtils = useStyleUtils();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();

    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(isMini, shouldUseNarrowLayout);

    return (
        (isVisible || shouldKeepOpen || !isMini) && (
            <FocusTrapForModal active={!isMini && !isSmallScreenWidth && (isVisible || shouldKeepOpen)}>
                <View
                    ref={contentRef}
                    style={wrapperStyle}
                >
                    {children}
                </View>
            </FocusTrapForModal>
        )
    );
}

export default ContextMenuLayout;
