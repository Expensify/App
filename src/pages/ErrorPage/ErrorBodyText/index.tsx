import React from 'react';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useActionsLocalize} from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function ErrorBodyText() {
    const styles = useThemeStyles();
    const {translate} = useActionsLocalize();

    return (
        <Text>
            {`${translate('genericErrorPage.body.helpTextMobile')} `}
            <TextLink
                href={CONST.NEW_EXPENSIFY_URL}
                style={[styles.link]}
            >
                {translate('genericErrorPage.body.helpTextWeb')}
            </TextLink>
        </Text>
    );
}

export default ErrorBodyText;
