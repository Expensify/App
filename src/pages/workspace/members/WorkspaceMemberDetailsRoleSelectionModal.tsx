import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ListItemType = {
    value: ValueOf<typeof CONST.POLICY.ROLE>;
    text: string;
    alternateText: string;
    isSelected: boolean;
    keyForList: ValueOf<typeof CONST.POLICY.ROLE>;
};

type WorkspaceMemberDetailsPageProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** The list of items to render */
    items: ListItemType[];

    /** Function to call when the user selects a role */
    onRoleChange: ({value}: ListItemType) => void;

    /** Function to call when the user closes the role selection modal */
    onClose: () => void;
};

function WorkspaceMemberDetailsRoleSelectionModal({isVisible, items, onRoleChange, onClose}: WorkspaceMemberDetailsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={() => onClose?.()}
            onModalHide={onClose}
            hideModalContentWhileAnimating
            useNativeDriver
        >
            <ScreenWrapper
                testID={WorkspaceMemberDetailsRoleSelectionModal.displayName}
                includePaddingTop={false}
            >
                <HeaderWithBackButton
                    title={translate('common.role')}
                    onBackButtonPress={onClose}
                />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    <SelectionList
                        sections={[{data: items}]}
                        ListItem={RadioListItem}
                        onSelectRow={onRoleChange}
                        isAlternateTextMultilineSupported
                        shouldSingleExecuteRowSelect
                        initiallyFocusedOptionKey={items.find((item) => item.isSelected)?.keyForList}
                    />
                </View>
            </ScreenWrapper>
        </Modal>
    );
}

WorkspaceMemberDetailsRoleSelectionModal.displayName = 'WorkspaceMemberDetailsRoleSelectionModal';

export type {ListItemType};

export default WorkspaceMemberDetailsRoleSelectionModal;
