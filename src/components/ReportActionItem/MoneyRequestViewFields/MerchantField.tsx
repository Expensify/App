import Icon from '@components/Icon';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItem from '@components/MenuItem';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {openExternalLink} from '@libs/actions/Link';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

import EditableField from './EditableField';

type MerchantFieldProps = Pick<OfflineWithFeedbackProps, 'pendingAction'> &
    Pick<MenuItemProps, 'title' | 'errorText' | 'copyValue' | 'onPress'> & {
        /** A read-only merchant can still offer copy and search actions. */
        canEdit: boolean;

        /** Original card merchant for the search link. Omit to hide the link. */
        googleSearchMerchant?: string;
    };

function GoogleMerchantSearchLink({merchant}: {merchant: string}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['NewWindow']);

    return (
        <PressableWithoutFeedback
            accessibilityLabel={translate('common.searchOnGoogle', {merchant})}
            role={CONST.ROLE.BUTTON}
            sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.GOOGLE_MERCHANT_SEARCH_BUTTON}
            onPress={(event) => {
                event?.stopPropagation();
                openExternalLink(`${CONST.GOOGLE_SEARCH_URL}${encodeURIComponent(merchant)}`);
            }}
            style={[styles.flexRow, styles.alignItemsCenter, styles.mt1, styles.alignSelfStart]}
        >
            <Text style={styles.textLabelSupporting}>{translate('common.googleThisMerchant', {merchant})}</Text>
            <Icon
                src={icons.NewWindow}
                height={variables.iconSizeExtraSmall}
                width={variables.iconSizeExtraSmall}
                fill={theme.textSupporting}
                additionalStyles={styles.ml1}
            />
        </PressableWithoutFeedback>
    );
}

function MerchantField({pendingAction, title, errorText, copyValue, onPress, canEdit, googleSearchMerchant}: MerchantFieldProps) {
    const {translate} = useLocalize();

    return (
        <EditableField
            pendingAction={pendingAction}
            name={translate('common.merchant')}
            value={title}
            numberOfLinesValue={0}
            onPress={canEdit ? onPress : undefined}
            isValueSelectable={!!copyValue}
            error={errorText}
            footer={googleSearchMerchant ? <GoogleMerchantSearchLink merchant={googleSearchMerchant} /> : undefined}
        >
            {!canEdit && !!copyValue && <MenuItem.Copy value={copyValue} />}
        </EditableField>
    );
}

export default MerchantField;
