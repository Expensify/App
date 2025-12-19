import React from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import type {ExpensifyCardSettings} from '@src/types/onyx';

type WorkspaceCardListHeaderProps = {
    /** Card settings */
    cardSettings: ExpensifyCardSettings | undefined;
};

function WorkspaceCardListHeader({cardSettings}: WorkspaceCardListHeaderProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isMediumScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const isLessThanMediumScreen = isMediumScreenWidth || isSmallScreenWidth;

    const errorMessage = getLatestErrorMessage(cardSettings) ?? '';

    return (
        <View style={styles.appBG}>
            {!!errorMessage && (
                <View style={[styles.mh5, styles.pr4, styles.mt2]}>
                    <FormHelpMessage
                        isError
                        message={errorMessage}
                    />
                </View>
            )}
            <View style={[styles.flexRow, styles.mh5, styles.gap2, styles.p4, isLessThanMediumScreen ? styles.mt3 : styles.mt5]}>
                <View style={[styles.flexRow, styles.flex4, styles.gap2, styles.alignItemsCenter]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.textMicroSupporting, styles.lh16]}
                    >
                        {translate('workspace.expensifyCard.name')}
                    </Text>
                </View>
                {!shouldUseNarrowLayout && (
                    <View style={[styles.flexRow, styles.gap2, styles.flex1, styles.alignItemsCenter, styles.justifyContentStart]}>
                        <Text
                            numberOfLines={1}
                            style={[styles.textMicroSupporting, styles.lh16]}
                        >
                            {translate('common.type')}
                        </Text>
                    </View>
                )}
                <View
                    style={[
                        styles.flexRow,
                        styles.gap2,
                        shouldUseNarrowLayout ? styles.flex2 : styles.flex1,
                        styles.alignItemsCenter,
                        shouldUseNarrowLayout ? styles.justifyContentCenter : styles.justifyContentStart,
                    ]}
                >
                    <Text
                        numberOfLines={1}
                        style={[styles.textMicroSupporting, styles.lh16]}
                    >
                        {translate('workspace.expensifyCard.lastFour')}
                    </Text>
                </View>
                <View style={[styles.flexRow, shouldUseNarrowLayout ? styles.flex3 : styles.flex1, styles.gap2, styles.alignItemsCenter, styles.justifyContentEnd, styles.mr8]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.textMicroSupporting, styles.lh16]}
                    >
                        {translate('workspace.expensifyCard.limit')}
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default WorkspaceCardListHeader;
