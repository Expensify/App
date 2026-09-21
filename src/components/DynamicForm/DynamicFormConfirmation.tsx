import UserAvatar from '@components/Avatar/UserAvatar';
import Button from '@components/Button';
import ButtonDisabledWhenOffline from '@components/Button/composed/ButtonDisabledWhenOffline';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type FieldSummaryRow = {
    kind: 'field';
    id: string;
    description: string;
    title: string;
    shouldShowRightIcon: boolean;
    onPress: () => void;
};

type ItemSummaryRow = {
    kind: 'item';
    id: string;
    title: string;
    description: string;
    avatarSource?: string;
    onPress: () => void;
};

type SummaryRow = FieldSummaryRow | ItemSummaryRow;

type SummaryGroup = {
    name: string;
    rows: SummaryRow[];
};

type DynamicFormConfirmationProps = {
    pageTitle: string;

    /** One section per page of the form, each with a row per answer or per list item */
    groups: SummaryGroup[];

    isLoading?: boolean;

    error?: string;

    onConfirm: () => void;
};

/** The confirmation page of a dynamic form: every answer under its page's heading, list items as avatar rows, then the submit button */
function DynamicFormConfirmation({pageTitle, groups, isLoading = false, error, onConfirm}: DynamicFormConfirmationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {paddingBottom: safeAreaInsetPaddingBottom} = useSafeAreaPaddings();

    return (
        <ScrollView
            style={styles.flex1}
            contentContainerStyle={[styles.flexGrow1, {paddingBottom: safeAreaInsetPaddingBottom + styles.pb5.paddingBottom}]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{pageTitle}</Text>
            {groups.map((group, index) => (
                <View key={group.name}>
                    {index > 0 && <View style={[styles.mh5, styles.mt3, styles.borderBottom]} />}
                    <Text style={[styles.textNormalThemeText, styles.textLineHeightNormal, styles.textStrong, styles.ph5, styles.mt4, styles.mb1]}>{group.name}</Text>
                    {group.rows.map((row) =>
                        row.kind === 'field' ? (
                            <MenuItemWithTopDescription
                                key={row.id}
                                pressableTestID={row.id}
                                description={row.description}
                                title={row.title}
                                shouldShowRightIcon={row.shouldShowRightIcon}
                                onPress={row.onPress}
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
            <View style={[styles.ph5, styles.mt5, styles.flexGrow1, styles.justifyContentEnd]}>
                {!!error && (
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
                    style={styles.w100}
                    onPress={onConfirm}
                >
                    <Button.Text>{translate('common.confirm')}</Button.Text>
                </ButtonDisabledWhenOffline>
            </View>
        </ScrollView>
    );
}

export default DynamicFormConfirmation;
export type {SummaryGroup, SummaryRow};
