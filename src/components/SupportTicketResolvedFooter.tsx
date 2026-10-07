import useLocalize from '@hooks/useLocalize';
import useOpenConciergeAnywhere from '@hooks/useOpenConciergeAnywhere';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';

import {isNoSupportRepAvailableResponse, openSupportTicket} from '@userActions/Report';

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
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {openConciergeAnywhere} = useOpenConciergeAnywhere();
    const [isReopening, setIsReopening] = useState(false);

    const reopenTicket = () => {
        setIsReopening(true);
        openSupportTicket(reportID)
            .then((response) => {
                if (!isNoSupportRepAvailableResponse(response)) {
                    return;
                }

                Growl.error(translate('supportTicket.noSupportRepAvailable'));
                Navigation.goBack(undefined, {afterTransition: () => openConciergeAnywhere({forceConcierge: true})});
            })
            .catch(() => undefined)
            .finally(() => setIsReopening(false));
    };

    return (
        <Banner
            containerStyles={[styles.chatFooterBanner, styles.p3]}
            content={
                <>
                    <Checkbox
                        isChecked
                        onPress={() => undefined}
                        accessibilityLabel={translate('supportTicket.resolved')}
                        accessible={false}
                        tabIndex={-1}
                        style={[styles.mr3, styles.cursorDisabled]}
                        containerStyle={StyleUtils.getBackgroundAndBorderStyle(theme.placeholderText)}
                    />
                    <Text style={[styles.textNormal, styles.flex1]}>{translate('supportTicket.resolved')}</Text>
                </>
            }
        >
            <Button
                size={CONST.BUTTON_SIZE.MEDIUM}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                isDisabled={isOffline}
                isLoading={isReopening}
                onPress={reopenTicket}
            >
                <Button.Text style={styles.textNormal}>{translate('supportTicket.reopenTicket')}</Button.Text>
            </Button>
        </Banner>
    );
}

export default SupportTicketResolvedFooter;
