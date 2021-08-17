import React from 'react';
import {
    View, Pressable,
} from 'react-native';
import PropTypes from 'prop-types';
import Icon from './Icon';
import {Phone} from './Icon/Expensicons';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import Text from './Text';

const propTypes = {
    ...withLocalizePropTypes,
    taskID: PropTypes.string,
};

const defaultProps = {
    taskID: '',
};

const InboxCallButton = props => (
    <>
        <View
            style={[styles.justifyContentCenter, styles.alignItemsCenter]}
        >
            <Pressable
                onPress={() => {
                    Navigation.navigate(ROUTES.getRequestCallRoute(props.taskID));
                }}
                style={[styles.button, styles.buttonSmall]}
            >
                <View style={styles.flexRow}>
                    <View style={styles.mr1}>
                        <Icon
                            src={Phone}
                            fill={themeColors.heading}
                            small
                        />
                    </View>
                    <View>
                        <Text style={styles.buttonText}>
                            {props.translate('requestCallPage.needHelp')}
                        </Text>
                    </View>
                </View>
            </Pressable>
        </View>
    </>
);

InboxCallButton.propTypes = propTypes;
InboxCallButton.defaultProps = defaultProps;
InboxCallButton.displayName = 'InboxCallButton';
export default compose(withLocalize)(InboxCallButton);
