import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import PopoverMenu from '@components/PopoverMenu';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
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
        <View style={[styles.pb3]}>
            <Button
                onPress={openMenu}
                ref={buttonRef}
                style={[styles.w100, styles.ph5]}
                text={translate('workspace.common.selected', {count: itemsLength})}
                isContentCentered
                iconRight={Expensicons.DownArrow}
                isDisabled={options.length === 0}
                shouldShowRightIcon={options.length !== 0}
                success
            />
            <PopoverMenu
                isVisible={isModalVisible}
                onClose={handleOnCloseMenu}
                onModalHide={handleOnModalHide}
                onItemSelected={(selectedItem, index) => {
                    handleOnMenuItemPress(selectedItem as DropdownOption<SearchHeaderOptionValue>, index);
                }}
                anchorPosition={{horizontal: 0, vertical: 0}}
                anchorRef={buttonRef}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
                fromSidebarMediumScreen={false}
                shouldUseModalPaddingStyle
                menuItems={options.map((item, index) => ({
                    ...item,
                    onSelected: item?.onSelected
                        ? () => {
                              item.onSelected?.();
                          }
                        : () => {
                              handleOnMenuItemPress(item, index);
                          },
                    shouldCallAfterModalHide: true,
                }))}
            />
        </View>
    );
}

SearchSelectedNarrow.displayName = 'SearchSelectedNarrow';

export default SearchSelectedNarrow;
