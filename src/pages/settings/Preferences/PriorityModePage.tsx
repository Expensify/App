import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateChatPriorityMode} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type PriorityModeItem = {
    value: ValueOf<typeof CONST.PRIORITY_MODE>;
    text: string;
    alternateText: string;
    keyForList: ValueOf<typeof CONST.PRIORITY_MODE>;
    isSelected: boolean;
};

function PriorityModePage() {
    const {translate} = useLocalize();
    const [priorityMode = CONST.PRIORITY_MODE.DEFAULT] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {canBeMissing: true});
    const styles = useThemeStyles();
    const priorityModes = Object.values(CONST.PRIORITY_MODE).map<PriorityModeItem>((mode) => ({
        value: mode,
        text: translate(`priorityModePage.priorityModes.${mode}.label`),
        alternateText: translate(`priorityModePage.priorityModes.${mode}.description`),
        keyForList: mode,
        isSelected: priorityMode === mode,
    }));

    const updateMode = useCallback(
        (mode: PriorityModeItem) => {
            if (mode.value === priorityMode) {
                Navigation.goBack();
                return;
            }
            updateChatPriorityMode(mode.value);
        },
        [priorityMode],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="PriorityModePage"
        >
            <HeaderWithBackButton
                title={translate('priorityModePage.priorityMode')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <Text style={[styles.mh5, styles.mv3]}>{translate('priorityModePage.explainerText')}</Text>
            <SelectionList
                data={priorityModes}
                ListItem={RadioListItem}
                onSelectRow={updateMode}
                shouldSingleExecuteRowSelect
                initiallyFocusedItemKey={priorityModes.find((mode) => mode.isSelected)?.keyForList}
            />
        </ScreenWrapper>
    );
}

export default PriorityModePage;
