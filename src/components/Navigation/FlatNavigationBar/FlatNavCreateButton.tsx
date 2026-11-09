/** The flat navigation bar's "+ Create" button, which opens the same create menu as the floating action button, right below itself. */
import Button from '@components/Button';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CreateMenuPopover from '@pages/inbox/sidebar/FABPopoverContent/CreateMenuPopover';

import CONST from '@src/CONST';

import React from 'react';

import useFlatNavCreateMenu from './useFlatNavCreateMenu';

function FlatNavCreateButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const {buttonRef, isCreateMenuActive, toggleCreateMenu, menuProps} = useFlatNavCreateMenu();

    return (
        <>
            <CreateMenuPopover
                isVisible={menuProps.isVisible}
                onClose={menuProps.onClose}
                anchorRef={menuProps.anchorRef}
                anchorPosition={menuProps.anchorPosition}
                anchorAlignment={menuProps.anchorAlignment}
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
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_ACTION_BUTTON}
            >
                <Button.Icon src={icons.Plus} />
                <Button.Text>{translate('common.create')}</Button.Text>
            </Button>
        </>
    );
}

export default FlatNavCreateButton;
