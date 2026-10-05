import Button from '@components/Button';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {openSupportTicket} from '@userActions/Report';

import CONST from '@src/CONST';

import React, {useState} from 'react';
import {View} from 'react-native';

type SupportTicketResolvedFooterProps = {
    reportID: string;
    isOffline: boolean;
};

function SupportTicketResolvedFooter({reportID, isOffline}: SupportTicketResolvedFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isReopening, setIsReopening] = useState(false);

    const reopenTicket = () => {
        setIsReopening(true);
        openSupportTicket(reportID)
            .catch(() => undefined)
            .finally(() => setIsReopening(false));
    };

    return (
        <View style={[styles.chatFooter, styles.ph5, styles.pv3]}>
            <Text style={[styles.textLabelSupporting, styles.mb3]}>{translate('supportTicket.resolved')}</Text>
            <Button
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                isDisabled={isOffline}
                isLoading={isReopening}
                onPress={reopenTicket}
            >
                <Button.Text>{translate('supportTicket.reopenTicket')}</Button.Text>
            </Button>
        </View>
    );
}

export default SupportTicketResolvedFooter;
