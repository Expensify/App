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

// requiresTwoFactorAuth
function TwoFactorAuthPage(props) {
    const [step, setStep] = useState(props.account.requiresTwoFactorAuth ? 3 : 0);

    // useEffect(() => {
    //
    //     return () => console.log('unmount')
    // }, []);

    const renderStep = () => {
        switch (step) {
            case 0:
                return <CodesStep setStep={setStep}/>;
            case 1:
                return <VerifyStep setStep={setStep}/>;
            case 2:
                return <SuccessStep/>;
            case 3:
                return <IsEnabledStep setStep={setStep}/>;
            case 4:
                return <DisableStep setStep={setStep}/>;
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
