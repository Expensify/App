import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {openSupportTicket} from '@userActions/Report';

import CONST from '@src/CONST';

import React, {useState} from 'react';

import Banner from './Banner';
import Button from './Button';
import Checkbox from './Checkbox';
import Text from './Text';

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
        <Banner
            containerStyles={styles.chatFooterBanner}
            content={
                <>
                    <Checkbox
                        isChecked
                        disabled
                        onPress={() => undefined}
                        accessibilityLabel={translate('supportTicket.resolved')}
                        accessible={false}
                        style={styles.mr3}
                    />
                    <Text style={[styles.textLabel, styles.flex1]}>{translate('supportTicket.resolved')}</Text>
                </>
            }
        >
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                isDisabled={isOffline}
                isLoading={isReopening}
                onPress={reopenTicket}
            >
                <Button.Text>{translate('supportTicket.reopenTicket')}</Button.Text>
            </Button>
        </Banner>
    );
}

export default SupportTicketResolvedFooter;
