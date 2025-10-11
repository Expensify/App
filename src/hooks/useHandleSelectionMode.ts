import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import type {ListItem} from '@components/SelectionListWithSections/types';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import useMobileSelectionMode from './useMobileSelectionMode';
import useResponsiveLayout from './useResponsiveLayout';

function useHandleSelectionMode<TItem extends ListItem>(selectedItems: string[] | TItem[]) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const isFocused = useIsFocused();

    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    // Check if selection should be on when the modal is opened
    const wasSelectionOnRef = useRef(false);
    // Keep track of the number of selected items to determine if we should turn off selection mode
    const selectionRef = useRef(0);

    useEffect(() => {
        selectionRef.current = selectedItems.length;

        if (!isSmallScreenWidth) {
            if (selectedItems.length === 0 && isMobileSelectionModeEnabled) {
                turnOffMobileSelectionMode();
            }
            return;
        }
        if (!isFocused) {
            return;
        }
        if (!wasSelectionOnRef.current && selectedItems.length > 0) {
            wasSelectionOnRef.current = true;
        }
        if (selectedItems.length > 0 && !isMobileSelectionModeEnabled) {
            turnOnMobileSelectionMode();
        } else if (selectedItems.length === 0 && isMobileSelectionModeEnabled && !wasSelectionOnRef.current) {
            turnOffMobileSelectionMode();
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isMobileSelectionModeEnabled, isSmallScreenWidth, isFocused]);

    useEffect(
        () => () => {
            if (selectionRef.current !== 0) {
                return;
            }
            turnOffMobileSelectionMode();
        },
        [],
    );
}

export default useHandleSelectionMode;
