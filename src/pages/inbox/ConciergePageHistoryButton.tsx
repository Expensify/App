import {useProductTrainingContext} from '@components/ProductTrainingContext';
import Tooltip from '@components/Tooltip';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

import {CommonActions, useIsFocused, useNavigation} from '@react-navigation/native';
import React from 'react';

import ConciergeHistoryButton from './ConciergeHistoryButton';

/**
 * The history button in the header of a Concierge conversation on the narrow Concierge page. It opens the list on top of
 * the conversation, so the list's back button returns to it, and points itself out once with a tooltip.
 */
function ConciergePageHistoryButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.CONCIERGE_HISTORY,
        isFocused,
    );

    const openConciergeHistory = () => {
        hideProductTrainingTooltip();
        navigation.dispatch((state) =>
            CommonActions.reset({
                ...state,
                routes: [...state.routes, {name: SCREENS.CONCIERGE_SIDEBAR, key: `${SCREENS.CONCIERGE_SIDEBAR}-${Date.now()}`}],
                index: state.routes.length,
            }),
        );
    };

    const button = <ConciergeHistoryButton onPress={openConciergeHistory} />;

    if (shouldShowProductTrainingTooltip) {
        return (
            <EducationalTooltip
                shouldRender
                renderTooltipContent={renderProductTrainingTooltip}
                wrapperStyle={styles.productTrainingTooltipWrapper}
                onTooltipPress={openConciergeHistory}
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

export default ConciergePageHistoryButton;
