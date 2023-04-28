import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Avatar from './Avatar';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import themeColors from '../styles/themes/default';
import variables from '../styles/variables';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** The image to display */
    avatarImage: PropTypes.string,

    /** The title to display */
    title: PropTypes.string,

    /** The description to display */
    description: PropTypes.string,

    /** The function to call when the link is pressed */
    onPress: PropTypes.func.isRequired,

    /** Label for the Link */
    label: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    avatarImage: '',
    title: '',
    description: '',
};

// eslint-disable-next-line react/destructuring-assignment
const TaskSelectorLink = props => (
    <TouchableOpacity style={[styles.flexRow, styles.taskSelectorLink]} onPress={props.onPress}>
        <View style={[styles.flexRow, styles.containerWithSpaceBetween]}>
            {props.avatarImage ? (
                <View style={[styles.flexColumn, styles.justify, styles.alignItemsStart]}>
                    <Text style={[styles.label, styles.textWhite]}>{props.translate(props.label)}</Text>
                    <View style={[styles.flexRow, styles.avatar, styles.justifyContentCenter]}>
                        <Avatar source={props.avatarImage} size="small" />
                        <View style={[styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStart, styles.avatarOverlay]}>
                            <Text style={[styles.avatarText, styles.textWhite]}>{props.title}</Text>
                            <Text style={[styles.avatarText, styles.textWhite]}>{props.description}</Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View>
                    <Text style={[styles.optionAlternateText, styles.textWhite]}>{props.translate(props.label)}</Text>
                </View>
            )}
            <Icon src={Expensicons.ArrowRight} fill={themeColors.textLight} width={variables.iconSizeSmall} height={variables.iconSizeSmall} inline />
        </View>
    </TouchableOpacity>
);

TaskSelectorLink.defaultProps = defaultProps;
TaskSelectorLink.propTypes = propTypes;
TaskSelectorLink.displayName = 'TaskSelectorLink';

export default withLocalize(TaskSelectorLink);
