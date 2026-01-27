import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {clearBillingReceiptDetailsErrors, payAndDowngrade} from '@src/libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type BillingItem = {
    key: string;
    value: string;
    isTotal: boolean;
};

function PayAndDowngradePage() {
    const styles = useThemeStyles();

    const {translate} = useLocalize();

    const [billingDetails, metadata] = useOnyx(ONYXKEYS.BILLING_RECEIPT_DETAILS, {canBeMissing: true});
    const prevIsLoading = usePrevious(billingDetails?.isLoading);

    const errorMessage = billingDetails?.errors;

    const items: BillingItem[] = useMemo(() => {
        if (isEmptyObject(billingDetails)) {
            return [];
        }
        const results = [...billingDetails.receiptsWithoutDiscount, ...billingDetails.discounts].map((item) => {
            return {
                key: item.description,
                value: item.formattedAmount,
                isTotal: false,
            };
        });

        results.push({
            key: translate('common.total'),
            value: billingDetails.formattedSubtotal,
            isTotal: true,
        });
        return results;
    }, [billingDetails, translate]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (billingDetails?.isLoading || !prevIsLoading || billingDetails?.errors) {
            return;
        }
        Navigation.dismissModal();
    }, [billingDetails?.isLoading, prevIsLoading, billingDetails?.errors]);

    useEffect(() => {
        clearBillingReceiptDetailsErrors();
    }, []);

    if (isLoadingOnyxValue(metadata)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator
            testID="PayAndDowngradePage"
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView shouldShow={isEmptyObject(billingDetails)}>
                <HeaderWithBackButton title={translate('workspace.payAndDowngrade.title')} />
                <FullPageOfflineBlockingView>
                    <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pt3]}>
                        <Text style={[styles.textHeadlineH1, styles.mb5]}>{translate('workspace.payAndDowngrade.headline')}</Text>
                        <View style={[styles.renderHTML]}>
                            <RenderHTML
                                html={translate('workspace.payAndDowngrade.description1', {
                                    formattedAmount: billingDetails?.formattedSubtotal ?? '',
                                })}
                            />
                        </View>
                        <Text style={[styles.mb5]}>{translate('workspace.payAndDowngrade.description2', billingDetails?.billingMonth ?? '')}</Text>

                        <View style={[styles.borderedContentCard, styles.ph5, styles.pv2, styles.mb5]}>
                            {items.map((item) => (
                                <View
                                    key={item.key}
                                    style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap8, styles.pv3, !item.isTotal ? styles.borderBottom : undefined]}
                                >
                                    {!item.isTotal ? <RenderHTML html={item.key} /> : <Text style={styles.textBold}>{item.key}</Text>}
                                    <Text style={item.isTotal ? styles.textBold : undefined}>{item.value}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={[styles.textLabelSupportingNormal]}>{translate('workspace.payAndDowngrade.subscription')}</Text>
                    </ScrollView>
                    <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                        {!!errorMessage && (
                            <View style={[styles.mb3]}>
                                <FormHelpMessage
                                    isError
                                    message={errorMessage}
                                />
                            </View>
                        )}
                        <Button
                            large
                            danger
                            text={translate('workspace.payAndDowngrade.title')}
                            onPress={payAndDowngrade}
                            pressOnEnter
                            isLoading={billingDetails?.isLoading}
                        />
                    </FixedFooter>
                </FullPageOfflineBlockingView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default PayAndDowngradePage;
