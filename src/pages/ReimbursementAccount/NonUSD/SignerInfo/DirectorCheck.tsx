import React from 'react';
import YesNoStep from '@components/SubStepForms/YesNoStep';
import useLocalize from '@hooks/useLocalize';

type DirectorCheckProps = {
    /** The title of the question */
    title: string;

    /** The default value of the radio button */
    defaultValue: boolean;

    /** Callback when the value is selected */
    onSelectedValue: (value: boolean) => void;
};

function DirectorCheck({title, onSelectedValue, defaultValue}: DirectorCheckProps) {
    const {translate} = useLocalize();

    return (
        <YesNoStep
            title={title}
            description={translate('signerInfoStep.regulationRequiresUs')}
            defaultValue={defaultValue}
            onSelectedValue={onSelectedValue}
        />
    );
}

DirectorCheck.displayName = 'DirectorCheck';

export default DirectorCheck;
