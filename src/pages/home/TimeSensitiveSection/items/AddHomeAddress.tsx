import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import colors from '@styles/theme/colors';

import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

import React from 'react';

function AddHomeAddress() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Home']);

    return (
        <BaseWidgetItem
            icon={icons.Home}
            iconBackgroundColor={colors.green100}
            iconFill={colors.green500}
            title={translate('homePage.timeSensitiveSection.addHomeAddress.title')}
            subtitle={translate('homePage.timeSensitiveSection.addHomeAddress.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.addHomeAddress.cta')}
            // Match the destination used by the "Address" row in the profile so this entry point
            // lands on the same private-personal-details screen with the address field focused.
            onCtaPress={() => Navigation.navigate(ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(INPUT_IDS.ADDRESS_LINE_1))}
            buttonProps={{success: true}}
        />
    );
}

export default AddHomeAddress;
