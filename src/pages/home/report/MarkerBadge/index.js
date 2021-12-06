import React, {PureComponent} from 'react';
import {Animated, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../styles/styles';
import ExpensifyButton from '../../../../components/ExpensifyButton';
import Icon from '../../../../components/Icon';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import themeColors from '../../../../styles/themes/default';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import MarkerBadgeContainer from './MarkerBadgeContainer';

const propTypes = {
    /** Count of new messages to show in the badge */
    count: PropTypes.number,

    /** Whether the marker is active */
    active: PropTypes.bool,

    /** Callback to be called when user closes the badge */
    onClose: PropTypes.func,

    /** Callback to be called when user clicks the marker */
    onClick: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    count: 0,
    active: false,
    onClose: () => {},
    onClick: () => {},
};

const MARKER_NOT_ACTIVE_TRANSLATE_Y = -30;
const MARKER_ACTIVE_TRANSLATE_Y = 10;

class MarkerBadge extends PureComponent {
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
            <MarkerBadgeContainer containerStyles={[styles.reportMarkerBadgeTransformation(this.translateY)]}>
                <View style={styles.reportMarkerBadge}>
                    <View style={[
                        styles.flexRow,
                        styles.justifyContentBetween,
                        styles.alignItemsCenter,
                    ]}
                    >
                        <ExpensifyButton
                            success
                            small
                            onPress={this.props.onClick}
                            ContentComponent={() => (
                                <View style={[styles.flexRow]}>
                                    <Icon small src={Expensicons.DownArrow} fill={themeColors.textReversed} />
                                    <Text
                                        selectable={false}
                                        style={[
                                            styles.ml2,
                                            styles.buttonSmallText,
                                            styles.textWhite,
                                        ]}
                                    >
                                        {this.props.translate(
                                            'reportActionsViewMarkerBadge.newMsg',
                                            {count: this.props.count},
                                        )}
                                    </Text>
                                </View>
                            )}
                            shouldRemoveRightBorderRadius
                        />
                        <ExpensifyButton
                            success
                            small
                            style={[styles.buttonDropdown]}
                            onPress={this.props.onClose}
                            shouldRemoveLeftBorderRadius
                            ContentComponent={() => (
                                <Icon small src={Expensicons.Close} fill={themeColors.textReversed} />
                            )}
                        />
                    </View>
                </View>
            </MarkerBadgeContainer>
        );
    }
}

MarkerBadge.propTypes = propTypes;
MarkerBadge.defaultProps = defaultProps;

export default withLocalize(MarkerBadge);
