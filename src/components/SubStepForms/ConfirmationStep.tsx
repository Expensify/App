import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import CONST from '@src/CONST';

type SummaryItem = {
    description: string;
    title: string;
    shouldShowRightIcon: boolean;
    onPress: () => void;
};

type ConfirmationStepProps = SubStepProps &
    ForwardedFSClassProps & {
        /** The title of the step */
        pageTitle: string;

        /** The summary items to display */
        summaryItems: SummaryItem[];

        /** Whether show additional section with Onfido terms etc. */
        showOnfidoLinks: boolean;

        /** The title of the Onfido section */
        onfidoLinksTitle?: string;

        /** Whether the data is loading */
        isLoading?: boolean;

        /** The error message to display */
        error?: string;

        /** Whether to apply safe area padding bottom */
        shouldApplySafeAreaPaddingBottom?: boolean;
    };

function ConfirmationStep({
    pageTitle,
    summaryItems,
    showOnfidoLinks,
    onfidoLinksTitle,
    isLoading,
    error,
    onNext,
    shouldApplySafeAreaPaddingBottom = true,
    forwardedFSClass,
}: ConfirmationStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const {paddingBottom: safeAreaInsetPaddingBottom} = useSafeAreaPaddings();

    return (
        <ScrollView
            style={styles.flex1}
            contentContainerStyle={[styles.flexGrow1, shouldApplySafeAreaPaddingBottom && {paddingBottom: safeAreaInsetPaddingBottom + styles.pb5.paddingBottom}]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{pageTitle}</Text>
            {summaryItems.map(({description, title, shouldShowRightIcon, onPress}) => (
                <MenuItemWithTopDescription
                    key={`${title}_${description}`}
                    description={description}
                    title={title}
                    shouldShowRightIcon={shouldShowRightIcon}
                    onPress={onPress}
                    forwardedFSClass={forwardedFSClass}
                />
            ))}

            {showOnfidoLinks && (
                <Text style={[styles.mt3, styles.ph5, styles.textMicroSupporting]}>
                    {onfidoLinksTitle}
                    <TextLink
                        href={CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}
                        style={[styles.textMicro]}
                    >
                        {translate('onfidoStep.facialScan')}
                    </TextLink>
                    {', '}
                    <TextLink
                        href={CONST.ONFIDO_PRIVACY_POLICY_URL}
                        style={[styles.textMicro]}
                    >
                        {translate('common.privacy')}
                    </TextLink>
                    {` ${translate('common.and')} `}
                    <TextLink
                        href={CONST.ONFIDO_TERMS_OF_SERVICE_URL}
                        style={[styles.textMicro]}
                    >
                        {translate('common.termsOfService')}
                    </TextLink>
                </Text>
            )}

            <View style={[styles.ph5, styles.mt5, styles.flexGrow1, styles.justifyContentEnd]}>
                {!!error && error.length > 0 && (
                    <DotIndicatorMessage
                        textStyles={[styles.formError]}
                        type="error"
                        messages={{error}}
                    />
                )}
                <Button
                    isDisabled={isOffline}
                    success
                    large
                    isLoading={isLoading}
                    style={[styles.w100]}
                    onPress={onNext}
                    text={translate('common.confirm')}
                />
            </View>
        </ScrollView>
    );
}

export default ConfirmationStep;
