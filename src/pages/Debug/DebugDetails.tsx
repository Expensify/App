import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import MenuItem from '@components/MenuItem';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DebugUtils from '@libs/DebugUtils';
import Navigation from '@libs/Navigation/Navigation';
import ButtonWithDropdownMenu from '@src/components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@src/components/ButtonWithDropdownMenu/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {DETAILS_DROPDOWN_OPTIONS, DETAILS_TYPES_MAP, FIELD_TYPES} from './const';

type DebugDetailsProps = {
    reportID: string;
    data: Record<string, unknown>;
    onSave: (data: Record<string, unknown>) => void;
    onDelete: () => void;
    validate: (key: never, value: string) => void;
};

const DropdownOptionsArrays: Record<string, Array<DropdownOption<string>>> = Object.entries(DETAILS_DROPDOWN_OPTIONS).reduce((acc, [key, value]) => {
    acc[key] = Object.values(value).map((option) => ({value: option, text: option}));
    return acc;
}, {} as Record<string, Array<DropdownOption<string>>>);

function DebugDetails({reportID, data, onSave, onDelete, validate}: DebugDetailsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [draftData, setDraftData] = useState<Record<string, string>>(DebugUtils.onyxDataToDraftData(data));
    const [errors, setErrors] = useState<Record<string, string>>({});

    const onChange = useCallback(
        (key: string, updatedValue: string) => {
            try {
                validate(key as never, updatedValue);
                setErrors((currentErrors) => ({...currentErrors, [key]: ''}));
            } catch (e) {
                const {cause, message} = e as SyntaxError;
                setErrors((currentErrors) => ({
                    ...currentErrors,
                    [key]: cause || message === 'debug.missingValue' ? translate(message as TranslationPaths, cause as never) : message,
                }));
            } finally {
                setDraftData((currentDraftData) => ({...currentDraftData, [key]: updatedValue}));
            }
        },
        [translate, validate],
    );

    return (
        <ScrollView
            style={styles.mt5}
            contentContainerStyle={[styles.gap5, styles.ph5, styles.pb5]}
        >
            {Object.entries(draftData ?? {}).map(([key, value]) => {
                if (key === FIELD_TYPES.lastActionType) {
                    return (
                        <MenuItem
                            key={key}
                            title={key}
                            subtitle={value}
                            onPress={() => Navigation.navigate(ROUTES.DEBUG_SELECTION_LIST_LAST_ACTION_TYPE.getRoute(reportID))}
                            shouldShowRightIcon
                        />
                    );
                }

                if (key in DETAILS_TYPES_MAP) {
                    if (DETAILS_TYPES_MAP[key as keyof typeof DETAILS_TYPES_MAP] === FIELD_TYPES.checkbox) {
                        return (
                            <CheckboxWithLabel
                                label={key}
                                accessibilityLabel="Checkbox input field"
                                style={[styles.mb5]}
                                isChecked={!value}
                                onInputChange={(updatedValue?: boolean) => {
                                    const updatedValueString = String(updatedValue);

                                    onChange(key, updatedValueString);
                                }}
                            />
                        );
                    }

                    if (DETAILS_TYPES_MAP[key as keyof typeof DETAILS_TYPES_MAP] === FIELD_TYPES.dropdown) {
                        if (key in DETAILS_DROPDOWN_OPTIONS) {
                            const DetailsDropdown = DETAILS_DROPDOWN_OPTIONS[key as keyof typeof DETAILS_DROPDOWN_OPTIONS] as Record<string, string>;

                            type Details = DeepValueOf<typeof DetailsDropdown>;

                            return (
                                <>
                                    <View style={[styles.flexWrap]}>
                                        <Text style={[styles.mutedTextLabel]}>{key}</Text>
                                    </View>
                                    <ButtonWithDropdownMenu<Details>
                                        shouldAlwaysShowDropdownMenu
                                        pressOnEnter
                                        menuHeaderText="Select an option"
                                        buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                                        onPress={() => null}
                                        onOptionSelected={(option) => {
                                            onChange(key, option.text);
                                        }}
                                        options={DropdownOptionsArrays[key]}
                                        style={[styles.flexGrow1, styles.alignItemsStart]}
                                        wrapperStyle={[styles.w100, styles.justifyContentBetween]}
                                        isSplitButton={false}
                                    />
                                </>
                            );
                        }
                    }
                }

                return (
                    <TextInput
                        errorText={errors[key]}
                        accessibilityLabel="Text input field"
                        key={key}
                        forceActiveLabel
                        label={key}
                        numberOfLines={DebugUtils.getNumberOfLinesFromString(value)}
                        multiline={DebugUtils.getNumberOfLinesFromString(value) > 1}
                        value={value}
                        onChangeText={(updatedValue) => onChange(key, updatedValue)}
                    />
                );
            })}
            <Text style={[styles.headerText, styles.textAlignCenter]}>{translate('debug.hint')}</Text>
            <Button
                success
                text={translate('common.save')}
                isDisabled={
                    Object.entries(draftData).reduce((prev, [key, value]) => prev && DebugUtils.compareStringWithOnyxData(value, data[key]), true) ||
                    Object.values(errors).reduce((prevError, currError) => prevError || !!currError, false)
                }
                onPress={() => {
                    setErrors({});
                    const onyxData = Object.fromEntries(Object.entries(draftData).map(([key, value]) => [key, DebugUtils.stringToOnyxData(value, typeof data[key])] as [string, unknown]));
                    onSave(onyxData);
                    setDraftData(DebugUtils.onyxDataToDraftData(onyxData));
                }}
            />
            <Button
                danger
                text={translate('common.delete')}
                onPress={() => {
                    onDelete();
                    Navigation.goBack();
                }}
            />
        </ScrollView>
    );
}

DebugDetails.displayName = 'DebugDetails';

export default DebugDetails;
