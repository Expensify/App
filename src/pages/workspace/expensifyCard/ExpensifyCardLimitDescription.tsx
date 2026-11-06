import Popover from '@components/Popover';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getClickedTargetLocation from '@libs/getClickedTargetLocation';

import CONST from '@src/CONST';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type ExpensifyCardLimitDescriptionProps = {
    limit: number | undefined;
    formattedLimit: string | undefined;
};

function ExpensifyCardLimitDescription({limit, formattedLimit}: ExpensifyCardLimitDescriptionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
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
        return <Text style={[styles.textAlignCenter, styles.textSupporting]}>{translate('workspace.expensifyCard.bankAccountSuccessLimit', formattedLimit ?? '')}</Text>;
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
                        sentryLabel="ExpensifyCard-ReviewingStatus"
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
