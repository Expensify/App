import React from 'react';
import Button from '@components/Button';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function SearchSaveButton() {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Bookmark']);

    return (
        <Button
            small
            icon={expensifyIcons.Bookmark}
            text={translate('common.save')}
            onPress={() => Navigation.navigate(ROUTES.SEARCH_SAVE)}
        />
    );
}

export default SearchSaveButton;
