import React from 'react';
import Button from '@components/Button';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
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
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_SAVE_BUTTON}
        />
    );
}

export default SearchSaveButton;
