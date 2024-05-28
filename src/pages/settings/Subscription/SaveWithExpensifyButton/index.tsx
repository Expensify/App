import React from 'react';
import {Linking} from 'react-native';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';

function SaveWithExpensifyButton() {
    const {translate} = useLocalize();

    const onLinkPress = () => {
        Linking.openURL('https://use.expensify.com/savings-calculator');
    };

    return (
        <Button
            text={translate('subscription.yourPlan.saveWithExpensifyButton')}
            onPress={onLinkPress}
            medium
        />
    );
}

export default SaveWithExpensifyButton;
