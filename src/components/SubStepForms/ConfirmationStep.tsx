import UserAvatar from '@components/Avatar/UserAvatar';
import Button from '@components/Button';
import ButtonDisabledWhenOffline from '@components/Button/composed/ButtonDisabledWhenOffline';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MenuItem from '@components/MenuItem';
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

/** A row for one entry of a repeated group, led by an avatar */
type SummaryItemRow = {
    kind: 'item';
    id: string;
    title: string;
    description: string;
    avatarSource?: string;
    onPress: () => void;
};

type SummaryGroupRow = (SummaryItem & {kind: 'field'}) | SummaryItemRow;

/** Answers under one heading; used instead of `summaryItems` when the confirmation is split by section */
type SummaryGroup = {
    name: string;
    rows: SummaryGroupRow[];
};

type ConfirmationStepProps = SubPageProps &
    ForwardedFSClassProps & {
        pageTitle: string;
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
    };

function ConfirmationStep({
    pageTitle,
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
            {groups.map((group, index) => (
                <View key={group.name}>
                    {index > 0 && <View style={[styles.mh5, styles.mt3, styles.borderBottom]} />}
                    <Text style={[styles.textNormalThemeText, styles.textLineHeightNormal, styles.textStrong, styles.ph5, styles.mt4, styles.mb1]}>{group.name}</Text>
                    {group.rows.map((row) =>
                        row.kind === 'field' ? (
                            <MenuItemWithTopDescription
                                key={row.id}
                                pressableTestID={row.testID ?? row.id}
                                description={row.description}
                                title={row.title}
                                shouldShowRightIcon={row.shouldShowRightIcon}
                                onPress={row.onPress}
                                brickRoadIndicator={row.brickRoadIndicator}
                                errorText={row.errorText}
                                forwardedFSClass={forwardedFSClass}
                            />
                        ) : (
                            <MenuItem.Root
                                key={row.id}
                                testID={row.id}
                                onPress={row.onPress}
                                accessibilityLabel={[row.title, row.description].filter(Boolean).join(', ')}
                            >
                                <MenuItem.Row>
                                    <MenuItem.Leading>
                                        <UserAvatar
                                            source={row.avatarSource}
                                            accountID={CONST.DEFAULT_NUMBER_ID}
                                        />
                                    </MenuItem.Leading>
                                    <MenuItem.Content>
                                        <MenuItem.Title>{row.title}</MenuItem.Title>
                                        {!!row.description && <MenuItem.Description>{row.description}</MenuItem.Description>}
                                    </MenuItem.Content>
                                    <MenuItem.Trailing>
                                        <MenuItem.Chevron />
                                    </MenuItem.Trailing>
                                </MenuItem.Row>
                            </MenuItem.Root>
                        ),
                    )}
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
export type {SummaryGroup, SummaryGroupRow};
