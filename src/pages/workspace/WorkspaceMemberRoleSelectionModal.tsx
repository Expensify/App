import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ListItemType = ListItem<ValueOf<typeof CONST.POLICY.ROLE>> & {
    value: ValueOf<typeof CONST.POLICY.ROLE>;
    text: string;
    alternateText: string;
    isSelected: boolean;
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
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <ScreenWrapper
                testID="WorkspaceMemberDetailsRoleSelectionModal"
                includePaddingTop={false}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('common.role')}
                    onBackButtonPress={onClose}
                />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    <SelectionList
                        data={items}
                        ListItem={RadioListItem}
                        onSelectRow={onRoleChange}
                        shouldSingleExecuteRowSelect
                        initiallyFocusedItemKey={items.find((item) => item.isSelected)?.keyForList}
                        addBottomSafeAreaPadding
                    />
                </View>
            </ScreenWrapper>
        </Modal>
    );
}

export type {ListItemType};

export default WorkspaceMemberDetailsRoleSelectionModal;
