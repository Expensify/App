import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import type {View} from 'react-native';
import PersonalInfo from './PersonalInfo/PersonalInfo';
import VerifyIdentity from './VerifyIdentity/VerifyIdentity';

type RequestorStepProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** If we should show Onfido flow */
    shouldShowOnfido: boolean;
};

function RequestorStep({shouldShowOnfido, onBackButtonPress}: RequestorStepProps, ref: ForwardedRef<View>) {
    if (shouldShowOnfido) {
        return <VerifyIdentity onBackButtonPress={onBackButtonPress} />;
    }

    return (
        <PersonalInfo
            ref={ref}
            onBackButtonPress={onBackButtonPress}
        />
    );
}

RequestorStep.displayName = 'RequestorStep';

export default forwardRef(RequestorStep);
