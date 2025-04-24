import React from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import {Close, Phone} from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {initializeOpenAIRealtime, stopConnection} from '@libs/actions/OpenAI';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type TalkToSalesButtonProps = {
    reportID: string | undefined;
    shouldUseNarrowLayout: boolean;
};

function TalkToSalesButton({shouldUseNarrowLayout, reportID}: TalkToSalesButtonProps) {
    const {translate} = useLocalize();
    const [talkToAISales] = useOnyx(ONYXKEYS.TALK_TO_AI_SALES);
    const styles = useThemeStyles();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID});

    if (!reportID || !accountID) {
        return;
    }

    // Only show for micro companies (1-10 employees)
    if (introSelected?.companySize !== CONST.ONBOARDING_COMPANY_SIZE.MICRO) {
        return null;
    }

    const abTestCtaText = (): string => {
        const availableCTAs = [translate('aiSales.getHelp'), translate('aiSales.talkToSales'), translate('aiSales.talkToConcierge')];
        return availableCTAs.at(accountID % availableCTAs.length) ?? translate('aiSales.talkToSales');
    };

    const talkToSalesIcon = () => {
        if (talkToAISales?.isLoading) {
            return undefined;
        }
        if (talkToAISales?.isTalkingToAISales) {
            return Close;
        }
        return Phone;
    };

    return (
        <Button
            text={talkToAISales?.isTalkingToAISales ? translate('aiSales.hangUp') : abTestCtaText()}
            onPress={() => {
                if (talkToAISales?.isTalkingToAISales) {
                    stopConnection();
                    return;
                }

                initializeOpenAIRealtime(Number(reportID) ?? CONST.DEFAULT_NUMBER_ID, abTestCtaText());
            }}
            style={shouldUseNarrowLayout && styles.earlyDiscountButton}
            icon={talkToSalesIcon()}
            // Ensure that a button with an icon displays an ellipsis when its content overflows https://github.com/Expensify/App/issues/58974#issuecomment-2794297554
            iconWrapperStyles={[styles.w100]}
            isContentCentered
            isLoading={talkToAISales?.isLoading}
        />
    );
}

export default TalkToSalesButton;
