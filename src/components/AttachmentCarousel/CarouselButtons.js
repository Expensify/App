import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import * as Expensicons from '../Icon/Expensicons';
import Tooltip from '../Tooltip';
import Button from '../Button';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';

const propTypes = {
    /** Callback to go one page back */
    // eslint-disable-next-line react/forbid-prop-types
    carouselState: PropTypes.object.isRequired,

    /** Callback to go one page back */
    onBack: PropTypes.func.isRequired,
    /** Callback to go one page forward */
    onForward: PropTypes.func.isRequired,

    autoHideArrow: PropTypes.func.isRequired,
    cancelAutoHideArrow: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

function CarouselButtons(props) {
    const isForwardDisabled = props.carouselState.page === 0;
    const isBackDisabled = props.carouselState.page === _.size(props.carouselState.attachments) - 1;

    return props.carouselState.shouldShowArrow ? (
        <>
            {!isBackDisabled && (
                <Tooltip text={props.translate('common.previous')}>
                    <View style={[styles.attachmentArrow, props.isSmallScreenWidth ? styles.l2 : styles.l8]}>
                        <Button
                            small
                            innerStyles={[styles.arrowIcon]}
                            icon={Expensicons.BackArrow}
                            iconFill={themeColors.text}
                            iconStyles={[styles.mr0]}
                            onPress={props.onBack}
                            onPressIn={props.cancelAutoHideArrow}
                            onPressOut={props.autoHideArrow}
                        />
                    </View>
                </Tooltip>
            )}
            {!isForwardDisabled && (
                <Tooltip text={props.translate('common.next')}>
                    <View style={[styles.attachmentArrow, props.isSmallScreenWidth ? styles.r2 : styles.r8]}>
                        <Button
                            small
                            innerStyles={[styles.arrowIcon]}
                            icon={Expensicons.ArrowRight}
                            iconFill={themeColors.text}
                            iconStyles={[styles.mr0]}
                            onPress={props.onForward}
                            onPressIn={props.cancelAutoHideArrow}
                            onPressOut={props.autoHideArrow}
                        />
                    </View>
                </Tooltip>
            )}
        </>
    ) : null;
}

CarouselButtons.propTypes = propTypes;

export default withLocalize(CarouselButtons);
