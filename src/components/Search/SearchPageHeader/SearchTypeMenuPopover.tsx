import React, {useRef} from 'react';
import Button from '@components/Button';
import PopoverMenu from '@components/PopoverMenu';
import type {SearchQueryJSON} from '@components/Search/types';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useSearchTypeMenu from '@hooks/useSearchTypeMenu';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Expensicons from '@src/components/Icon/Expensicons';

type SearchTypeMenuNarrowProps = {
    queryJSON: SearchQueryJSON;
};

function SearchTypeMenuPopover({queryJSON}: SearchTypeMenuNarrowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isPopoverVisible, delayPopoverMenuFirstRender, openMenu, closeMenu, allMenuItems, DeleteConfirmModal, windowHeight} = useSearchTypeMenu(queryJSON);

    const buttonRef = useRef<HTMLDivElement>(null);
    const {unmodifiedPaddings} = useSafeAreaPaddings();

    return (
        <>
            <Button
                innerStyles={[{backgroundColor: theme.sidebarHover}]}
                icon={Expensicons.Bookmark}
                onPress={openMenu}
            />
            {!delayPopoverMenuFirstRender && (
                <PopoverMenu
                    menuItems={allMenuItems}
                    isVisible={isPopoverVisible}
                    anchorPosition={styles.createMenuPositionSidebar(windowHeight)}
                    onClose={closeMenu}
                    onItemSelected={closeMenu}
                    anchorRef={buttonRef}
                    shouldUseScrollView
                    shouldUseModalPaddingStyle={false}
                    innerContainerStyle={{paddingBottom: unmodifiedPaddings.bottom}}
                    shouldAvoidSafariException
                />
            )}
            <DeleteConfirmModal />
        </>
    );
}

SearchTypeMenuPopover.displayName = 'SearchTypeMenuPopover';

export default SearchTypeMenuPopover;
