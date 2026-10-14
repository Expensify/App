import Button from '@components/Button';
import ButtonDisabledWhenOffline from '@components/Button/composed/ButtonDisabledWhenOffline';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';

import CONST from '@src/CONST';

import {View} from 'react-native';

type SummaryItem = {
    /** Unique key of the row */
    id: string;

    /** The label shown above the answer */
    description: string;

    /** The answer shown in the row */
    title: string;

    /** Whether the chevron is shown on the right of the row */
    shouldShowRightIcon: boolean;

    /** Called when the row is pressed */
    onPress: () => void;

    /** False for a row that opens nothing, so it is not announced as a button. Defaults to true. */
    interactive?: boolean;

    /** The brick road indicator shown on the row */
    brickRoadIndicator?: BrickRoad;

    /** The error shown under the row */
    errorText?: string;

    /** The test ID of the row */
    testID?: string;
};

/** One row of a group. A single kind for now, so groups can grow other row kinds without touching their callers. */
type SummaryGroupRow = SummaryItem;

/** Answers under one heading. Used instead of `summaryItems` when the confirmation is split by section. */
type SummaryGroup = {
    /** Unique key of the group */
    id: string;

    /** The heading, left out when empty */
    name: string;

    /** The rows listed under the heading */
    rows: SummaryGroupRow[];
};

type ConfirmationStepProps = SubPageProps &
    ForwardedFSClassProps & {
        pageTitle: string;

        /** Text shown below the page title */
        pageSubtitle?: string;

        summaryItems?: SummaryItem[];

        /** Sections with their own heading, each holding field rows */
        groups?: SummaryGroup[];

        /** Whether show additional section with Onfido terms etc. */
        showOnfidoLinks: boolean;

        /** The title of the Onfido section */
        onfidoLinksTitle?: string;

        isLoading?: boolean;

        /** The error message to display */
        error?: string;

        shouldApplySafeAreaPaddingBottom?: boolean;
    };

function ConfirmationStep({
    pageTitle,
    pageSubtitle,
    summaryItems = [],
    groups = [],
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

    const {paddingBottom: safeAreaInsetPaddingBottom} = useSafeAreaPaddings();

    const renderRow = ({id, description, title, shouldShowRightIcon, onPress, interactive, brickRoadIndicator, errorText, testID}: SummaryItem) => (
        <MenuItemWithTopDescription
            key={id}
            pressableTestID={testID ?? id}
            description={description}
            title={title}
            shouldShowRightIcon={shouldShowRightIcon}
            onPress={onPress}
            interactive={interactive}
            brickRoadIndicator={brickRoadIndicator}
            errorText={errorText}
            forwardedFSClass={forwardedFSClass}
        />
    );

    return (
        <ScrollView
            style={styles.flex1}
            contentContainerStyle={[styles.flexGrow1, shouldApplySafeAreaPaddingBottom && {paddingBottom: safeAreaInsetPaddingBottom + styles.pb5.paddingBottom}]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{pageTitle}</Text>
            {!!pageSubtitle && <Text style={[styles.textSupporting, styles.ph5, styles.mb5]}>{pageSubtitle}</Text>}
            {summaryItems.map(renderRow)}

            {groups.map((group, index) => (
                <View key={group.id}>
                    {index > 0 && <View style={[styles.mh5, styles.mt3, styles.borderBottom]} />}
                    {!!group.name && (
                        <Text
                            style={[styles.textNormalThemeText, styles.textLineHeightNormal, styles.textStrong, styles.ph5, styles.mt4, styles.mb1]}
                            accessibilityRole={CONST.ROLE.HEADER}
                        >
                            {group.name}
                        </Text>
                    )}
                    {group.rows.map(renderRow)}
                </View>
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
                <ButtonDisabledWhenOffline
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    isLoading={isLoading}
                    style={[styles.w100]}
                    onPress={onNext}
                >
                    <Button.Text>{translate('common.confirm')}</Button.Text>
                </ButtonDisabledWhenOffline>
            </View>
        </ScrollView>
    );
}

export default ConfirmationStep;
export type {SummaryGroup};
