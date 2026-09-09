import type {Attachment} from '@components/Attachments/types';
import Button from '@components/ButtonComposed';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type CarouselButtonsProps = {
    /** Where the arrows should be visible */
    shouldShowArrows: boolean;

    /** The current page index */
    page: number;

    attachments: Attachment[];

    /** Callback to go one page back */
    onBack: () => void;

    /** Callback to go one page forward */
    onForward: () => void;

    /** Callback for auto hiding carousel button arrows */
    autoHideArrow?: () => void;

    /** Callback for cancelling auto hiding of carousel button arrows */
    cancelAutoHideArrow?: () => void;
};

function CarouselButtons({page, attachments, shouldShowArrows, onBack, onForward, cancelAutoHideArrow, autoHideArrow}: CarouselButtonsProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'BackArrow']);
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
                            size={CONST.BUTTON_SIZE.SMALL}
                            innerStyles={styles.arrowIcon}
                            onPress={onBack}
                            onPressIn={cancelAutoHideArrow}
                            onPressOut={autoHideArrow}
                            sentryLabel={CONST.SENTRY_LABEL.ATTACHMENT_CAROUSEL.PREVIOUS_BUTTON}
                        >
                            <Button.Icon
                                src={icons.BackArrow}
                                fill={theme.text}
                                hoverFill={theme.text}
                            />
                        </Button>
                    </View>
                </Tooltip>
            )}
            {!isForwardDisabled && (
                <Tooltip text={translate('common.next')}>
                    <View style={[styles.attachmentArrow, shouldUseNarrowLayout ? styles.r2 : styles.r8]}>
                        <Button
                            size={CONST.BUTTON_SIZE.SMALL}
                            innerStyles={[styles.arrowIcon]}
                            onPress={onForward}
                            onPressIn={cancelAutoHideArrow}
                            onPressOut={autoHideArrow}
                            sentryLabel={CONST.SENTRY_LABEL.ATTACHMENT_CAROUSEL.NEXT_BUTTON}
                        >
                            <Button.Icon
                                src={icons.ArrowRight}
                                fill={theme.text}
                                hoverFill={theme.text}
                            />
                        </Button>
                    </View>
                </Tooltip>
            )}
        </>
    ) : null;
}

export default CarouselButtons;
