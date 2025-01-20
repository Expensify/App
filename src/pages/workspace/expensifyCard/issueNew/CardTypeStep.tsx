import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as Illustrations from '@components/Icon/Illustrations';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIssueNewCardStepAndData} from '@libs/actions/Card';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type CardTypeStepProps = {
    /** ID of the policy */
    policyID: string | undefined;
};

function CardTypeStep({policyID}: CardTypeStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const isEditing = issueNewCard?.isEditing;

    const submit = (value: ValueOf<typeof CONST.EXPENSIFY_CARD.CARD_TYPE>) => {
        setIssueNewCardStepAndData({
            step: isEditing ? CONST.EXPENSIFY_CARD.STEP.CONFIRMATION : CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE,
            data: {
                cardType: value,
            },
            isEditing: false,
            policyID,
        });
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID});
            return;
        }
        setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.ASSIGNEE, policyID});
    };

    return (
        <InteractiveStepWrapper
            wrapperID={CardTypeStep.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={1}
            stepNames={CONST.EXPENSIFY_CARD.STEP_NAMES}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.chooseCardType')}</Text>
            <View style={styles.mh5}>
                <MenuItem
                    icon={Illustrations.HandCard}
                    title={translate('workspace.card.issueNewCard.physicalCard')}
                    description={translate('workspace.card.issueNewCard.physicalCardDescription')}
                    shouldShowRightIcon
                    onPress={() => submit(CONST.EXPENSIFY_CARD.CARD_TYPE.PHYSICAL)}
                    displayInDefaultIconColor
                    iconStyles={[styles.ml3, styles.mr2]}
                    iconWidth={variables.menuIconSize}
                    iconHeight={variables.menuIconSize}
                    wrapperStyle={styles.purposeMenuItem}
                />
                <MenuItem
                    icon={Illustrations.VirtualCard}
                    title={translate('workspace.card.issueNewCard.virtualCard')}
                    description={translate('workspace.card.issueNewCard.virtualCardDescription')}
                    shouldShowRightIcon
                    onPress={() => submit(CONST.EXPENSIFY_CARD.CARD_TYPE.VIRTUAL)}
                    displayInDefaultIconColor
                    iconStyles={[styles.ml3, styles.mr2]}
                    iconWidth={variables.menuIconSize}
                    iconHeight={variables.menuIconSize}
                    wrapperStyle={styles.purposeMenuItem}
                />
            </View>
        </InteractiveStepWrapper>
    );
}

CardTypeStep.displayName = 'CardTypeStep';

export default CardTypeStep;
