/** The history button in the Concierge header, which opens the list of Concierge conversations */
import {PressableWithoutFeedback} from '@components/Pressable';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import Tooltip from '@components/Tooltip';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import {useIsFocused} from '@react-navigation/native';
import React from 'react';

import ConciergeHistoryIcon from './ConciergeHistoryIcon';

type ConciergeHistoryButtonProps = {
    onPress: () => void;

    /** Whether the one time tooltip that points out the history icon may show here */
    canShowProductTrainingTooltip: boolean;
};

function ConciergeHistoryButton({onPress, canShowProductTrainingTooltip}: ConciergeHistoryButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.CONCIERGE_HISTORY,
        canShowProductTrainingTooltip && isFocused,
    );

    const openHistory = () => {
        hideProductTrainingTooltip();
        onPress();
    };

    const button = (
        <PressableWithoutFeedback
            onPress={openHistory}
            style={[styles.touchableButtonImage]}
            role={CONST.ROLE.BUTTON}
            accessibilityLabel={translate('common.concierge.viewChatHistory')}
            sentryLabel={CONST.SENTRY_LABEL.HEADER_VIEW.CONCIERGE_HISTORY_BUTTON}
        >
            <ConciergeHistoryIcon />
        </PressableWithoutFeedback>
    );

    if (shouldShowProductTrainingTooltip) {
        return (
            <EducationalTooltip
                shouldRender
                renderTooltipContent={renderProductTrainingTooltip}
                wrapperStyle={styles.productTrainingTooltipWrapper}
                onTooltipPress={openHistory}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
            >
                {button}
            </EducationalTooltip>
        );
    }

    return <Tooltip text={translate('common.concierge.viewChatHistory')}>{button}</Tooltip>;
}

export default ConciergeHistoryButton;
