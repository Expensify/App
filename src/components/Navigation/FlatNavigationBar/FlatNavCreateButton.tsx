/** The flat navigation bar's Create button, together with the create menu it opens right below itself. */
import Button from '@components/Button';

import useAnchoredPopoverOpener from '@hooks/useAnchoredPopoverOpener';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CreateMenuPopover from '@pages/inbox/sidebar/FABPopoverContent/CreateMenuPopover';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

const CREATE_MENU_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type FlatNavCreateButtonProps = {
    /** Shrinks the button to a round icon-only "+", for the collapsed bar */
    isCompact?: boolean;

    isCreateMenuActive: boolean;

    isCreateMenuVisible: boolean;

    showCreateMenu: () => void;

    hideCreateMenu: () => void;

    /** Called once the create menu has fully closed and its modal is gone from the screen */
    onCreateMenuHidden?: () => void;
};

/** Opens the same create menu as the floating action button. */
function FlatNavCreateButton({isCompact = false, isCreateMenuActive, isCreateMenuVisible, showCreateMenu, hideCreateMenu, onCreateMenuHidden}: FlatNavCreateButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const {anchorRef: buttonRef, anchorPosition, openPopover: openCreateMenu} = useAnchoredPopoverOpener(CREATE_MENU_ANCHOR_ALIGNMENT, showCreateMenu);

    const toggleCreateMenu = () => {
        if (isCreateMenuActive) {
            hideCreateMenu();
            return;
        }
        openCreateMenu();
    };

    return (
        <>
            <CreateMenuPopover
                isVisible={isCreateMenuVisible}
                onClose={hideCreateMenu}
                anchorRef={buttonRef}
                anchorPosition={anchorPosition}
                anchorAlignment={CREATE_MENU_ANCHOR_ALIGNMENT}
                onModalHide={onCreateMenuHidden}
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
                innerStyles={[styles.flatNavigationBarCreateButton, isCompact && styles.flatNavigationBarCreateButtonCompact]}
                onPress={toggleCreateMenu}
                // Same action as the floating action button it replaces, so it keeps that button's Sentry and FullStory identifier.
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_ACTION_BUTTON}
            >
                <Button.Icon src={icons.Plus} />
                {!isCompact && <Button.Text>{translate('common.create')}</Button.Text>}
            </Button>
        </>
    );
}

export default FlatNavCreateButton;
