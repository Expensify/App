import {useIsFocused} from '@react-navigation/native';
import type {MutableRefObject, ReactNode} from 'react';
import React, {createContext, useCallback, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import getPlatform from '@libs/getPlatform';
import FloatingActionButtonPopover from '@pages/home/sidebar/FloatingActionButtonPopover';
import CONST from '@src/CONST';

type FloatingActionButtonPopoverMenuRef = {
    hideCreateMenu: () => void;
};

type FABPopoverContextValue = {
    isCreateMenuActive: boolean;
    hideCreateMenu: () => void;
    toggleCreateMenu: (fabRef: React.RefObject<HTMLDivElement>) => void;
    fabRef: MutableRefObject<HTMLDivElement | View | null>;
};

const FABPopoverContext = createContext<FABPopoverContextValue>({
    isCreateMenuActive: false,
    hideCreateMenu: () => {},
    toggleCreateMenu: () => {},
    fabRef: {current: null},
});

type FABPopoverProviderProps = {
    children: ReactNode;
};

function FABPopoverProvider({children}: FABPopoverProviderProps) {
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const fabRef = useRef<HTMLDivElement | null>(null);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const platform = getPlatform();

    const popoverModal = useRef<FloatingActionButtonPopoverMenuRef>(null);

    /**
     * Method to hide popover when dragover.
     */
    const hidePopoverOnDragOver = useCallback(() => {
        if (!popoverModal.current) {
            return;
        }
        popoverModal.current.hideCreateMenu();
    }, []);

    /**
     * Method create event listener
     */
    const createDragoverListener = () => {
        if (platform !== CONST.PLATFORM.WEB) {
            return;
        }
        document.addEventListener('dragover', hidePopoverOnDragOver);
    };

    /**
     * Method remove event listener.
     */
    const removeDragoverListener = () => {
        if (platform !== CONST.PLATFORM.WEB) {
            return;
        }
        document.removeEventListener('dragover', hidePopoverOnDragOver);
    };

    /**
     * Method called either when:
     * - Pressing the floating action button to open the CreateMenu modal
     * - Selecting an item on CreateMenu or closing it by clicking outside of the modal component
     */
    const hideCreateMenu = useCallback(
        () => {
            if (!isCreateMenuActive) {
                return;
            }
            setIsCreateMenuActive(false);
            removeDragoverListener();
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [isCreateMenuActive],
    );

    /**
     * Method called when we click the floating action button
     */
    const showCreateMenu = useCallback(
        () => {
            if (!isFocused && shouldUseNarrowLayout) {
                return;
            }
            setIsCreateMenuActive(true);
            createDragoverListener();
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [isFocused, shouldUseNarrowLayout],
    );

    const toggleCreateMenu = useCallback(
        (fab: React.RefObject<HTMLDivElement>) => {
            fabRef.current = fab.current;
            if (isCreateMenuActive) {
                hideCreateMenu();
            } else {
                showCreateMenu();
            }
        },
        [hideCreateMenu, isCreateMenuActive, showCreateMenu],
    );

    const value = useMemo(
        () => ({
            isCreateMenuActive,
            hideCreateMenu,
            toggleCreateMenu,
            fabRef,
        }),
        [isCreateMenuActive, toggleCreateMenu, hideCreateMenu, fabRef],
    );

    return (
        <FABPopoverContext.Provider value={value}>
            <FloatingActionButtonPopover ref={popoverModal} />
            {children}
        </FABPopoverContext.Provider>
    );
}

export default FABPopoverProvider;
export {FABPopoverContext};
