/**
 * The header above an expense flow's workspace list: a search bar once the list is long, otherwise a "Choose workspace"
 * label.
 */
import SearchBar from '@components/SearchBar';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type RequestStepWorkspaceListHeaderProps = {
    /** Number of workspaces before the search filters them, which decides whether the search bar shows */
    workspaceCount: number;

    /** Number of workspaces left after the search */
    filteredWorkspaceCount: number;

    inputValue: string;

    onChangeText: (text: string) => void;
};

function RequestStepWorkspaceListHeader({workspaceCount, filteredWorkspaceCount, inputValue, onChangeText}: RequestStepWorkspaceListHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (workspaceCount >= CONST.STANDARD_LIST_ITEM_LIMIT) {
        return (
            <SearchBar
                label={translate('workspace.common.findWorkspace')}
                inputValue={inputValue}
                onChangeText={onChangeText}
                shouldShowEmptyState={workspaceCount > 0 && filteredWorkspaceCount === 0}
            />
        );
    }

    return (
        <View style={[styles.optionsListSectionHeader]}>
            <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('iou.chooseWorkspace')}</Text>
        </View>
    );
}

export default RequestStepWorkspaceListHeader;
