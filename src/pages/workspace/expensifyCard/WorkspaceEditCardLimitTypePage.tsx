import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

// TODO: remove when Onyx data is available
const mockedCard = {
    accountID: 885646,
    availableSpend: 1000,
    nameValuePairs: {
        cardTitle: 'Test 1',
        isVirtual: true,
        limit: 2000,
        limitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
    },
    lastFourPAN: '1234',
};

type WorkspaceEditCardLimitTypePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT_TYPE>;

function WorkspaceEditCardLimitTypePage({route}: WorkspaceEditCardLimitTypePageProps) {
    const {policyID, cardID} = route.params;

    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${policyID}_${CONST.EXPENSIFY_CARD.BANK}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const card = cardsList?.[cardID] ?? mockedCard;
    const areApprovalsConfigured = !isEmptyObject(policy?.approver) && policy?.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    const defaultType = areApprovalsConfigured ? CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART : CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY;

    const [typeSelected, setTypeSelected] = useState(card.nameValuePairs?.limitType ?? defaultType);

    const submit = () => {
        // TODO: add API call when it's supported https://github.com/Expensify/Expensify/issues/407833
    };

    const data = useMemo(() => {
        const options = [];

        options.push(
            {
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                text: translate('workspace.card.issueNewCard.smartLimit'),
                alternateText: translate('workspace.card.issueNewCard.smartLimitDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                isMultilineSupported: true,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
            },
            {
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
                text: translate('workspace.card.issueNewCard.monthly'),
                alternateText: translate('workspace.card.issueNewCard.monthlyDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
                isMultilineSupported: true,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            },
            {
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                text: translate('workspace.card.issueNewCard.fixedAmount'),
                alternateText: translate('workspace.card.issueNewCard.fixedAmountDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                isMultilineSupported: true,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
            },
        );

        return options;
    }, [translate, typeSelected]);

    return (
        <ScreenWrapper
            testID={WorkspaceEditCardLimitTypePage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton title={translate('workspace.card.issueNewCard.limitType')} />
            <SelectionList
                ListItem={RadioListItem}
                onSelectRow={({value}) => setTypeSelected(value)}
                sections={[{data}]}
                shouldDebounceRowSelect
                isAlternateTextMultilineSupported
                initiallyFocusedOptionKey={typeSelected}
            />
            <Button
                success
                large
                pressOnEnter
                text={translate('common.save')}
                onPress={submit}
                style={styles.m5}
            />
        </ScreenWrapper>
    );
}

WorkspaceEditCardLimitTypePage.displayName = 'WorkspaceEditCardLimitTypePage';

export default WorkspaceEditCardLimitTypePage;
