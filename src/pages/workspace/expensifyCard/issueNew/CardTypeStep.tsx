import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearIssueNewCardFlow, setIssueNewCardStepAndData} from '@libs/actions/Card';
import {getDefaultExpensifyCardLimitType} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

type CardTypeStepProps = {
    /** The policy that the card will be issued under */
    policy: OnyxEntry<Policy>;

    /** Array of step names */
    stepNames: readonly string[];

    /** Start from step index */
    startStepIndex: number;
};

function CardTypeStep({policy, stepNames, startStepIndex}: CardTypeStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['HandCard', 'VirtualCard']);
    const policyID = policy?.id;
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {canBeMissing: true});

    const isEditing = issueNewCard?.isEditing;

    const submit = (value: ValueOf<typeof CONST.EXPENSIFY_CARD.CARD_TYPE>) => {
        const defaultType = getDefaultExpensifyCardLimitType(policy);
        const isSingleUseType = issueNewCard?.data?.limitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE;
        const shouldUseDefaultLimitType = isSingleUseType && value === CONST.EXPENSIFY_CARD.CARD_TYPE.PHYSICAL;
        setIssueNewCardStepAndData({
            step: isEditing ? CONST.EXPENSIFY_CARD.STEP.CONFIRMATION : CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE,
            data: {
                cardType: value,
                limitType: shouldUseDefaultLimitType ? defaultType : issueNewCard?.data?.limitType,
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
