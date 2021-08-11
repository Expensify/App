import React, {PureComponent} from 'react';
import {Animated, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import Button from '../../../components/Button';
import Icon from '../../../components/Icon';
import {Close, DownArrow} from '../../../components/Icon/Expensicons';
import themeColors from '../../../styles/themes/default';

const MARKER_NOT_ACTIVE_TRANSLATE_Y = -30;
const MARKER_ACTIVE_TRANSLATE_Y = 10;
const propTypes = {
    count: PropTypes.number,
    active: PropTypes.bool,
    onClose: PropTypes.func,
    onClick: PropTypes.func,
};
const defaultProps = {
    count: 0,
    active: false,
    onClose: () => {},
    onClick: () => {},
};
class Markerbadge extends PureComponent {
    constructor(props) {
        super(props);
        this.translateY = new Animated.Value(MARKER_NOT_ACTIVE_TRANSLATE_Y);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
    }

    componentDidUpdate() {
        if (this.props.active && this.props.count > 0) {
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
            toValue: MARKER_NOT_ACTIVE_TRANSLATE_Y,
            duration: 80,
            useNativeDriver: true,
        }).start();
    }

    render() {
        return (
            <View style={styles.reportMarkerBadgeWrapper}>
                <Animated.View style={[
                    styles.flexRow,
                    styles.justifyContentBetween,
                    styles.alignItemsCenter,
                    styles.reportMarkerBadge,
                    styles.reportMarkerBadgeTransformation(this.translateY),
                ]}
                >
                    <Button
                        success
                        small
                        onPress={this.props.onClick}
                        ContentComponent={() => (
                            <View style={[styles.flexRow]}>
                                <Icon small src={DownArrow} fill={themeColors.textReversed} />
                                <Text
                                    selectable={false}
                                    style={[
                                        styles.ml2,
                                        styles.buttonSmallText,
                                        styles.textWhite,
                                    ]}
                                >
                                    {this.props.count}
                                    {' '}
                                    new messages
                                </Text>
                            </View>
                        )}
                        shouldRemoveRightBorderRadius
                        style={[styles.flex1]}
                    />
                    <Button
                        success
                        small
                        style={[styles.buttonDropdown]}
                        onPress={this.props.onClose}
                        shouldRemoveLeftBorderRadius
                        ContentComponent={() => (
                            <Icon small src={Close} fill={themeColors.textReversed} />
                        )}
                    />
                </Animated.View>
            </View>
        );
    }
}

Markerbadge.propTypes = propTypes;
Markerbadge.defaultProps = defaultProps;
Markerbadge.displayName = 'Markerbadge';

export default Markerbadge;
