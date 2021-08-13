import React, {Component} from 'react';
import {
    View, Pressable, Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import Icon from './Icon';
import {Phone} from './Icon/Expensicons';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import Text from "./Text";

const propTypes = {
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
    taskID: PropTypes.string,
};

const defaultProps = {
    taskID: '',
};

class InboxCallButton extends Component {
    constructor(props) {
        super(props);

        this.measureVideoChatIconPosition = this.measureVideoChatIconPosition.bind(this);
        this.videoChatIconWrapper = null;

        this.state = {
            videoChatIconPosition: {x: 0, y: 0},
        };
    }

    componentDidMount() {
        Dimensions.addEventListener('change', this.measureVideoChatIconPosition);
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.measureVideoChatIconPosition);
    }

    /**
     * This gets called onLayout to find the cooridnates of the wrapper for the video chat button.
     */
    measureVideoChatIconPosition() {
        if (this.videoChatIconWrapper) {
            this.videoChatIconWrapper.measureInWindow((x, y) => this.setState({
                videoChatIconPosition: {x, y},
            }));
        }
    }

    render() {
        return (
            <>
                <View
                    ref={el => this.videoChatIconWrapper = el}
                    onLayout={this.measureVideoChatIconPosition}
                    style={[styles.flex1, styles.flexRow, styles.justifyContentCenter, styles.alignItemsCenter]}
                >
                    <Pressable
                        onPress={() => {
                            Navigation.navigate(ROUTES.getRequestCallRoute(this.props.taskID));
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
                                    Need Help?
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                </View>
            </>
        );
    }
}

InboxCallButton.propTypes = propTypes;
InboxCallButton.defaultProps = defaultProps;
InboxCallButton.displayName = 'InboxCallButton';
export default compose(
    withWindowDimensions,
    withLocalize,
)(InboxCallButton);
