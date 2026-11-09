/** The collapsed flat navigation bar's round "+" button, named by a "Create" tooltip, which opens the same create menu as the "+ Create" button. */
import Button from '@components/Button';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CreateMenuPopover from '@pages/inbox/sidebar/FABPopoverContent/CreateMenuPopover';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import useFlatNavCreateMenu from './useFlatNavCreateMenu';

function FlatNavCompactCreateButton() {
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
            <Tooltip text={translate('common.create')}>
                <View style={styles.alignSelfStart}>
                    <Button
                        ref={buttonRef}
                        testID="FlatNavCompactCreateButton"
                        accessibilityLabel={translate('common.create')}
                        accessibilityHasPopup="menu"
                        accessibilityState={{expanded: isCreateMenuActive}}
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.SMALL}
                        innerStyles={styles.flatNavigationBarCompactCreateButton}
                        onPress={toggleCreateMenu}
                        sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_ACTION_BUTTON}
                    >
                        <Button.Icon src={icons.Plus} />
                    </Button>
                </View>
            </Tooltip>
        </>
    );
}

export default FlatNavCompactCreateButton;
