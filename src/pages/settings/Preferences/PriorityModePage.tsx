import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateChatPriorityMode} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import React, {useState} from 'react';

type PriorityModeItem = {
    value: ValueOf<typeof CONST.PRIORITY_MODE>;
    text: string;
    alternateText: string;
    keyForList: ValueOf<typeof CONST.PRIORITY_MODE>;
    isSelected: boolean;
};

function PriorityModePage() {
    const {translate} = useLocalize();
    const [priorityMode = CONST.PRIORITY_MODE.DEFAULT] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);
    const styles = useThemeStyles();

    const [selectedPriorityMode, setSelectedPriorityMode] = useState<ValueOf<typeof CONST.PRIORITY_MODE>>();
    const currentPriorityMode = selectedPriorityMode ?? priorityMode;

    const priorityModes = Object.values(CONST.PRIORITY_MODE).map<PriorityModeItem>((mode) => ({
        value: mode,
        text: translate(`priorityModePage.priorityModes.${mode}.label`),
        alternateText: translate(`priorityModePage.priorityModes.${mode}.description`),
        keyForList: mode,
        isSelected: currentPriorityMode === mode,
    }));

    const updateMode = (mode: PriorityModeItem) => {
        setSelectedPriorityMode(mode.value);
    };

    const savePriorityMode = () => {
        updateChatPriorityMode(currentPriorityMode);
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: savePriorityMode,
        isDisabled: currentPriorityMode === priorityMode,
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            testID="PriorityModePage"
        >
            <HeaderWithBackButton
                title={translate('priorityModePage.priorityMode')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <Text style={[styles.mh5, styles.mv3]}>{translate('priorityModePage.explainerText')}</Text>
            <SelectionList
                data={priorityModes}
                ListItem={SingleSelectListItem}
                onSelectRow={updateMode}
                shouldSingleExecuteRowSelect
                confirmButtonOptions={confirmButtonOptions}
                initiallyFocusedItemKey={priorityModes.find((mode) => mode.isSelected)?.keyForList}
                addBottomSafeAreaPadding
            />
        </ScreenWrapper>
    );
}

export default PriorityModePage;
