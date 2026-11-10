import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import TextLink from '@components/TextLink';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getTranslationKeyForLimitType} from '@libs/CardUtils';
import {getFormattedAddress} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import type {CardLimitType} from '@src/types/onyx/Card';

import React from 'react';
import {View} from 'react-native';

const defaultPrivatePersonalDetails: PrivatePersonalDetails = {
    addresses: [
        {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: '',
        },
    ],
};

type CardDetailsProps = {
    /** Card number */
    pan?: string;

    /** Card expiration date */
    expiration?: string;

    /** 3 digit code */
    cvv?: string;

    /** Callback to navigate to update address page */
    onUpdateAddressPress?: () => void;

    limitType?: CardLimitType;
    cardHintText?: string;
};

function CardDetails({pan = '', expiration = '', cvv = '', onUpdateAddressPress, cardHintText, limitType}: CardDetailsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const formattedAddress = getFormattedAddress(privatePersonalDetails ?? defaultPrivatePersonalDetails);

    return (
        <View>
            {pan?.length > 0 && (
                <MenuItemField
                    sentryLabel={CONST.SENTRY_LABEL.EXPENSIFY_CARD_PAGE.CARD_NUMBER}
                    name={translate('cardPage.cardDetails.cardNumber')}
                    value={pan}
                    forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                >
                    <MenuItem.Copy value={pan} />
                </MenuItemField>
            )}
            {!!limitType && (
                <MenuItem.Root>
                    <MenuItemField.Row
                        name={translate('workspace.card.issueNewCard.limitType')}
                        value={translate(getTranslationKeyForLimitType(limitType))}
                    />
                    {!!cardHintText && <MenuItem.HelpText message={cardHintText} />}
                </MenuItem.Root>
            )}
            {expiration?.length > 0 && (
                <MenuItemField
                    sentryLabel={CONST.SENTRY_LABEL.EXPENSIFY_CARD_PAGE.CARD_EXPIRATION}
                    name={translate('cardPage.cardDetails.expiration')}
                    value={expiration}
                    forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                >
                    <MenuItem.Copy value={expiration} />
                </MenuItemField>
            )}
            {cvv?.length > 0 && (
                <MenuItemField
                    sentryLabel={CONST.SENTRY_LABEL.EXPENSIFY_CARD_PAGE.CARD_CVV}
                    name={translate('cardPage.cardDetails.cvv')}
                    value={cvv}
                    forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                >
                    <MenuItem.Copy value={cvv} />
                </MenuItemField>
            )}
            {pan?.length > 0 && (
                <>
                    <MenuItemField
                        sentryLabel={CONST.SENTRY_LABEL.EXPENSIFY_CARD_PAGE.CARD_ADDRESS}
                        name={translate('cardPage.cardDetails.address')}
                        value={formattedAddress}
                        forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                    >
                        <MenuItem.Copy value={formattedAddress} />
                    </MenuItemField>
                    <TextLink
                        style={[styles.link, styles.mh5, styles.mb3]}
                        onPress={() => onUpdateAddressPress?.()}
                    >
                        {translate('cardPage.cardDetails.updateAddress')}
                    </TextLink>
                </>
            )}
        </View>
    );
}

export default CardDetails;
