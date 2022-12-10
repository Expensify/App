import React, {PureComponent} from 'react';
import {Animated, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../styles/styles';
import Button from '../../../../components/Button';
import Text from '../../../../components/Text';
import Icon from '../../../../components/Icon';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import themeColors from '../../../../styles/themes/default';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import FloatingMessageCounterContainer from './FloatingMessageCounterContainer';

const propTypes = {
    /** Whether the New Messages indicator is active */
    isActive: PropTypes.bool,

    /** Callback to be called when user clicks the New Messages indicator */
    onClick: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isActive: false,
    onClick: () => {},
};

const MARKER_INACTIVE_TRANSLATE_Y = -40;
const MARKER_ACTIVE_TRANSLATE_Y = 10;

class FloatingMessageCounter extends PureComponent {
    constructor(props) {
        super(props);
        this.translateY = new Animated.Value(MARKER_INACTIVE_TRANSLATE_Y);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
    }

    componentDidUpdate() {
        if (this.props.isActive) {
            this.show();
        } else {
            this.hide();
        }
    }

    show() {
        Animated.spring(this.translateY, {
            toValue: MARKER_ACTIVE_TRANSLATE_Y,
            duration: 80,
            useNativeDriver: true,
        }).start();
    }

    hide() {
        Animated.spring(this.translateY, {
            toValue: MARKER_INACTIVE_TRANSLATE_Y,
            duration: 80,
            useNativeDriver: true,
        }).start();
    }

    render() {
        return (
            <FloatingMessageCounterContainer
                accessibilityHint="Scroll to newest messages"
                containerStyles={[styles.floatingMessageCounterTransformation(this.translateY)]}
            >
                <View style={styles.floatingMessageCounter}>
                    <View style={[
                        styles.flexRow,
                        styles.justifyContentBetween,
                        styles.alignItemsCenter,
                    ]}
                    >
                        <Button
                            success
                            small
                            onPress={this.props.onClick}
                            ContentComponent={() => (
                                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                    <Icon small src={Expensicons.DownArrow} fill={themeColors.textLight} />
                                    <Text
                                        selectable={false}
                                        style={[
                                            styles.ml2,
                                            styles.buttonSmallText,
                                            styles.textWhite,
                                        ]}
                                    >
                                        {this.props.translate('newMessages')}
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </FloatingMessageCounterContainer>
        );
    }
}

FloatingMessageCounter.propTypes = propTypes;
FloatingMessageCounter.defaultProps = defaultProps;

export default withLocalize(FloatingMessageCounter);
