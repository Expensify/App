import React from 'react';
import {Pressable, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../styles/styles';
import getReportActionContextMenuStyles from '../../../../styles/getReportActionContextMenuStyles';
import getButtonState from '../../../../libs/getButtonState';
import ContextActions from './ContextActions';
import variables from '../../../../styles/variables';
import Tooltip from '../../../../components/Tooltip';

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: PropTypes.number.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    reportActionID: PropTypes.number.isRequired,
    isMini: PropTypes.bool,
    shouldShow: PropTypes.bool,
};

const defaultProps = {
    isMini: false,
    shouldShow: false,
};

const ReportActionContextMenu = (props) => {
    const {wrapperStyle, getButtonStyle} = getReportActionContextMenuStyles(props.isMini);
    return props.shouldShow && (
        <View style={[
            ...wrapperStyle,
            styles.flex1,
        ]}
        >
            {ContextActions.map(((contextAction) => {
                const Icon = contextAction.icon;
                return (
                    <Tooltip
                        title={contextAction.text}
                        key={contextAction.text}
                        aria-label={contextAction.text}
                        placement="top"
                        arrow
                    >
                        <Pressable style={({hovered, pressed}) => getButtonStyle(getButtonState(hovered, pressed))}>
                            {({pressed}) => (
                                <Icon
                                    width={variables.iconSizeNormal}
                                    height={variables.iconSizeNormal}
                                    isEnabled={pressed}
                                />
                            )}
                        </Pressable>
                    </Tooltip>
                );
            }))}
        </View>
    );
};

ReportActionContextMenu.propTypes = propTypes;
ReportActionContextMenu.defaultProps = defaultProps;

export default ReportActionContextMenu;
