import React from 'react';
import {Linking} from 'react-native';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';

function SaveWithExpensifyButton() {
    const {translate} = useLocalize();

    const onLinkPress = () => {
        Linking.openURL(CONST.SAVE_WITH_EXPENSIFY_URL);
    };

    return (
        <Button
            small
            text={translate('subscription.yourPlan.saveWithExpensifyButton')}
            onPress={onLinkPress}
        />
    );
}

export default SaveWithExpensifyButton;
