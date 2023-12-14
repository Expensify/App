import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import * as AttachmentCarouselViewPropTypes from '@components/Attachments/propTypes';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

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
};

const defaultProps = {
    autoHideArrow: () => {},
    cancelAutoHideArrow: () => {},
};

function CarouselButtons({page, attachments, shouldShowArrows, onBack, onForward, cancelAutoHideArrow, autoHideArrow}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const isBackDisabled = page === 0;
    const isForwardDisabled = page === _.size(attachments) - 1;

    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return shouldShowArrows ? (
        <>
            {!isBackDisabled && (
                <Tooltip text={translate('common.previous')}>
                    <View style={[styles.attachmentArrow, shouldUseNarrowLayout ? styles.l2 : styles.l8]}>
                        <Button
                            small
                            innerStyles={[styles.arrowIcon]}
                            icon={Expensicons.BackArrow}
                            iconFill={theme.text}
                            iconStyles={[styles.mr0]}
                            onPress={onBack}
                            onPressIn={cancelAutoHideArrow}
                            onPressOut={autoHideArrow}
                        />
                    </View>
                </Tooltip>
            )}
            {!isForwardDisabled && (
                <Tooltip text={translate('common.next')}>
                    <View style={[styles.attachmentArrow, shouldUseNarrowLayout ? styles.r2 : styles.r8]}>
                        <Button
                            small
                            innerStyles={[styles.arrowIcon]}
                            icon={Expensicons.ArrowRight}
                            iconFill={theme.text}
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
CarouselButtons.displayName = 'CarouselButtons';

export default CarouselButtons;
