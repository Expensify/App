/** Keeps a failed category flag read distinct from an empty rules collection. */
import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';

import useLocalize from '@hooks/useLocalize';

import {getPolicyCategories} from '@libs/actions/Policy/Category';
import {getRules} from '@libs/actions/Policy/Rules';

import React from 'react';

type CategoryFlagLimitsLoadErrorProps = {
    missingCategoriesPolicyID?: string;
};

function CategoryFlagLimitsLoadError({missingCategoriesPolicyID}: CategoryFlagLimitsLoadErrorProps) {
    const {translate} = useLocalize();

    const retry = () => {
        if (missingCategoriesPolicyID) {
            getPolicyCategories(missingCategoriesPolicyID);
        }
        getRules();
    };

    return (
        <FullPageOfflineBlockingView>
            <FullPageErrorView
                shouldShow
                title={translate('common.genericErrorMessage')}
                buttonTranslationKey="common.tryAgain"
                onButtonPress={retry}
            />
        </FullPageOfflineBlockingView>
    );
}

export default CategoryFlagLimitsLoadError;
