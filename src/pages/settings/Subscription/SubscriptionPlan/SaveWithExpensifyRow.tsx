import Icon from '@components/Icon';
import Text from '@components/Text';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

import SaveWithExpensifyButton from './SaveWithExpensifyButton';

function SaveWithExpensifyRow() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {cardPaddingHorizontal} = useLayoutSpacing();
    const illustrations = useMemoizedLazyIllustrations(['HandCard']);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, cardPaddingHorizontal, styles.pv3]}>
            <Icon
                src={illustrations.HandCard}
                width={variables.iconHeader}
                height={variables.iconHeader}
                additionalStyles={styles.mr2}
            />
            <View style={[styles.flexColumn, styles.justifyContentCenter, styles.flex1, styles.mr2]}>
                <Text style={[styles.headerText, styles.mt2]}>{translate('subscription.yourPlan.saveWithExpensifyTitle')}</Text>
                <Text style={[styles.textLabelSupporting, styles.mb2]}>{translate('subscription.yourPlan.saveWithExpensifyDescription')}</Text>
            </View>
            <SaveWithExpensifyButton />
        </View>
    );
}

export default SaveWithExpensifyRow;
