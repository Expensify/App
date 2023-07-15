import React, {useEffect, useState} from 'react';
import {Text, View} from "react-native";
import CodesStep from "./Steps/CodesStep";
import DisableStep from "./Steps/DisableStep";
import IsEnabledStep from "./Steps/IsEnabledStep";
import VerifyStep from "./Steps/VerifyStep";
import SuccessStep from "./Steps/SuccessStep";
import compose from "../../../../libs/compose";
import withLocalize from "../../../../components/withLocalize";

import {withOnyx} from "react-native-onyx";
import ONYXKEYS from "../../../../ONYXKEYS";

const STEPS = {
    CODES: 'CODES',
    VERIFY: 'VERIFY',
    SUCCESS: 'SUCCESS',
    IS_ENABLED: 'IS_ENABLED',
    DISABLE: 'DISABLE'
}

// requiresTwoFactorAuth
function TwoFactorAuthPage(props) {
    const [step, setStep] = useState(STEPS.CODES);

    useEffect(() => {
        if (props.account.requiresTwoFactorAuth) {
            setStep(STEPS.IS_ENABLED);
        } else {
            setStep(STEPS.CODES);
        }
        return () => console.log('unmount')
    }, []);



    function handleSetStep(stepToSet) {
        return () => setStep(stepToSet);
    }

    const renderStep = () => {
        switch (step) {
            case STEPS.CODES:
                return <CodesStep setStep={handleSetStep(STEPS.VERIFY)}/>;
            case STEPS.VERIFY:
                return <VerifyStep setStep={handleSetStep(STEPS.SUCCESS)}/>;
            case STEPS.SUCCESS:
                return <SuccessStep/>;
            case STEPS.IS_ENABLED:
                return <IsEnabledStep setStep={handleSetStep(STEPS.DISABLE)}/>;
            case STEPS.DISABLE:
                return <DisableStep />;
        }
    }

    return (
        <>
            {renderStep()}
        </>
    );
};


export default compose(
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(TwoFactorAuthPage);
