import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type UseResetHomeSectionExpandOnBlur from './types';

/**
 * On wide layout the Home screen stays mounted while the user switches tabs, so a section's
 * expanded state would persist across visits. This collapses the section when the screen
 * loses focus so each visit starts fresh. On narrow layout this is a no-op.
 */
const useResetHomeSectionExpandOnBlur: UseResetHomeSectionExpandOnBlur = (reset) => {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    useFocusEffect(
        useCallback(() => {
            if (shouldUseNarrowLayout) {
                return;
            }
            return reset;
        }, [shouldUseNarrowLayout, reset]),
    );
};

export default useResetHomeSectionExpandOnBlur;
