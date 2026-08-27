import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';

import {openExternalLink} from '@libs/actions/Link';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {MoneyRequestViewData} from '../useMoneyRequestViewData';

type MerchantFieldProps = {
    data: MoneyRequestViewData;
};

function MerchantField({data}: MerchantFieldProps) {
    return (
        <OfflineWithFeedback pendingAction={data.getPendingFieldAction('merchant')}>
            <MenuItemWithTopDescription
                description={data.translate('common.merchant')}
                title={data.updatedMerchantTitle}
                interactive={data.canEditMerchant}
                shouldShowRightIcon={data.canEditMerchant}
                titleStyle={data.styles.flex1}
                onPress={data.onMerchantPress}
                wrapperStyle={[data.styles.taskDescriptionMenuItem]}
                furtherDetailsComponent={
                    data.shouldShowGoogleMerchantSearchLink ? (
                        <PressableWithoutFeedback
                            accessibilityLabel={data.translate('common.searchOnGoogle', {
                                merchant: data.originalMerchantForGoogleSearch,
                            })}
                            role={CONST.ROLE.BUTTON}
                            sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.GOOGLE_MERCHANT_SEARCH_BUTTON}
                            onPress={(event) => {
                                event?.stopPropagation();
                                openExternalLink(`${CONST.GOOGLE_SEARCH_URL}${encodeURIComponent(data.originalMerchantForGoogleSearch)}`);
                            }}
                            style={[data.styles.flexRow, data.styles.alignItemsCenter, data.styles.mt1, data.styles.alignSelfStart]}
                        >
                            <Text style={data.styles.textLabelSupporting}>
                                {data.translate('common.googleThisMerchant', {
                                    merchant: data.originalMerchantForGoogleSearch,
                                })}
                            </Text>
                            <Icon
                                src={data.icons.NewWindow}
                                height={variables.iconSizeExtraSmall}
                                width={variables.iconSizeExtraSmall}
                                fill={data.theme.textSupporting}
                                additionalStyles={data.styles.ml1}
                            />
                        </PressableWithoutFeedback>
                    ) : undefined
                }
                brickRoadIndicator={data.getErrorForField('merchant') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={data.getErrorForField('merchant')}
                numberOfLinesTitle={0}
                copyValue={data.merchantCopyValue}
                copyable={!!data.merchantCopyValue}
            />
        </OfflineWithFeedback>
    );
}

MerchantField.displayName = 'MerchantField';

export default MerchantField;
