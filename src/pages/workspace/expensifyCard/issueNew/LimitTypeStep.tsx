import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type LimitTypeStepProps = {
    // The policy that the card will be issued under
    policy: OnyxEntry<OnyxTypes.Policy>;
};

function LimitTypeStep({policy}: LimitTypeStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [issueNewCard] = useOnyx(ONYXKEYS.ISSUE_NEW_EXPENSIFY_CARD);

    const areApprovalsConfigured = PolicyUtils.getApprovalWorkflow(policy) !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    const defaultType = areApprovalsConfigured ? CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART : CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY;

    const [typeSelected, setTypeSelected] = useState(issueNewCard?.data?.limitType ?? defaultType);

    const isEditing = issueNewCard?.isEditing;

    const submit = useCallback(() => {
        Card.setIssueNewCardStepAndData({
            step: isEditing ? CONST.EXPENSIFY_CARD.STEP.CONFIRMATION : CONST.EXPENSIFY_CARD.STEP.LIMIT,
            data: {limitType: typeSelected},
            isEditing: false,
        });
    }, [isEditing, typeSelected]);

    const handleBackButtonPress = useCallback(() => {
        if (isEditing) {
            Card.setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false});
            return;
        }
        Card.setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CARD_TYPE});
    }, [isEditing]);

    const data = useMemo(() => {
        const options = [];

        if (areApprovalsConfigured) {
            options.push({
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                text: translate('workspace.card.issueNewCard.smartLimit'),
                alternateText: translate('workspace.card.issueNewCard.smartLimitDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
            });
        }

        options.push(
            {
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
                text: translate('workspace.card.issueNewCard.monthly'),
                alternateText: translate('workspace.card.issueNewCard.monthlyDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            },
            {
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                text: translate('workspace.card.issueNewCard.fixedAmount'),
                alternateText: translate('workspace.card.issueNewCard.fixedAmountDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
            },
        );

        return options;
    }, [areApprovalsConfigured, translate, typeSelected]);

    return (
        <ScreenWrapper
            testID={LimitTypeStep.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.card.issueCard')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={2}
                    stepNames={CONST.EXPENSIFY_CARD.STEP_NAMES}
                />
            </View>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.chooseLimitType')}</Text>
            <SelectionList
                ListItem={RadioListItem}
                onSelectRow={({value}) => setTypeSelected(value)}
                sections={[{data}]}
                shouldSingleExecuteRowSelect
                initiallyFocusedOptionKey={typeSelected}
                shouldUpdateFocusedIndex
            />
            <Button
                success
                large
                pressOnEnter
                text={translate(isEditing ? 'common.confirm' : 'common.next')}
                onPress={submit}
                style={styles.m5}
            />
        </ScreenWrapper>
    );
}

LimitTypeStep.displayName = 'LimitTypeStep';

export default LimitTypeStep;
