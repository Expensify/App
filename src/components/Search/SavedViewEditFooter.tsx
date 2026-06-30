import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SaveViewAction = 'edits' | 'newView';

type SavedViewEditFooterProps = {
    /** Abandons the edits and leaves edit mode */
    onCancel: () => void;

    /** Saves the edited filters back to the view being edited */
    onSaveEdits: () => void;

    /** Saves the edited filters as a brand new view */
    onSaveAsNewView: () => void;

    /** Styles for the footer container (padding/border supplied by the caller) */
    style?: StyleProp<ViewStyle>;
};

/** The mobile "Edit filters" footer: Cancel + a Save dropdown ("Save edits" / "Save as new view"). */
function SavedViewEditFooter({onCancel, onSaveEdits, onSaveAsNewView, style}: SavedViewEditFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark', 'Plus']);

    const saveOptions: Array<DropdownOption<SaveViewAction>> = [
        {value: 'edits', text: translate('search.saveEdits'), icon: icons.Checkmark, onSelected: onSaveEdits},
        {value: 'newView', text: translate('search.saveAsNewView'), icon: icons.Plus, onSelected: onSaveAsNewView},
    ];

    return (
        <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter, style]}>
            <Button
                large
                text={translate('common.cancel')}
                onPress={onCancel}
                style={styles.flex1}
            />
            <ButtonWithDropdownMenu<SaveViewAction>
                success
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                onPress={(_event, value) => {
                    saveOptions.find((option) => option.value === value)?.onSelected?.();
                }}
                options={saveOptions}
                shouldUseOptionIcon
                isSplitButton={false}
                customText={translate('common.save')}
                wrapperStyle={styles.flex1}
                anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM}}
            />
        </View>
    );
}

export default SavedViewEditFooter;
