import React, {useEffect, useState} from 'react';
import PopoverMenu from '@components/PopoverMenu';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import {useButtonWithDropdownMenuRootActions, useButtonWithDropdownMenuRootState} from './Context';
import {MenuRegistryActionsContext} from './MenuContext';
import type {RegisteredOptionEntry, RegisteredSubmenuEntry} from './MenuContext';
import PositionedChildren from './PositionedChildren';
import type {DropdownOptionV2Props, MenuProps} from './types';
import useRegisteredOptions from './useRegisteredOptions';

const defaultAnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

// jsdom skips anchor measurement; seed a position so PopoverMenu mounts in tests.
const jsdomFallbackAnchor: AnchorPosition | null = process.env.NODE_ENV === 'test' ? {horizontal: 100, vertical: 100} : null;

function Menu({
    children,
    headerText,
    layout = 'fixed',
    padding = 'modal',
    selectionMarker = 'none',
    containerStyles,
    anchorAlignment = defaultAnchorAlignment,
}: MenuProps): React.ReactElement {
    const {
        state: {isMenuVisible},
        meta: {dropdownAnchor},
    } = useButtonWithDropdownMenuRootState('ButtonWithDropdownMenuV2.Menu');
    const {setIsMenuVisible} = useButtonWithDropdownMenuRootActions('ButtonWithDropdownMenuV2.Menu');
    const styles = useThemeStyles();
    // PopoverMenu itself reads isSmallScreenWidth — match it for styling parity.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {paddingBottom} = useSafeAreaPaddings(true);
    const {calculatePopoverPosition} = usePopoverPosition();

    const {actions, topLevelEntries, submenuChildren} = useRegisteredOptions();
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState<AnchorPosition | null>(jsdomFallbackAnchor);

    const popoverShouldUseScrollView = layout === 'scrollable';
    const popoverShouldUseModalPadding = padding === 'modal';

    useEffect(() => {
        if (!dropdownAnchor.current || !isMenuVisible) {
            return;
        }
        let cancelled = false;
        calculatePopoverPosition(dropdownAnchor, anchorAlignment)
            .then((next) => {
                if (cancelled) {
                    return;
                }
                setPopoverAnchorPosition(next);
            })
            .catch((error: unknown) => {
                Log.warn('[ButtonWithDropdownMenuV2.Menu] popover position calculation failed', {error: String(error)});
            });
        return () => {
            cancelled = true;
        };
    }, [isMenuVisible, dropdownAnchor, calculatePopoverPosition, anchorAlignment]);

    const buildOptionMenuItem = ({onSelected, keepOpen, ...presentation}: DropdownOptionV2Props) => ({
        ...presentation,
        shouldCloseModalOnSelect: !keepOpen,
        shouldCallAfterModalHide: true,
        onSelected: () => onSelected?.(),
    });

    const buildSubmenuMenuItem = (entry: RegisteredSubmenuEntry, subOptions: RegisteredOptionEntry[]) => {
        const {children: submenuDescriptors, ...presentation} = entry.props;
        return {
            ...presentation,
            shouldCallAfterModalHide: true,
            subMenuItems: subOptions.map((subEntry) => buildOptionMenuItem(subEntry.props)),
        };
    };

    const buildMenuItem = (entry: RegisteredOptionEntry | RegisteredSubmenuEntry) => {
        if (entry.kind === 'option') {
            return buildOptionMenuItem(entry.props);
        }
        return buildSubmenuMenuItem(entry, submenuChildren.get(entry.id) ?? []);
    };

    const menuItems = topLevelEntries.map(buildMenuItem);

    return (
        <MenuRegistryActionsContext.Provider value={actions}>
            <PositionedChildren>{children}</PositionedChildren>
            {popoverAnchorPosition ? (
                <PopoverMenu
                    isVisible={isMenuVisible}
                    onClose={() => setIsMenuVisible(false)}
                    onItemSelected={(item) => {
                        // PopoverMenu's `close()` path is skipped on Safari (its built-in exception around
                        // `shouldCallAfterModalHide`); closing externally here ensures the popover hides.
                        if (item.shouldCloseModalOnSelect === false) {
                            return;
                        }
                        setIsMenuVisible(false);
                    }}
                    anchorPosition={popoverAnchorPosition}
                    shouldShowSelectedItemCheck={selectionMarker === 'check'}
                    anchorRef={dropdownAnchor}
                    scrollContainerStyle={!popoverShouldUseModalPadding && isSmallScreenWidth ? {...styles.pt4, paddingBottom} : undefined}
                    anchorAlignment={anchorAlignment}
                    shouldUseModalPaddingStyle={popoverShouldUseModalPadding}
                    headerText={headerText}
                    shouldUseScrollView={popoverShouldUseScrollView}
                    containerStyles={containerStyles}
                    menuItems={menuItems}
                />
            ) : null}
        </MenuRegistryActionsContext.Provider>
    );
}

Menu.displayName = 'ButtonWithDropdownMenuV2.Menu';

export default Menu;
