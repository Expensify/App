import React from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
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

    /** Card limit type */
    limitType?: CardLimitType;

    /** Hint text for the card */
    cardHintText?: string;
};

function CardDetails({pan = '', expiration = '', cvv = '', onUpdateAddressPress, cardHintText, limitType}: CardDetailsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);

    return (
        <View>
            {pan?.length > 0 && (
                <MenuItemWithTopDescription
                    description={translate('cardPage.cardDetails.cardNumber')}
                    title={pan}
                    interactive={false}
                    copyValue={pan}
                    copyable
                    forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                />
            )}
            {!!limitType && (
                <MenuItemWithTopDescription
                    description={translate('workspace.card.issueNewCard.limitType')}
                    title={translate(getTranslationKeyForLimitType(limitType))}
                    interactive={false}
                    hintText={cardHintText}
                />
            )}
            {expiration?.length > 0 && (
                <MenuItemWithTopDescription
                    description={translate('cardPage.cardDetails.expiration')}
                    title={expiration}
                    interactive={false}
                    copyable
                    forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                />
            )}
            {cvv?.length > 0 && (
                <MenuItemWithTopDescription
                    description={translate('cardPage.cardDetails.cvv')}
                    title={cvv}
                    interactive={false}
                    copyable
                    forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                />
            )}
            {pan?.length > 0 && (
                <>
                    <MenuItemWithTopDescription
                        description={translate('cardPage.cardDetails.address')}
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        title={getFormattedAddress(privatePersonalDetails || defaultPrivatePersonalDetails)}
                        interactive={false}
                        copyable
                        forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                    />
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
