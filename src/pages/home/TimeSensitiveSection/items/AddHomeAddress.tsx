import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import openPrivatePersonalDetailsPage from '@libs/Navigation/helpers/openPrivatePersonalDetailsPage';

import colors from '@styles/theme/colors';

import CONST from '@src/CONST';
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
            // lands on the same private-personal-details screen with the address field focused, and use
            // the profile page as the background instead of whichever report or Home screen launched it.
            onCtaPress={() => openPrivatePersonalDetailsPage(INPUT_IDS.ADDRESS_LINE_1)}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default AddHomeAddress;
