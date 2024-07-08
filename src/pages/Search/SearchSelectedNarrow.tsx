import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';

type SearchSelectedNarrowProps = {options: Array<DropdownOption<SearchHeaderOptionValue>>; itemsLength: number};

function SearchSelectedNarrow({options, itemsLength}: SearchSelectedNarrowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    const openMenu = () => setIsModalVisible(true);
    const closeMenu = () => setIsModalVisible(false);

    return (
        <View style={[styles.pb4]}>
            <PressableWithFeedback
                accessibilityLabel="selected"
                ref={buttonRef}
                style={[styles.tabSelectorButton, styles.ph5]}
                onPress={openMenu}
            >
                <Button
                    style={[styles.w100, styles.mh3]}
                    text={translate('workspace.common.selected', {selectedNumber: itemsLength})}
                    shouldShowRightIcon
                    centeredContent
                    iconRight={Expensicons.DownArrow}
                />
            </PressableWithFeedback>

            <Modal
                isVisible={isModalVisible}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                onClose={closeMenu}
            >
                {options.map((option) => (
                    <MenuItem
                        title={option.text}
                        icon={option.icon}
                        onPress={option.onSelected}
                        key={option.value}
                    />
                ))}
            </Modal>
        </View>
    );
}

SearchSelectedNarrow.displayName = 'SearchSelectedNarrow';

export default SearchSelectedNarrow;
