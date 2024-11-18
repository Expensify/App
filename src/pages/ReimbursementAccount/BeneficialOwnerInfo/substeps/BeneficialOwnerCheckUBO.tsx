import React from 'react';
import YesNoStep from '@components/SubStepForms/YesNoStep';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type BeneficialOwnerCheckUBOProps = {
    /** The title of the question */
    title: string;

    /** The default value of the radio button */
    defaultValue: boolean;

    /** Callback when the value is selected */
    onSelectedValue: (value: boolean) => void;
};

function BeneficialOwnerCheckUBO({title, onSelectedValue, defaultValue}: BeneficialOwnerCheckUBOProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <YesNoStep
            title={title}
            description={translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}
            defaultValue={defaultValue}
            onSelectedValue={onSelectedValue}
            submitButtonStyles={[styles.mb0]}
        />
    );
}

BeneficialOwnerCheckUBO.displayName = 'BeneficialOwnerCheckUBO';

export default BeneficialOwnerCheckUBO;
