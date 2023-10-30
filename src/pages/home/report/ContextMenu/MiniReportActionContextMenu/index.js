import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import BaseReportActionContextMenu from '@pages/home/report/ContextMenu/BaseReportActionContextMenu';
import {
    defaultProps as GenericReportActionContextMenuDefaultProps,
    propTypes as genericReportActionContextMenuPropTypes,
} from '@pages/home/report/ContextMenu/genericReportActionContextMenuPropTypes';
import * as StyleUtils from '@styles/StyleUtils';
import CONST from '@src/CONST';

const propTypes = {
    ..._.omit(genericReportActionContextMenuPropTypes, ['isMini']),

    /** Should the reportAction this menu is attached to have the appearance of being
     * grouped with the previous reportAction? */
    displayAsGroup: PropTypes.bool,
};

const defaultProps = {
    ..._.omit(GenericReportActionContextMenuDefaultProps, ['isMini']),
    displayAsGroup: false,
};

function MiniReportActionContextMenu(props) {
    return (
        <View
            style={StyleUtils.getMiniReportActionContextMenuWrapperStyle(props.displayAsGroup)}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: props.isVisible}}
        >
            <BaseReportActionContextMenu
                isMini
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </View>
    );
}

MiniReportActionContextMenu.propTypes = propTypes;
MiniReportActionContextMenu.defaultProps = defaultProps;
MiniReportActionContextMenu.displayName = 'MiniReportActionContextMenu';

export default MiniReportActionContextMenu;
