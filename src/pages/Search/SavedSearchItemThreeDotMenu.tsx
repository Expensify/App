import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import CONST from '@src/CONST';

type SavedSearchItemThreeDotMenuProps = {
    menuItems: PopoverMenuItem[];
};

function SavedSearchItemThreeDotMenu({menuItems}: SavedSearchItemThreeDotMenuProps) {
    const threeDotsMenuContainerRef = useRef<View>(null);
    const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState({horizontal: 0, vertical: 0});

    return (
        <View ref={threeDotsMenuContainerRef}>
            <ThreeDotsMenu
                menuItems={menuItems}
                onIconPress={() => {
                    threeDotsMenuContainerRef.current?.measureInWindow((x, y, width) => {
                        setThreeDotsMenuPosition({
                            horizontal: x + width,
                            vertical: y,
                        });
                    });
                }}
                anchorPosition={threeDotsMenuPosition}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
                isPaneMenu
            />
        </View>
    );
}

export default SavedSearchItemThreeDotMenu;
