import React from 'react';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {openExternalLink} from '@libs/actions/Link';
import {initializeOpenAIRealtime, stopConnection} from '@libs/actions/OpenAI';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption, OnboardingHelpType} from './ButtonWithDropdownMenu/types';
import {Close, Monitor, Phone} from './Icon/Expensicons';

type TalkToSalesButtonProps = {
    reportID: string | undefined;
    shouldUseNarrowLayout: boolean;
    shouldShowTalkToSales: boolean;
    shouldShowRegisterForWebinar: boolean;
};

function OnboardingHelpDropdownButton({reportID, shouldUseNarrowLayout, shouldShowTalkToSales, shouldShowRegisterForWebinar}: TalkToSalesButtonProps) {
    const {translate} = useLocalize();
    const [talkToAISales] = useOnyx(ONYXKEYS.TALK_TO_AI_SALES, {canBeMissing: false});
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID, canBeMissing: false});
    const styles = useThemeStyles();

    if (!reportID || !accountID) {
        return null;
    }

    const abTestCtaText = (): string => {
        const availableCTAs = [translate('aiSales.getHelp'), translate('aiSales.talkToSales'), translate('aiSales.talkToConcierge')];
        return availableCTAs.at(accountID % availableCTAs.length) ?? translate('aiSales.talkToSales');
    };

    const talkToSalesOption = {
        talkToSaleText: talkToAISales?.isTalkingToAISales ? translate('aiSales.hangUp') : abTestCtaText(),
        talkToSalesIcon: talkToAISales?.isTalkingToAISales ? Close : Phone,
        abTestCtaText: abTestCtaText(),
    };

    const options: Array<DropdownOption<OnboardingHelpType>> = [];

    if (shouldShowTalkToSales) {
        options.push({
            text: talkToSalesOption.talkToSaleText,
            icon: talkToSalesOption.talkToSalesIcon,
            value: CONST.ONBOARDING_HELP.TALK_TO_SALES,
            onSelected: () => {
                if (talkToAISales?.isTalkingToAISales) {
                    stopConnection();
                } else {
                    initializeOpenAIRealtime(Number(reportID), talkToSalesOption.abTestCtaText);
                }
            },
        });
    }

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
            isLoading={talkToAISales?.isLoading}
            style={shouldUseNarrowLayout && styles.earlyDiscountButton}
        />
    );
}

export default OnboardingHelpDropdownButton;
