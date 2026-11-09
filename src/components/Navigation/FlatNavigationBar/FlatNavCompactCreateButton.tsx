import Button from '@components/Button';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CreateMenuPopover from '@pages/inbox/sidebar/FABPopoverContent/CreateMenuPopover';

import React from 'react';
import {View} from 'react-native';

import FlatNavCreateMenuButton from './FlatNavCreateMenuButton';
import useFlatNavCreateMenu from './useFlatNavCreateMenu';

/** The collapsed flat navigation bar's round "+" button, named by a "Create" tooltip, which opens the same create menu as the "+ Create" button. */
function FlatNavCompactCreateButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const {buttonRef, isCreateMenuActive, toggleCreateMenu, menuProps} = useFlatNavCreateMenu();

    return (
        <>
            <CreateMenuPopover {...menuProps} />
            <Tooltip text={translate('common.create')}>
                <View style={styles.alignSelfStart}>
                    <FlatNavCreateMenuButton
                        ref={buttonRef}
                        isExpanded={isCreateMenuActive}
                        onPress={toggleCreateMenu}
                        testID="FlatNavCompactCreateButton"
                        innerStyles={styles.flatNavigationBarCompactCreateButton}
                    >
                        <Button.Icon src={icons.Plus} />
                    </FlatNavCreateMenuButton>
                </View>
            </Tooltip>
        </>
    );
}

export default FlatNavCompactCreateButton;
