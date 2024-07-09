import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomListSelectorType} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

type NetSuiteCustomListSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Function to call when the user closes the business type selector modal */
    onClose: () => void;

    /** Label to display on field */
    label: string;

    /** Custom List value selected  */
    currentCustomListValue: string;

    policy?: Policy;

    /** Function to call when the user selects a custom list */
    onCustomListSelected: (value: CustomListSelectorType) => void;

    /** Function to call when the user presses on the modal backdrop */
    onBackdropPress?: () => void;
};

function NetSuiteCustomListSelectorModal({isVisible, currentCustomListValue, onCustomListSelected, onClose, label, policy, onBackdropPress}: NetSuiteCustomListSelectorModalProps) {
    const {translate} = useLocalize();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const {sections, headerMessage, showTextInput} = useMemo(() => {
        const customLists = policy?.connections?.netsuite?.options?.data?.customLists ?? [];
        const customListData = customLists.map((customListRecord) => ({
            text: customListRecord.name,
            value: customListRecord.name,
            isSelected: customListRecord.name === currentCustomListValue,
            keyForList: customListRecord.name,
            id: customListRecord.id,
        }));

        const searchRegex = new RegExp(Str.escapeForRegExp(debouncedSearchValue.trim()), 'i');
        const filteredCustomLists = customListData.filter((customListRecord) => searchRegex.test(customListRecord.text ?? ''));
        const isEmpty = debouncedSearchValue.trim() && !filteredCustomLists.length;

        return {
            sections: isEmpty
                ? []
                : [
                      {
                          data: filteredCustomLists,
                      },
                  ],
            headerMessage: isEmpty ? translate('common.noResultsFound') : '',
            showTextInput: customListData.length > CONST.NETSUITE_CONFIG.NETSUITE_CUSTOM_LIST_LIMIT,
        };
    }, [debouncedSearchValue, policy?.connections?.netsuite?.options?.data?.customLists, translate, currentCustomListValue]);

    const styles = useThemeStyles();

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={onClose}
            hideModalContentWhileAnimating
            useNativeDriver
            onBackdropPress={onBackdropPress}
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={NetSuiteCustomListSelectorModal.displayName}
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    sections={sections}
                    textInputValue={searchValue}
                    textInputLabel={showTextInput ? translate('common.search') : undefined}
                    onChangeText={setSearchValue}
                    onSelectRow={onCustomListSelected}
                    headerMessage={headerMessage}
                    ListItem={RadioListItem}
                    isRowMultilineSupported
                    initiallyFocusedOptionKey={currentCustomListValue}
                    shouldDebounceRowSelect
                    shouldStopPropagation
                    shouldUseDynamicMaxToRenderPerBatch
                />
            </ScreenWrapper>
        </Modal>
    );
}

NetSuiteCustomListSelectorModal.displayName = 'NetSuiteCustomListSelectorModal';

export default NetSuiteCustomListSelectorModal;
