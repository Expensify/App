import React, {useLayoutEffect, useState, useEffect} from 'react';
import {View} from 'react-native';
import AppleSignIn from '../../components/SignInButtons/AppleSignIn';

const config = {
    clientId: 'com.infinitered.expensify.test',
    scope: 'name email',
    redirectURI: 'https://exptest.ngrok.io/appleauth',
    state: '',
    nonce: '',
    usePopup: true,
};

function AppleSignInScript({style = {}}) {
    return <View style={{
                                flexDirection: 'row',

                                width: '100%',
                                justifyContent: 'center',
                            }}
                            >
    <AppleSignIn/></View>;
}

export default AppleSignInScript;
