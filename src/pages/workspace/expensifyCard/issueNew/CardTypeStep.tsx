import Icon from '@components/Icon';
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

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {authTokenTypeSelector} from '@src/selectors/Session';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type CardTypeStepProps = {
    /** The policy that the card will be issued under */
    policy: OnyxEntry<Policy>;

    stepNames: readonly string[];
    startStepIndex: number;
};

function CardTypeStep({policy, stepNames, startStepIndex}: CardTypeStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['HandCard', 'VirtualCard']);
    const policyID = policy?.id;
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

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
                <MenuItem.Root
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.ISSUE_CARD_TYPE_PHYSICAL}
                    onPress={callIfAuthenticated(() => submit(CONST.EXPENSIFY_CARD.CARD_TYPE.PHYSICAL), session)}
                    style={styles.purposeMenuItem}
                >
                    <MenuItem.Row>
                        <MenuItem.Leading>
                            <View style={[styles.popoverMenuIcon, styles.ml3, styles.mr2]}>
                                <Icon
                                    src={illustrations.HandCard}
                                    width={variables.menuIconSize}
                                    height={variables.menuIconSize}
                                />
                            </View>
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>{translate('workspace.card.issueNewCard.physicalCard')}</MenuItem.Title>
                            <MenuItem.Description>{translate('workspace.card.issueNewCard.physicalCardDescription')}</MenuItem.Description>
                        </MenuItem.Content>
                        <MenuItem.Trailing>
                            <MenuItem.Chevron />
                        </MenuItem.Trailing>
                    </MenuItem.Row>
                </MenuItem.Root>
                <MenuItem.Root
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.ISSUE_CARD_TYPE_VIRTUAL}
                    onPress={callIfAuthenticated(() => submit(CONST.EXPENSIFY_CARD.CARD_TYPE.VIRTUAL), session)}
                    style={styles.purposeMenuItem}
                >
                    <MenuItem.Row>
                        <MenuItem.Leading>
                            <View style={[styles.popoverMenuIcon, styles.ml3, styles.mr2]}>
                                <Icon
                                    src={illustrations.VirtualCard}
                                    width={variables.menuIconSize}
                                    height={variables.menuIconSize}
                                />
                            </View>
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>{translate('workspace.card.issueNewCard.virtualCard')}</MenuItem.Title>
                            <MenuItem.Description>{translate('workspace.card.issueNewCard.virtualCardDescription')}</MenuItem.Description>
                        </MenuItem.Content>
                        <MenuItem.Trailing>
                            <MenuItem.Chevron />
                        </MenuItem.Trailing>
                    </MenuItem.Row>
                </MenuItem.Root>
            </View>
        </InteractiveStepWrapper>
    );
}

export default CardTypeStep;
