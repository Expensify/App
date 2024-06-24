import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import TextSelectorModal from '@components/TextPicker/TextSelectorModal';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import localeCompare from '@libs/LocaleCompare';
import CONST from '@src/CONST';
import type {ReportFieldListValue, ReportFieldListValues} from '@src/types/form/WorkspaceReportFieldsForm';

type ValueListItem = ListItem & {
    value: ReportFieldListValue;
    enabled: boolean;
    orderWeight?: number;
};

type ListValuesSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Label to display on field */
    label: string;

    /** Subtitle to display on field */
    subtitle: string;

    /** Currently selected list values */
    values: ReportFieldListValues;

    /** Function to call when the user closes the list values selector modal */
    onClose: () => void;

    onValueAdded: (value: string) => void;
};

function ListValuesSelectorModal({isVisible, label, subtitle, values, onClose, onValueAdded}: ListValuesSelectorModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [selectedValues, setSelectedValues] = useState<Record<string, boolean>>({});

    const valueList = useMemo(
        () =>
            Object.values(values ?? {})
                .sort((valueA, valueB) => localeCompare(valueA.name, valueB.name))
                .map((value) => ({
                    value,
                    text: value.name,
                    keyForList: value.name,
                    isSelected: selectedValues[value.name],
                    enabled: !value.disabled,
                })),
        [selectedValues, values],
    );

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const onValueSelected = (value: string) => {
        hidePickerModal();
        onValueAdded(value);
    };

    const toggleValue = (value: ValueListItem) => {
        setSelectedValues((prev) => ({
            ...prev,
            [value.value.name]: !prev[value.value.name],
        }));
    };

    const toggleAllValues = () => {
        const isAllSelected = Object.keys(values).length === Object.keys(selectedValues).length;
        setSelectedValues(isAllSelected ? {} : Object.fromEntries(Object.values(values).map((value) => [value.name, true])));
    };

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.pr9]}>
            <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
        </View>
    );

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={onClose}
            hideModalContentWhileAnimating
            useNativeDriver
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={ListValuesSelectorModal.displayName}
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                >
                    <View style={[styles.w100, styles.flexRow, styles.gap2, isSmallScreenWidth && styles.mb3]}>
                        <Button
                            style={[isSmallScreenWidth && styles.flex1]}
                            medium
                            success
                            icon={Expensicons.Plus}
                            text={translate('common.addValue')}
                            onPress={showPickerModal}
                        />
                    </View>
                </HeaderWithBackButton>
                <View style={[styles.ph5, styles.pb4]}>
                    <Text style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText])}>{subtitle}</Text>
                </View>
                <SelectionList
                    canSelectMultiple
                    sections={[{data: valueList, isDisabled: false}]}
                    onCheckboxPress={toggleValue}
                    onSelectRow={() => {}}
                    shouldDebounceRowSelect={false}
                    onSelectAll={toggleAllValues}
                    ListItem={TableListItem}
                    customListHeader={getCustomListHeader()}
                    shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                    listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                    showScrollIndicator={false}
                />
                <TextSelectorModal
                    isVisible={isPickerVisible}
                    value=""
                    shouldClearOnClose
                    description={translate('common.addValue')}
                    onClose={hidePickerModal}
                    onValueSelected={onValueSelected}
                />
            </ScreenWrapper>
        </Modal>
    );
}

ListValuesSelectorModal.displayName = 'ListValuesSelectorModal';

export default ListValuesSelectorModal;
