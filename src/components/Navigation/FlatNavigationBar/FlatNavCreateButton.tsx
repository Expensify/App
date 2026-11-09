import Button from '@components/Button';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CreateMenuPopover from '@pages/inbox/sidebar/FABPopoverContent/CreateMenuPopover';

import React from 'react';

import FlatNavCreateMenuButton from './FlatNavCreateMenuButton';
import useFlatNavCreateMenu from './useFlatNavCreateMenu';

/** The flat navigation bar's "+ Create" button, which opens the same create menu as the floating action button, right below itself. */
function FlatNavCreateButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const {buttonRef, isCreateMenuActive, toggleCreateMenu, menuProps} = useFlatNavCreateMenu();

    return (
        <>
            <CreateMenuPopover {...menuProps} />
            <FlatNavCreateMenuButton
                ref={buttonRef}
                isExpanded={isCreateMenuActive}
                onPress={toggleCreateMenu}
                testID="FlatNavCreateButton"
                style={styles.w100}
                innerStyles={styles.flatNavigationBarCreateButton}
            >
                <Button.Icon src={icons.Plus} />
                <Button.Text>{translate('common.create')}</Button.Text>
            </FlatNavCreateMenuButton>
        </>
    );
}

export default FlatNavCreateButton;
