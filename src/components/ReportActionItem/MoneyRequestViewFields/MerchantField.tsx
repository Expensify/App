/** Displays the expense merchant with editing, copy and external search actions. */
import Icon from '@components/Icon';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
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
        <EditableField.Root
            pendingAction={pendingAction}
            onPress={canEdit ? onPress : undefined}
            shouldAllowTextSelection={!!copyValue}
        >
            <MenuItem.Row>
                <MenuItemField.Content name={translate('common.merchant')}>
                    {!!title && (
                        <MenuItem.FieldValue
                            numberOfLines={0}
                            isSelectable={!!copyValue}
                        >
                            {title}
                        </MenuItem.FieldValue>
                    )}
                </MenuItemField.Content>
                <EditableField.Actions>
                    {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    {!canEdit && !!copyValue && <MenuItem.Copy value={copyValue} />}
                </EditableField.Actions>
            </MenuItem.Row>
            {!!googleSearchMerchant && <GoogleMerchantSearchLink merchant={googleSearchMerchant} />}
            {!!errorText && (
                <MenuItem.HelpText
                    isError
                    message={errorText}
                />
            )}
        </EditableField.Root>
    );
}

export default MerchantField;
