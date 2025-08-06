import {useCallback} from 'react';
import type {View} from 'react-native';
import type {AnchorPosition} from '@styles/index';
import useResponsiveLayout from './useResponsiveLayout';

function usePopoverPosition() {
    // Popovers are not used on small screen widths, but can be present in RHP
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const calculatePopoverPosition = useCallback(
        (anchorRef: React.RefObject<View | null>) => {
            if (isSmallScreenWidth) {
                return Promise.resolve({horizontal: 0, vertical: 0});
            }
            return new Promise<AnchorPosition>((resolve) => {
                anchorRef.current?.measureInWindow((x, y, width, height) => {
                    resolve({
                        horizontal: x + width,
                        vertical: y + height,
                    });
                });
            });
        },
        [isSmallScreenWidth],
    );

    return {calculatePopoverPosition};
}

export default usePopoverPosition;
