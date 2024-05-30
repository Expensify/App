import React from 'react';
import {View} from 'react-native';
import type {Attachment} from '@components/Attachments/types';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type CarouselButtonsProps = {
    /** Where the arrows should be visible */
    shouldShowArrows: boolean;

    /** The current page index */
    page: number;

    /** The attachments from the carousel */
    attachments: Attachment[];

    /** Callback to go one page back */
    onBack: () => void;

    /** Callback to go one page forward */
    onForward: () => void;

    /** Callback for autohiding carousel button arrows */
    autoHideArrow?: () => void;

    /** Callback for cancelling autohiding of carousel button arrows */
    cancelAutoHideArrow?: () => void;
};

function CarouselButtons({page, attachments, shouldShowArrows, onBack, onForward, cancelAutoHideArrow, autoHideArrow}: CarouselButtonsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const isBackDisabled = page === 0;
    const isForwardDisabled = page === attachments.length - 1;
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
