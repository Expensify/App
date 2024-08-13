import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as User from '@userActions/User';
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
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {selector: (mode) => mode ?? CONST.PRIORITY_MODE.DEFAULT});
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
            User.updateChatPriorityMode(mode.value);
        },
        [priorityMode],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={PriorityModePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('priorityModePage.priorityMode')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <Text style={[styles.mh5, styles.mv3]}>{translate('priorityModePage.explainerText')}</Text>
            <SelectionList
                sections={[{data: priorityModes}]}
                ListItem={RadioListItem}
                onSelectRow={updateMode}
                shouldSingleExecuteRowSelect
                initiallyFocusedOptionKey={priorityModes.find((mode) => mode.isSelected)?.keyForList}
            />
        </ScreenWrapper>
    );
}

PriorityModePage.displayName = 'PriorityModePage';

export default PriorityModePage;
