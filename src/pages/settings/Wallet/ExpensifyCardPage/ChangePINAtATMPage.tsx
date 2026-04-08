import React from 'react';
import OutcomeScreenBase from '@components/MultifactorAuthentication/components/OutcomeScreen/OutcomeScreenBase';
import useLocalize from '@hooks/useLocalize';
import variables from '@styles/variables';

function ChangePINAtATMPage() {
    const {translate} = useLocalize();

    return (
        <OutcomeScreenBase
            headerTitle={translate('cardPage.changePin')}
            illustration="MagicCode"
            iconWidth={variables.modalTopIconWidth}
            iconHeight={variables.modalTopIconHeight}
            title={translate('cardPage.changePinAtATM')}
            subtitle={translate('cardPage.changePinAtATMDescription')}
        />
    );
}

ChangePINAtATMPage.displayName = 'ChangePINAtATMPage';

export default ChangePINAtATMPage;
