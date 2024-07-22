import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';

type SearchSelectedNarrowProps = {options: Array<DropdownOption<SearchHeaderOptionValue>>; itemsLength: number};

function SearchSelectedNarrow({options, itemsLength}: SearchSelectedNarrowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const selectedOptionIndexRef = useRef(-1);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const buttonRef = useRef<View>(null);

    const openMenu = () => setIsModalVisible(true);
    const closeMenu = () => setIsModalVisible(false);

    const handleOnModalHide = () => {
        if (selectedOptionIndexRef.current === -1) {
            return;
        }
        options[selectedOptionIndexRef.current]?.onSelected?.();
    };

    const handleOnMenuItemPress = (option: DropdownOption<SearchHeaderOptionValue>, index: number) => {
        if (option?.shouldCloseModalOnSelect) {
            selectedOptionIndexRef.current = index;
            closeMenu();
            return;
        }
        option?.onSelected?.();
    };

    const handleOnCloseMenu = () => {
        selectedOptionIndexRef.current = -1;
        closeMenu();
    };

    return (
        <View style={[styles.pb4]}>
            <Button
                onPress={openMenu}
                ref={buttonRef}
                style={[styles.w100, styles.ph5]}
                text={translate('workspace.common.selected', {selectedNumber: itemsLength})}
                isContentCentered
                iconRight={Expensicons.DownArrow}
                isDisabled={options.length === 0}
                shouldShowRightIcon={options.length !== 0}
            />

            <Modal
                isVisible={isModalVisible}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                onClose={handleOnCloseMenu}
                onModalHide={handleOnModalHide}
            >
                {options.map((option, index) => (
                    <MenuItem
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...option}
                        title={option.text}
                        titleStyle={option.titleStyle}
                        icon={option.icon}
                        onPress={() => handleOnMenuItemPress(option, index)}
                        key={option.value}
                    />
                ))}
            </Modal>
        </View>
    );
}

SearchSelectedNarrow.displayName = 'SearchSelectedNarrow';

export default SearchSelectedNarrow;
