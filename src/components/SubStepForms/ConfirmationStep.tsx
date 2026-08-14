import Button from '@components/ButtonComposed';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type SummaryItem = {
    id: string;
    description: string;
    title: string;
    shouldShowRightIcon: boolean;
    onPress: () => void;
    brickRoadIndicator?: BrickRoad;
    errorText?: string;
    testID?: string;
};

type ConfirmationStepProps = SubPageProps &
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
            {summaryItems.map(({id, description, title, shouldShowRightIcon, onPress, brickRoadIndicator, errorText, testID}) => (
                <MenuItemWithTopDescription
                    key={id}
                    pressableTestID={testID ?? id}
                    description={description}
                    title={title}
                    shouldShowRightIcon={shouldShowRightIcon}
                    onPress={onPress}
                    brickRoadIndicator={brickRoadIndicator}
                    errorText={errorText}
                    forwardedFSClass={forwardedFSClass}
                />
            ))}

            {showOnfidoLinks && (
                <View style={[styles.renderHTML, styles.ph5, styles.mt3]}>
                    <RenderHTML html={translate('onfidoStep.onfidoLinks', onfidoLinksTitle ?? '')} />
                </View>
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
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    isLoading={isLoading}
                    style={[styles.w100]}
                    onPress={onNext}
                >
                    <Button.Text>{translate('common.confirm')}</Button.Text>
                </Button>
            </View>
        </ScrollView>
    );
}

export default ConfirmationStep;
