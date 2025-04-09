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

    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID});
    if (!reportID || !accountID) {
        return;
    }

    const abTestCtaText = (): string => {
        const availableCTAs = [translate('aiSales.callSupport'), translate('aiSales.getHelp'), translate('aiSales.talkNow'), translate('aiSales.talkWithSales')];
        return availableCTAs.at(accountID % availableCTAs.length) ?? translate('aiSales.talkWithSales');
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
            style={shouldUseNarrowLayout && [styles.flex1]}
            icon={talkToSalesIcon()}
            isLoading={talkToAISales?.isLoading}
        />
    );
}

export default TalkToSalesButton;
