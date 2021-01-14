import React from 'react';
import {Pressable, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../styles/styles';
import getReportActionContextMenuStyles from '../../../../styles/getReportActionContextMenuStyles';
import getButtonState from '../../../../libs/getButtonState';
import ContextActions from './ContextActions';
import variables from '../../../../styles/variables';

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    reportActionID: PropTypes.string.isRequired,
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
            {ContextActions.map(((commentAction) => {
                const Icon = commentAction.icon;
                return (
                    <Pressable style={({hovered, pressed}) => getButtonStyle(getButtonState(hovered, pressed))}>
                        {({pressed}) => (
                            <Icon
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                                isEnabled={pressed}
                            />
                        )}
                    </Pressable>
                );
            }))}
        </View>
    );
};

ReportActionContextMenu.propTypes = propTypes;
ReportActionContextMenu.defaultProps = defaultProps;

export default ReportActionContextMenu;
