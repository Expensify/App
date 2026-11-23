/** Displays a card limit or explains why an unassigned limit is under review. */
import Popover from '@components/Popover';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getClickedTargetLocation from '@libs/getClickedTargetLocation';

import CONST from '@src/CONST';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type ExpensifyCardLimitDescriptionProps = {
    /** Limit in cents; undefined displays Reviewing, while zero remains a numeric limit. */
    limit: number | undefined;
};

function ExpensifyCardLimitDescription({limit}: ExpensifyCardLimitDescriptionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {convertToDisplayString} = useCurrencyListActions();
    const {windowWidth} = useWindowDimensions();
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({top: 0, left: 0});
    const anchorRef = useRef(null);

    useEffect(() => {
        if (!isPopoverVisible || !anchorRef.current) {
            return;
        }
        const position = getClickedTargetLocation(anchorRef.current);
        setAnchorPosition({top: position.top + position.height, left: position.left});
    }, [isPopoverVisible, windowWidth]);

    if (limit !== undefined && limit !== null) {
        return (
            <Text style={[styles.textAlignCenter, styles.textSupporting]}>
                {translate('workspace.expensifyCard.bankAccountSuccessLimit', convertToDisplayString(limit, CONST.CURRENCY.USD))}
            </Text>
        );
    }

    return (
        <>
            <View style={styles.alignItemsCenter}>
                <Text style={[styles.textAlignCenter, styles.textSupporting]}>{translate('workspace.expensifyCard.bankAccountSuccessReviewingPrefix')}</Text>
                <View ref={anchorRef}>
                    <PressableWithFeedback
                        accessibilityLabel={translate('workspace.expensifyCard.bankAccountSuccessReviewingStatus')}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        onPress={() => setIsPopoverVisible(true)}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.REVIEWING_STATUS}
                    >
                        <Text style={styles.textStrong}>{translate('workspace.expensifyCard.bankAccountSuccessReviewingStatus')}</Text>
                    </PressableWithFeedback>
                </View>
                <Text style={[styles.textAlignCenter, styles.textSupporting]}>{translate('workspace.expensifyCard.bankAccountSuccessReviewingSuffix')}</Text>
            </View>
            <Popover
                isVisible={isPopoverVisible}
                onClose={() => setIsPopoverVisible(false)}
                anchorRef={anchorRef}
                anchorPosition={anchorPosition}
                innerContainerStyle={styles.cardLabelTooltipContainer}
            >
                <Text style={[styles.p4, styles.textLabelSupporting]}>{translate('workspace.expensifyCard.bankAccountSuccessReviewingExplanation')}</Text>
            </Popover>
        </>
    );
}

export default ExpensifyCardLimitDescription;
