import Button from '@components/Button';
import ButtonDisabledWhenOffline from '@components/Button/composed/ButtonDisabledWhenOffline';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MenuItemAvatarNavigation from '@components/MenuItem/presets/MenuItemAvatarNavigation';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';

import CONST from '@src/CONST';

import React, {useState} from 'react';
import {View} from 'react-native';

type SummaryItem = {
    /** Unique key of the row */
    id: string;

    /** The label shown above the answer */
    description: string;

    /** The answer shown in the row */
    title: string | undefined;

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

    /** Read by screen readers instead of the description and title */
    accessibilityLabel?: string;
};

/** A row for one entry of a repeated group, such as an owner, led by an avatar */
type SummaryAvatarRow = {
    /** Tells the row apart from an answer row */
    kind: 'avatar';

    /** Unique key of the row */
    id: string;

    /** The entry's name */
    title: string;

    /** The line under the name */
    description: string;

    /** The avatar shown on the left */
    avatarSource?: string;

    /** Called when the row is pressed */
    onPress: () => void;
};

/** The name of a repeated group, such as "Owners", shown above its entries since their rows don't carry it */
type SummaryLabelRow = {
    /** Tells the row apart from an answer row */
    kind: 'label';

    /** Unique key of the row */
    id: string;

    /** The group's name */
    title: string;
};

/** One row of a group: an answer, an entry of a repeated group, or the name of a repeated group */
type SummaryGroupRow = SummaryItem | SummaryAvatarRow | SummaryLabelRow;

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

        /** Sections with their own heading, each holding field rows and avatar rows for repeated entries */
        groups?: SummaryGroup[];

        /** Whether show additional section with Onfido terms etc. */
        showOnfidoLinks: boolean;

        /** The title of the Onfido section */
        onfidoLinksTitle?: string;

        isLoading?: boolean;

        /** The error message to display */
        error?: string;

        shouldApplySafeAreaPaddingBottom?: boolean;

        /** Whether screen readers treat the page title as a heading */
        shouldMarkTitleAsHeading?: boolean;

        /** Whether screen readers hear that Confirm is in progress, and hear the error after each Confirm press */
        shouldAnnounceSubmitState?: boolean;
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
    shouldMarkTitleAsHeading = false,
    shouldAnnounceSubmitState = false,
    forwardedFSClass,
}: ConfirmationStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const {paddingBottom: safeAreaInsetPaddingBottom} = useSafeAreaPaddings();
    const [wasLoading, setWasLoading] = useState(!!isLoading);
    const [finishedSubmitCount, setFinishedSubmitCount] = useState(0);
    if (shouldAnnounceSubmitState && wasLoading !== !!isLoading) {
        setWasLoading(!!isLoading);
        if (!isLoading) {
            setFinishedSubmitCount((count) => count + 1);
        }
    }

    // VoiceOver ignores the error's live region, and a repeated error leaves the page unchanged, so each submission that ends in an error announces it
    useAccessibilityAnnouncement(error, shouldAnnounceSubmitState && !!error, {
        shouldAnnounceOnNative: true,
        shouldAnnounceOnWeb: finishedSubmitCount > 1,
        announcementKey: finishedSubmitCount,
    });

    const renderRow = (row: SummaryGroupRow) => {
        if ('kind' in row && row.kind === 'label') {
            return (
                <Text
                    key={row.id}
                    style={[styles.textLabelSupporting, styles.ph5, styles.mt3, styles.mb1]}
                    accessibilityRole={CONST.ROLE.HEADER}
                    aria-level={4}
                >
                    {row.title}
                </Text>
            );
        }
        if ('kind' in row) {
            // MenuItemAvatarNavigation takes no FullStory class, so the mask goes on a View around it
            return (
                <View
                    key={row.id}
                    fsClass={forwardedFSClass}
                >
                    <MenuItemAvatarNavigation
                        testID={row.id}
                        title={row.title}
                        description={row.description}
                        accountID={CONST.DEFAULT_NUMBER_ID}
                        avatarSource={row.avatarSource}
                        onPress={row.onPress}
                    />
                </View>
            );
        }
        const {id, description, title, shouldShowRightIcon, onPress, interactive, brickRoadIndicator, errorText, testID, accessibilityLabel} = row;
        return (
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
                accessibilityLabel={accessibilityLabel}
                forwardedFSClass={forwardedFSClass}
            />
        );
    };

    return (
        <ScrollView
            style={styles.flex1}
            contentContainerStyle={[styles.flexGrow1, shouldApplySafeAreaPaddingBottom && {paddingBottom: safeAreaInsetPaddingBottom + styles.pb5.paddingBottom}]}
        >
            <Text
                style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}
                accessibilityRole={shouldMarkTitleAsHeading ? CONST.ROLE.HEADER : undefined}
                aria-level={shouldMarkTitleAsHeading ? 2 : undefined}
            >
                {pageTitle}
            </Text>
            {!!pageSubtitle && <Text style={[styles.textSupporting, styles.ph5, styles.mb5]}>{pageSubtitle}</Text>}
            {summaryItems.map(renderRow)}

            {groups.map((group, index) => (
                <View key={group.id}>
                    {index > 0 && <View style={[styles.mh5, styles.mt3, styles.borderBottom]} />}
                    {!!group.name && (
                        <Text
                            style={[styles.textNormalThemeText, styles.textLineHeightNormal, styles.textStrong, styles.ph5, styles.mt4, styles.mb1]}
                            accessibilityRole={CONST.ROLE.HEADER}
                            aria-level={3}
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
                    accessibilityState={shouldAnnounceSubmitState ? {busy: !!isLoading} : undefined}
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
export type {SummaryGroup, SummaryGroupRow};
