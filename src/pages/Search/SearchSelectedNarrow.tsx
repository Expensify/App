import React, {useRef, useState} from 'react';
import {Animated, View} from 'react-native';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';

type SearchSelectedNarrowProps = {options: Array<DropdownOption<SearchHeaderOptionValue>>; itemsLength: number};

function SearchSelectedNarrow({options, itemsLength}: SearchSelectedNarrowProps) {
    const theme = useTheme();
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
                {({hovered}) => (
                    <Animated.View style={[styles.tabSelectorButton, styles.tabBackground(hovered, true, theme.border), styles.w100, styles.mh3]}>
                        <View style={[styles.flexRow]}>
                            <Text>{translate('workspace.common.selected', {selectedNumber: itemsLength})}</Text>
                            <Icon
                                src={Expensicons.DownArrow}
                                width={14}
                                height={14}
                                additionalStyles={styles.ml2}
                            />
                        </View>
                    </Animated.View>
                )}
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
