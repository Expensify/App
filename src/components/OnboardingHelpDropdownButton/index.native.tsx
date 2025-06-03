import React from 'react';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, OnboardingHelpType} from '@components/ButtonWithDropdownMenu/types';
import {Monitor} from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {openExternalLink} from '@libs/actions/Link';
import CONST from '@src/CONST';

type OnboardingHelpButtonProps = {
    /** Whether we should display the Onboarding help button as in narrow layout */
    shouldUseNarrowLayout: boolean;

    /** Should show Register for Webinar option */
    shouldShowRegisterForWebinar: boolean;
};

function OnboardingHelpDropdownButton({shouldUseNarrowLayout, shouldShowRegisterForWebinar}: OnboardingHelpButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const options: Array<DropdownOption<OnboardingHelpType>> = [];

    if (shouldShowRegisterForWebinar) {
        options.push({
            text: translate('getAssistancePage.registerForWebinar'),
            icon: Monitor,
            value: CONST.ONBOARDING_HELP.REGISTER_FOR_WEBINAR,
            onSelected: () => {
                openExternalLink(CONST.REGISTER_FOR_WEBINAR_URL);
            },
        });
    }

    if (options.length === 0) {
        return null;
    }

    return (
        <ButtonWithDropdownMenu
            onPress={() => null}
            shouldAlwaysShowDropdownMenu
            success={false}
            buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
            options={options}
            isSplitButton={false}
            customText={translate('getAssistancePage.onboardingHelp')}
            wrapperStyle={shouldUseNarrowLayout && styles.earlyDiscountButton}
        />
    );
}

export default OnboardingHelpDropdownButton;
