import React from 'react';
import OutcomeScreenBase from '@components/MultifactorAuthentication/components/OutcomeScreen/OutcomeScreenBase';
import useLocalize from '@hooks/useLocalize';
import variables from '@styles/variables';

function ChangePINATMRequirementPage() {
    const {translate} = useLocalize();

    return (
        <OutcomeScreenBase
            headerTitle={translate('cardPage.changePINATMRequirement.title')}
            illustration="MagicCode"
            iconWidth={variables.modalTopIconWidth}
            iconHeight={variables.modalTopIconHeight}
            title={translate('cardPage.changePINATMRequirement.heading')}
            subtitle={translate('cardPage.changePINATMRequirement.description')}
        />
    );
}

ChangePINATMRequirementPage.displayName = 'ChangePINATMRequirementPage';

export default ChangePINATMRequirementPage;
