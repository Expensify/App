import React, {memo} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Banner from '../Banner';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import Hoverable from '../Hoverable';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import RenderHTML from '../RenderHTML';
import Text from '../Text';
import * as StyleUtils from '../../styles/StyleUtils';
import getButtonState from '../../libs/getButtonState';
import Tooltip from '../Tooltip';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import CONST from '../../CONST';
import AppIcon from '../../../assets/images/expensify-app-icon.svg';
import Button from '../Button';
import variables from '../../styles/variables';

const propTypes = {
    /** Text to display in the banner. */
    text: PropTypes.string.isRequired,

    /** Should this component render the left-aligned exclamation icon? */
    shouldShowIcon: PropTypes.bool,

    /** Should this component render a close button? */
    shouldShowCloseButton: PropTypes.bool,

    /** Should this component render the text as HTML? */
    shouldRenderHTML: PropTypes.bool,

    /** Callback called when the close button is pressed */
    onClose: PropTypes.func,

    /** Callback called when the message is pressed */
    onPress: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    shouldRenderHTML: false,
    shouldShowIcon: false,
    shouldShowCloseButton: false,
    onClose: undefined,
    onPress: undefined,
};

function MobileBanner(props) {
    return (
        <View
            style={[
                styles.flexRow,
                styles.alignItemsCenter,
                styles.pv4,
                styles.ph5,
                styles.gap4,
                styles.activeComponentBG,
                styles.mw100,
            ]}
        >
            <View style={[styles.flex1, styles.flexRow, styles.flexGrow1, styles.alignItemsCenter]}>
                <View style={[styles.alignItemsCenter, styles.gap3, styles.flexRow, styles.flex1]}>
                    <Icon
                        src={AppIcon}
                        width={variables.mobileBannerAppIconSize}
                        height={variables.mobileBannerAppIconSize}
                        additionalStyles={[styles.appIconBorderRadius]}
                    />
                    <View style={[styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStart, styles.flex1]}>
                        <Text
                            style={[styles.alignSelfStretch, styles.textLabel, styles.textStrong]}
                            suppressHighlighting
                        >
                            {"Download the app"}
                        </Text>
                        <Text
                            style={[styles.alignSelfStretch, styles.textLabel]}
                            suppressHighlighting

                        >
                            {"Keep the conversation going in New Expensify."}
                        </Text>
                    </View>
                </View>
            </View>
            <Button small success text="Download" onPress={()=>{}} />
            <Tooltip text={props.translate('common.close')}>
                <PressableWithFeedback
                    onPress={props.onClose}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    accessibilityLabel={props.translate('common.close')}
                >
                    <Icon src={Expensicons.Close} />
                </PressableWithFeedback>
            </Tooltip>
        </View>
    );
}

MobileBanner.displayName = 'MobileBanner';
MobileBanner.propTypes = propTypes;
MobileBanner.defaultProps = defaultProps;

export default compose(withLocalize, memo)(MobileBanner);
