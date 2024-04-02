import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
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
import type {PriorityMode} from '@src/types/onyx';

type PriorityModeItem = {
    value: ValueOf<typeof CONST.PRIORITY_MODE>;
    text: string;
    alternateText: string;
    keyForList: ValueOf<typeof CONST.PRIORITY_MODE>;
    isSelected: boolean;
};

type PriorityModePageOnyxProps = {
    /** The chat priority mode */
    priorityMode: PriorityMode;
};

type PriorityModePageProps = PriorityModePageOnyxProps;

function PriorityModePage({priorityMode}: PriorityModePageProps) {
    const {translate} = useLocalize();
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
                shouldDebounceRowSelect
                initiallyFocusedOptionKey={priorityModes.find((mode) => mode.isSelected)?.keyForList}
            />
        </ScreenWrapper>
    );
}

PriorityModePage.displayName = 'PriorityModePage';

export default withOnyx<PriorityModePageProps, PriorityModePageOnyxProps>({
    priorityMode: {
        key: ONYXKEYS.NVP_PRIORITY_MODE,
    },
})(PriorityModePage);
