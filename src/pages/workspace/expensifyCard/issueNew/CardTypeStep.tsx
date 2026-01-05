import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearIssueNewCardFlow, setIssueNewCardStepAndData} from '@libs/actions/Card';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type CardTypeStepProps = {
    /** ID of the policy */
    policyID: string | undefined;

    /** Array of step names */
    stepNames: readonly string[];

    /** Start from step index */
    startStepIndex: number;
};

function CardTypeStep({policyID, stepNames, startStepIndex}: CardTypeStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['HandCard', 'VirtualCard']);
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {canBeMissing: true});

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
        if (issueNewCard?.isChangeAssigneeDisabled) {
            Navigation.goBack();
            clearIssueNewCardFlow(policyID);
            return;
        }
        setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.ASSIGNEE, policyID});
    };

    return (
        <InteractiveStepWrapper
            wrapperID="CardTypeStep"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={startStepIndex}
            stepNames={stepNames}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.chooseCardType')}</Text>
            <View style={styles.mh5}>
                <MenuItem
                    icon={illustrations.HandCard}
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
                    icon={illustrations.VirtualCard}
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

export default CardTypeStep;
