import React from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import BaseReportActionContextMenu from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import CONST from '@src/CONST';
import type MiniReportActionContextMenuProps from './types';

function MiniReportActionContextMenu({displayAsGroup = false, ...rest}: MiniReportActionContextMenuProps) {
    const StyleUtils = useStyleUtils();

    return (
        <View
            style={StyleUtils.getMiniReportActionContextMenuWrapperStyle(displayAsGroup)}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: rest.isVisible ?? false}}
        >
            <BaseReportActionContextMenu
                isMini
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            />
        </View>
    );
}

export default MiniReportActionContextMenu;
