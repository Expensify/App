import React from 'react';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';

function CardSectionDataEmpty() {
    const {translate} = useLocalize();

    return (
        <Button
            text={translate('subscription.cardSection.addCardButton')}
            onPress={() => {}} // TODO: update with navigation to "add card" screen (https://github.com/Expensify/App/issues/38621)
            success
            large
        />
    );
}

CardSectionDataEmpty.displayName = 'CardSectionDataEmpty';

export default CardSectionDataEmpty;
