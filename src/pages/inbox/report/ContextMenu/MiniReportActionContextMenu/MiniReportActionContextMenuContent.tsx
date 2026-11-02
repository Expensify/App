import useStyleUtils from '@hooks/useStyleUtils';

import moveMiniToolbarFocusWithArrowKey from '@libs/moveContextMenuFocusWithArrowKey';

import BaseReportActionContextMenu from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type MiniReportActionContextMenuProps from './types';

/** Keeps the toolbar inside its row so positioning and keyboard navigation follow the message. */
function MiniReportActionContextMenuContent({displayAsGroup = false, ...rest}: MiniReportActionContextMenuProps) {
    const StyleUtils = useStyleUtils();

    return (
        <View
            style={StyleUtils.getMiniReportActionContextMenuWrapperStyle(displayAsGroup)}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: rest.isVisible ?? false}}
            onKeyDown={moveMiniToolbarFocusWithArrowKey}
        >
            <BaseReportActionContextMenu
                isMini
                {...rest}
            />
        </View>
    );
}

export default MiniReportActionContextMenuContent;
