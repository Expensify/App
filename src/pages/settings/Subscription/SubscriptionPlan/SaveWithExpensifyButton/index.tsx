import React from 'react';
import {Linking} from 'react-native';
import Button from '@components/ButtonComposed';
import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import React from 'react';
import {Linking} from 'react-native';

function SaveWithExpensifyButton() {
    const {translate} = useLocalize();

    const onLinkPress = () => {
        Linking.openURL(CONST.SAVE_WITH_EXPENSIFY_URL);
    };

    return (
        <Button
            size={CONST.BUTTON_SIZE.SMALL}
            accessibilityLabel={`${translate('subscription.yourPlan.saveWithExpensifyButton')}, ${translate('subscription.yourPlan.saveWithExpensifyTitle')}`}
            onPress={onLinkPress}
            sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.SAVE_WITH_EXPENSIFY}
        >
            <Button.Text>{translate('subscription.yourPlan.saveWithExpensifyButton')}</Button.Text>
        </Button>
    );
}

export default SaveWithExpensifyButton;
