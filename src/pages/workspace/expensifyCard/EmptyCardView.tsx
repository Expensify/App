import React from 'react';
import {View} from 'react-native';
import EmptyStateComponent from '@components/EmptyStateComponent';
import type {EmptyStateButton} from '@components/EmptyStateComponent/types';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useEmptyViewHeaderHeight from '@hooks/useEmptyViewHeaderHeight';
import useExpensifyCardUkEuSupported from '@hooks/useExpensifyCardUkEuSupported';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

type EmptyCardViewProps = {
    /** Whether the bank account is verified */
    isBankAccountVerified: boolean;
    /** ID of the current policy */
    policyID?: string;

    /** Buttons to display */
    buttons: EmptyStateButton[] | undefined;
};

function EmptyCardView({isBankAccountVerified, policyID, buttons}: EmptyCardViewProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isUkEuCurrencySupported = useExpensifyCardUkEuSupported(policyID);
    const lazyIllustrations = useMemoizedLazyIllustrations(['ExpensifyCardCoins', 'CompanyCardsPendingState']);

    const headerHeight = useEmptyViewHeaderHeight(shouldUseNarrowLayout, isBankAccountVerified);

    return (
        <ScrollView
            contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}
            addBottomSafeAreaPadding
        >
            <View style={[{minHeight: windowHeight - headerHeight}, styles.pt5]}>
                <EmptyStateComponent
                    headerMedia={isBankAccountVerified ? lazyIllustrations.ExpensifyCardCoins : lazyIllustrations.CompanyCardsPendingState}
                    headerStyles={styles.emptyStateCardIllustrationContainer}
                    title={translate(`workspace.expensifyCard.${isBankAccountVerified ? 'issueAndManageCards' : 'verificationInProgress'}`)}
                    subtitle={translate(`workspace.expensifyCard.${isBankAccountVerified ? 'getStartedIssuing' : 'verifyingTheDetails'}`)}
                    headerContentStyles={isBankAccountVerified ? styles.expensifyCardEmptyIllustration : styles.pendingStateCardIllustration}
                    minModalHeight={isBankAccountVerified ? 500 : 400}
                    buttons={buttons}
                />
            </View>
            <Text style={[styles.textMicroSupporting, styles.m5]}>
                {translate(isUkEuCurrencySupported ? 'workspace.expensifyCard.euUkDisclaimer' : 'workspace.expensifyCard.disclaimer')}
            </Text>
        </ScrollView>
    );
}

export default EmptyCardView;
