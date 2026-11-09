/** The flat navigation bar's Create button, together with the create menu it opens right below itself. */
import Button from '@components/Button';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useThemeStyles from '@hooks/useThemeStyles';

import CreateMenuPopover from '@pages/inbox/sidebar/FABPopoverContent/CreateMenuPopover';
import useCreateMenuVisibility from '@pages/inbox/sidebar/FABPopoverContent/useCreateMenuVisibility';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {View} from 'react-native';

import React, {useRef, useState} from 'react';

const CREATE_MENU_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

/** The flat navigation bar's "+ Create" button, which opens the same create menu as the floating action button, right below itself. */
function FlatNavCreateButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const {calculatePopoverPosition} = usePopoverPosition();
    const {isCreateMenuActive, isCreateMenuVisible, showCreateMenu, hideCreateMenu} = useCreateMenuVisibility();
    const buttonRef = useRef<View>(null);
    const isOpeningRef = useRef(false);
    const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>();

    // The hook's toggle would show the menu before the button is measured, at a stale position.
    const toggleCreateMenu = () => {
        if (isCreateMenuActive) {
            hideCreateMenu();
            return;
        }
        // The menu only counts as open once the measurement resolves, so a second press before then must not start another one.
        if (isOpeningRef.current) {
            return;
        }
        isOpeningRef.current = true;
        calculatePopoverPosition(buttonRef, CREATE_MENU_ANCHOR_ALIGNMENT).then(({horizontal, vertical}) => {
            isOpeningRef.current = false;
            setAnchorPosition({horizontal, vertical});
            showCreateMenu();
        });
    };

    return (
        <>
            <CreateMenuPopover
                isVisible={isCreateMenuVisible}
                onClose={hideCreateMenu}
                anchorRef={buttonRef}
                anchorPosition={anchorPosition}
                anchorAlignment={CREATE_MENU_ANCHOR_ALIGNMENT}
            />
            <Button
                ref={buttonRef}
                testID="FlatNavCreateButton"
                accessibilityLabel={translate('common.create')}
                accessibilityHasPopup="menu"
                accessibilityState={{expanded: isCreateMenuActive}}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.SMALL}
                style={styles.w100}
                innerStyles={styles.flatNavigationBarCreateButton}
                onPress={toggleCreateMenu}
                // Same action as the floating action button it replaces, so it keeps that button's Sentry and FullStory identifier.
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_ACTION_BUTTON}
            >
                <Button.Icon src={icons.Plus} />
                <Button.Text>{translate('common.create')}</Button.Text>
            </Button>
        </>
    );
}

export default FlatNavCreateButton;
