import React from "react";
import {View} from 'react-native';
import OAuthLink from "../../components/PlaidOAuth/oauth";
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';


const PlaidOAuthPage = (props) => {
    return (
        <View>
            <OAuthLink />
        </View>
    );
}

PlaidOAuthPage.displayName = 'PlaidOAuthPage';
export default withLocalize(PlaidOAuthPage);
