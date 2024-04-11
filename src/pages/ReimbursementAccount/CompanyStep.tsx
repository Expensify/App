import React from 'react';
import BusinessInfo from './BusinessInfo/BusinessInfo';

type CompanyStepProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;
};

function CompanyStep({onBackButtonPress}: CompanyStepProps) {
    return <BusinessInfo onBackButtonPress={onBackButtonPress} />;
}

CompanyStep.displayName = 'CompanyStep';

export default CompanyStep;
