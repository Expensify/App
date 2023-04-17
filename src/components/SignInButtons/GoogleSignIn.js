import React from 'react';
import {View} from 'react-native';

const GoogleSignIn = () => {
    console.log('HELLO FROM GOOGLESIGNIN');

    React.useEffect(() => {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: '921154746561-gpsoaqgqfuqrfsjdf8l7vohfkfj7b9up.apps.googleusercontent.com',
                callback: handleCredentialResponse,
            });
            google.accounts.id.renderButton(
                document.getElementById('buttonDiv'),
                {
                    theme: 'outline',
                    size: 'large',
                    type: 'icon',
                    shape: 'circle',
                }, // customization attributes
            );
        }
    }, []);

    const handleCredentialResponse = (response) => {
        onCredentialResponse(response);
    };

    return (
        <View style={{height: 60, width: 60, backgroundColor: 'green'}}>
            <div id="buttonDiv" />
        </View>
    );
};

export default GoogleSignIn;
