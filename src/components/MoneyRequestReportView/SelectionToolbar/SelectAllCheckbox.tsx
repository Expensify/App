import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SelectAllCheckboxProps = {
    /** Whether the checkbox is checked/selected */
    isSelectAllChecked: boolean;

    /** Whether the button is in the indeterminate ("mixed") state */
    isIndeterminate: boolean;

    /** Whether any transactions are currently selected (used for checkbox toggle logic) */
    hasAnySelected: boolean;

    /** Callback to select all transactions */
    onSelectAll: () => void;

    /** Callback to clear all selected transactions */
    onClearAll: () => void;
};

function SelectAllCheckbox({isSelectAllChecked, isIndeterminate, hasAnySelected, onSelectAll, onClearAll}: SelectAllCheckboxProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isInLandscapeMode = useIsInLandscapeMode();

    return (
        <View style={[styles.userSelectNone, styles.flexRow, styles.alignItemsCenter, isInLandscapeMode ? undefined : [styles.pt6, styles.ph8, styles.pb3]]}>
            <Checkbox
                accessibilityLabel={translate('accessibilityHints.selectAllItems')}
                isChecked={isSelectAllChecked}
                isIndeterminate={isIndeterminate}
                onPress={() => {
                    if (hasAnySelected) {
                        onClearAll();
                    } else {
                        onSelectAll();
                    }
                }}
            />
            <PressableWithFeedback
                style={[styles.userSelectNone, styles.alignItemsCenter]}
                onPress={() => {
                    if (isSelectAllChecked) {
                        onClearAll();
                    } else {
                        onSelectAll();
                    }
                }}
                accessibilityLabel={translate('accessibilityHints.selectAllItems')}
                role="button"
                accessibilityState={{checked: isSelectAllChecked}}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                sentryLabel={CONST.SENTRY_LABEL.REPORT.MONEY_REQUEST_REPORT_ACTIONS_LIST_SELECT_ALL}
            >
                <Text style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>
            </PressableWithFeedback>
        </View>
    );
}

export default SelectAllCheckbox;
