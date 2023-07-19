import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import * as Expensicons from '../../Icon/Expensicons';
import Tooltip from '../../Tooltip';
import Button from '../../Button';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import * as AttachmentCarouselViewPropTypes from './AttachmentCarouselView/propTypes';

const propTypes = {
    /** Where the arrows should be visible */
    shouldShowArrows: PropTypes.bool.isRequired,

    /** The current page index */
    page: PropTypes.number.isRequired,

    /** The attachments from the carousel */
    attachments: AttachmentCarouselViewPropTypes.attachmentsPropType.isRequired,

    /** Callback to go one page back */
    onBack: PropTypes.func.isRequired,
    /** Callback to go one page forward */
    onForward: PropTypes.func.isRequired,

    autoHideArrow: PropTypes.func,
    cancelAutoHideArrow: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    autoHideArrow: () => {},
    cancelAutoHideArrow: () => {},
};

function CarouselButtons({page, attachments, shouldShowArrows, onBack, onForward, cancelAutoHideArrow, autoHideArrow, ...props}) {
    const isForwardDisabled = page === 0;
    const isBackDisabled = page === _.size(attachments) - 1;

    return shouldShowArrows ? (
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
                            onPress={onBack}
                            onPressIn={cancelAutoHideArrow}
                            onPressOut={autoHideArrow}
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
                            onPress={onForward}
                            onPressIn={cancelAutoHideArrow}
                            onPressOut={autoHideArrow}
                        />
                    </View>
                </Tooltip>
            )}
        </>
    ) : null;
}

CarouselButtons.propTypes = propTypes;
CarouselButtons.defaultProps = defaultProps;

export default withLocalize(CarouselButtons);
