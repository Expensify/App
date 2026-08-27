import Icon from '@components/Icon';
import Text from '@components/Text';

import {View} from 'react-native';

import type {MoneyRequestViewData} from '../useMoneyRequestViewData';

type PerDiemOutOfPolicyBannerProps = {
    data: MoneyRequestViewData;
};

function PerDiemOutOfPolicyBanner({data}: PerDiemOutOfPolicyBannerProps) {
    return (
        <View style={[data.styles.flexRow, data.styles.alignItemsCenter, data.styles.gap1, data.styles.mh4, data.styles.mb2]}>
            <Icon
                src={data.icons.DotIndicator}
                fill={data.theme.danger}
                height={16}
                width={16}
            />
            <Text
                numberOfLines={1}
                style={[data.StyleUtils.getDotIndicatorTextStyles(true), data.styles.pre, data.styles.flexShrink1]}
            >
                {data.translate('violations.customUnitOutOfPolicy')}
            </Text>
        </View>
    );
}

PerDiemOutOfPolicyBanner.displayName = 'PerDiemOutOfPolicyBanner';

export default PerDiemOutOfPolicyBanner;
