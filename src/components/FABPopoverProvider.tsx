import type {ReactNode} from 'react';
import React, {createContext, useCallback, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import getPlatform from '@libs/getPlatform';
import type FloatingActionButtonPopoverMenuRef from '@pages/home/sidebar/BottomTabBarFloatingActionButton/types';
import FloatingActionButtonAndPopover from '@pages/home/sidebar/FloatingActionButtonAndPopover';
import CONST from '@src/CONST';

type FABPopoverContextValue = {
    isCreateMenuActive: boolean;
    setIsCreateMenuActive: (value: boolean) => void;
    fabRef: React.RefObject<HTMLDivElement | View>;
};

const FABPopoverContext = createContext<FABPopoverContextValue>({
    isCreateMenuActive: false,
    setIsCreateMenuActive: () => {},
    fabRef: {current: null},
});

type FABPopoverProviderProps = {
    children: ReactNode;
};

function FABPopoverProvider({children}: FABPopoverProviderProps) {
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);
    const value = useMemo(() => ({isCreateMenuActive, setIsCreateMenuActive, fabRef}), [isCreateMenuActive, fabRef]);

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
     * Method remove event listener.
     */
    const removeDragoverListener = () => {
        if (platform !== CONST.PLATFORM.WEB) {
            return;
        }
        document.removeEventListener('dragover', hidePopoverOnDragOver);
    };

    return (
        <FABPopoverContext.Provider value={value}>
            <FloatingActionButtonAndPopover
                ref={popoverModal}
                onHideCreateMenu={removeDragoverListener}
            />
            {children}
        </FABPopoverContext.Provider>
    );
}

export default FABPopoverProvider;
export {FABPopoverContext};
