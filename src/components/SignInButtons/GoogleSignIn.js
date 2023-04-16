import React from 'react';
import {View} from 'react-native';

const GoogleSignIn = () => (
    <View style={{height: 40, width: 40, backgroundColor: 'yellow'}}>
        <div
            id="g_id_onload"
            data-client_id="CLIENTID"
            data-context="signin"
            data-ux_mode="popup"
            data-login_uri="URI"
            data-auto_prompt="false"
        />

        <div
            className="g_id_signin"
            data-type="icon"
            data-shape="circle"
            data-theme="outline"
            data-text="signin_with"
            data-size="large"
        />
    </View>
);

export default GoogleSignIn;
