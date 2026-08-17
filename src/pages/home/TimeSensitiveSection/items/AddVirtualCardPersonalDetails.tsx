import ExpensifyCardIcon from '@assets/images/expensify-card-icon.svg';

import BaseWidgetItem from '@components/BaseWidgetItem';

import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Card} from '@src/types/onyx';

import React from 'react';

type AddVirtualCardPersonalDetailsProps = {
    card: Card;
};

function AddVirtualCardPersonalDetails({card}: AddVirtualCardPersonalDetailsProps) {
    const theme = useTheme();
    const {translate} = useLocalize();

    return (
        <BaseWidgetItem
            icon={ExpensifyCardIcon}
            iconBackgroundColor={theme.widgetIconBG}
            iconFill={theme.widgetIconFill}
            title={translate('homePage.timeSensitiveSection.addVirtualCardPersonalDetails.title')}
            subtitle={translate('homePage.timeSensitiveSection.addVirtualCardPersonalDetails.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.addVirtualCardPersonalDetails.cta')}
            onCtaPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS.getRoute(String(card.cardID))))}
            buttonProps={{success: true}}
        />
    );
}

export default AddVirtualCardPersonalDetails;
