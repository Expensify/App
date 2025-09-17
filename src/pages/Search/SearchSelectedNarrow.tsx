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

    // Stores an option to execute after modal closes when using deferred execution
    const selectedOptionRef = useRef<DropdownOption<SearchHeaderOptionValue> | null>(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const buttonRef = useRef<View>(null);

    const openMenu = () => setIsModalVisible(true);
    const closeMenu = () => setIsModalVisible(false);

    const handleOnModalHide = () => {
        if (!selectedOptionRef.current) {
            return;
        }

        selectedOptionRef.current.onSelected?.();
        selectedOptionRef.current = null;
    };

    const handleOnMenuItemPress = (option: DropdownOption<SearchHeaderOptionValue>) => {
        if (option?.shouldCloseModalOnSelect) {
            selectedOptionRef.current = option;
            closeMenu();
            return;
        }
        option?.onSelected?.();
    };

    const handleOnCloseMenu = () => {
        selectedOptionRef.current = null;
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
                onItemSelected={(selectedItem) => {
                    handleOnMenuItemPress(selectedItem as DropdownOption<SearchHeaderOptionValue>);
                }}
                anchorPosition={{horizontal: 0, vertical: 0}}
                anchorRef={buttonRef}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
                fromSidebarMediumScreen={false}
                shouldUseModalPaddingStyle
                menuItems={options}
            />
        </View>
    );
}

SearchSelectedNarrow.displayName = 'SearchSelectedNarrow';

export default SearchSelectedNarrow;
