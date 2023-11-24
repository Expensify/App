import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import * as AttachmentCarouselViewPropTypes from '@components/Attachments/propTypes';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import {Attachment} from './CarouselItem';

type CarouselButtonsProps = {
    shouldShowArrows: boolean;
    page: number;
    attachments: Attachment[];
    onBack: () => void;
    onForward: () => void;
    autoHideArrow?: () => void;
    cancelAutoHideArrow?: () => void;
};

function CarouselButtons({page, attachments, shouldShowArrows, onBack, onForward, cancelAutoHideArrow = () => {}, autoHideArrow = () => {}}: CarouselButtonsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const isBackDisabled = page === 0;
    const isForwardDisabled = page === attachments.length - 1;

    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    return shouldShowArrows ? (
        <>
            {!isBackDisabled && (
                <Tooltip text={translate('common.previous')}>
                    <View style={[styles.attachmentArrow, isSmallScreenWidth ? styles.l2 : styles.l8]}>
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
                    <View style={[styles.attachmentArrow, isSmallScreenWidth ? styles.r2 : styles.r8]}>
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

CarouselButtons.displayName = 'CarouselButtons';

export default CarouselButtons;
