import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import React from 'react';

import SearchFiltersBarButton from './SearchFiltersBarButton';

type SearchFiltersResetButtonProps = {
    onPress: () => void;
};

function SearchFiltersResetButton({onPress}: SearchFiltersResetButtonProps) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['RotateLeft']);

    return (
        <SearchFiltersBarButton
            icon={expensifyIcons.RotateLeft}
            text={translate('common.reset')}
            onPress={onPress}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.RESET_FILTERS_BUTTON}
        />
    );
}

export default SearchFiltersResetButton;
