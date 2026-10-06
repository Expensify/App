// Displays the merchant and lets users look up the original card merchant when available.
import Icon from '@components/Icon';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
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

type MerchantFieldProps = Pick<OfflineWithFeedbackProps, 'pendingAction'> &
    Pick<MenuItemProps, 'title' | 'errorText' | 'copyValue' | 'onPress'> & {
        canEdit: boolean;
        /** Original card merchant to search for. Omit while scanning or for non-card expenses. */
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
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <MenuItemWithTopDescription
                description={translate('common.merchant')}
                title={title}
                interactive={canEdit}
                shouldShowRightIcon={canEdit}
                titleStyle={styles.flex1}
                onPress={onPress}
                wrapperStyle={[styles.taskDescriptionMenuItem]}
                furtherDetailsComponent={googleSearchMerchant ? <GoogleMerchantSearchLink merchant={googleSearchMerchant} /> : undefined}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
                numberOfLinesTitle={0}
                copyValue={copyValue}
                copyable={!!copyValue}
            />
        </OfflineWithFeedback>
    );
}

export default MerchantField;
