import React from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFormattedAddress} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PrivatePersonalDetails} from '@src/types/onyx';

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
};

function CardDetails({pan = '', expiration = '', cvv = '', onUpdateAddressPress}: CardDetailsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});

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
