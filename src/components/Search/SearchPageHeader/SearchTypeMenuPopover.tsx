import React, {useRef} from 'react';
import Button from '@components/Button';
import PopoverMenu from '@components/PopoverMenu';
import type {SearchQueryJSON} from '@components/Search/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useSearchTypeMenu from '@hooks/useSearchTypeMenu';
import useThemeStyles from '@hooks/useThemeStyles';

type SearchTypeMenuNarrowProps = {
    queryJSON: SearchQueryJSON;
};

function SearchTypeMenuPopover({queryJSON}: SearchTypeMenuNarrowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isPopoverVisible, delayPopoverMenuFirstRender, openMenu, closeMenu, allMenuItems, windowHeight} = useSearchTypeMenu(queryJSON);

    const buttonRef = useRef<HTMLDivElement>(null);
    const {unmodifiedPaddings} = useSafeAreaPaddings();

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Menu']);

    return (
        <>
            <Button
                icon={expensifyIcons.Menu}
                onPress={openMenu}
                accessibilityLabel={translate('search.filtersHeader')}
            />
            {!delayPopoverMenuFirstRender && (
                <PopoverMenu
                    menuItems={allMenuItems}
                    isVisible={isPopoverVisible}
                    anchorPosition={styles.createMenuPositionSearchBar(windowHeight)}
                    onClose={closeMenu}
                    onItemSelected={closeMenu}
                    anchorRef={buttonRef}
                    shouldUseScrollView
                    shouldUseModalPaddingStyle={false}
                    innerContainerStyle={{paddingBottom: unmodifiedPaddings.bottom}}
                    shouldAvoidSafariException
                    scrollContainerStyle={styles.pv0}
                />
            )}
        </>
    );
}

export default SearchTypeMenuPopover;
