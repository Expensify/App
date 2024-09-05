import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import Onyx, {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OnyxDataType} from '@libs/DebugUtils';
import DebugUtils from '@libs/DebugUtils';
import Navigation from '@libs/Navigation/Navigation';
import ButtonWithDropdownMenu from '@src/components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@src/components/ButtonWithDropdownMenu/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {DETAILS_DROPDOWN_OPTIONS, DETAILS_SELECTION_LIST} from './const';

type DebugDetailsProps = {
    data: Record<string, unknown>;
    /** A unique Onyx key identifying the form */
    formId: typeof ONYXKEYS.FORMS.DEBUG_REPORT_ACTION_PAGE_FORM | typeof ONYXKEYS.FORMS.DEBUG_REPORT_PAGE_FORM;
    reportID: string;
    reportActionId?: string;
    onSave: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.DEBUG_REPORT_PAGE_FORM | typeof ONYXKEYS.FORMS.DEBUG_REPORT_ACTION_PAGE_FORM>) => void;
    onDelete: () => void;
    validate: (key: never, value: string) => void;
};

const DropdownOptionsArrays: Record<string, Array<DropdownOption<string>>> = Object.entries(DETAILS_DROPDOWN_OPTIONS).reduce((acc, [key, value]) => {
    acc[key] = Object.values(value).map((option) => ({value: option, text: option}));
    return acc;
}, {} as Record<string, Array<DropdownOption<string>>>);

function DebugDetails({data, reportID, onSave, onDelete, validate, formId, reportActionId}: DebugDetailsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onyxDraftDataKey = formId === ONYXKEYS.FORMS.DEBUG_REPORT_PAGE_FORM ? ONYXKEYS.FORMS.DEBUG_REPORT_PAGE_FORM_DRAFT : ONYXKEYS.FORMS.DEBUG_REPORT_ACTION_PAGE_FORM_DRAFT;
    const [formDraftData] = useOnyx(onyxDraftDataKey);
    const [dropdownsState, setDropdownsState] = useState<Record<string, string>>({});

    const validator = useCallback(
        (values: Record<string, unknown>): FormInputErrors<typeof ONYXKEYS.FORMS.DEBUG_REPORT_PAGE_FORM | typeof ONYXKEYS.FORMS.DEBUG_REPORT_ACTION_PAGE_FORM> => {
            const newErrors: Record<string, string | undefined> = {};
            Object.entries(values).forEach(([key, value]) => {
                try {
                    if (typeof value === 'boolean') {
                        return;
                    }

                    validate(key as never, value as string);
                } catch (e) {
                    const {cause, message} = e as SyntaxError;
                    newErrors[key] = cause || message === 'debug.missingValue' ? translate(message as TranslationPaths, cause as never) : message;
                }
            });

            return newErrors;
        },
        [translate, validate],
    );

    useEffect(() => {
        // eslint-disable-next-line rulesdir/prefer-actions-set-data
        Onyx.set(`${formId}Draft`, null);
    }, [formId]);

    const handleSubmit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.DEBUG_REPORT_PAGE_FORM | typeof ONYXKEYS.FORMS.DEBUG_REPORT_ACTION_PAGE_FORM>) => {
            const dataToSave = {...values, ...dropdownsState};

            const dataPreparedToSave = Object.entries(dataToSave).reduce((acc, [key, value]) => {
                if (typeof value === 'boolean') {
                    acc[key] = value;
                } else {
                    acc[key] = DebugUtils.stringToOnyxData(value as string, typeof data[key] as OnyxDataType);
                }
                return acc;
            }, {} as Record<string, unknown>);

            onSave(dataPreparedToSave);
        },
        [dropdownsState, data, onSave],
    );

    const onDropdownOptionSelected = (inputId: string, value: string) => {
        setDropdownsState((currentDropdownsState) => ({...currentDropdownsState, [inputId]: value}));
    };

    return (
        <ScrollView
            style={styles.mt5}
            contentContainerStyle={[styles.gap5, styles.ph5, styles.pb5]}
        >
            <FormProvider
                style={styles.flexGrow1}
                formID={formId}
                validate={validator}
                shouldValidateOnChange
                isSubmitDisabled={isEmptyObject(formDraftData) && isEmptyObject(dropdownsState)}
                onSubmit={handleSubmit}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                {Object.entries(data ?? {}).map(([key, value]) => {
                    const defaultData: unknown = value;

                    if (typeof defaultData === 'boolean') {
                        return (
                            <View style={[styles.mb5, styles.ml1]}>
                                <InputWrapper
                                    style={[styles.mt5, styles.mb5]}
                                    InputComponent={CheckboxWithLabel}
                                    label={key}
                                    inputID={key}
                                    shouldSaveDraft
                                    accessibilityLabel="Checkbox input field"
                                    defaultValue={defaultData}
                                />
                            </View>
                        );
                    }

                    if (DETAILS_SELECTION_LIST.includes(key)) {
                        return (
                            <MenuItemWithTopDescription
                                key={key}
                                style={styles.mb5}
                                title={(formDraftData?.[key] as string) ?? (defaultData as string)}
                                description={key}
                                onPress={() => Navigation.navigate(ROUTES.DEBUG_REPORT_ACTION_TYPE_LIST.getRoute(reportID ?? '', reportActionId))}
                                shouldShowRightIcon
                            />
                        );
                    }

                    if (key in DETAILS_DROPDOWN_OPTIONS) {
                        const DetailsDropdown = DETAILS_DROPDOWN_OPTIONS[key as keyof typeof DETAILS_DROPDOWN_OPTIONS] as Record<string, string>;

                        type Details = DeepValueOf<typeof DetailsDropdown>;

                        return (
                            <View style={styles.mb5}>
                                <View style={[styles.flexWrap]}>
                                    <Text style={[styles.mutedTextLabel]}>{key}</Text>
                                </View>
                                <ButtonWithDropdownMenu<Details>
                                    shouldAlwaysShowDropdownMenu
                                    pressOnEnter
                                    menuHeaderText="Select an option"
                                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                                    onPress={() => null}
                                    customText={dropdownsState[key] ?? value}
                                    onOptionSelected={(option) => {
                                        onDropdownOptionSelected(key, option.text);
                                    }}
                                    options={DropdownOptionsArrays[key]}
                                    style={[styles.flexGrow1, styles.alignItemsStart]}
                                    wrapperStyle={[styles.w100, styles.justifyContentBetween]}
                                    isSplitButton={false}
                                />
                            </View>
                        );
                    }

                    const stringValue = DebugUtils.onyxDataToString(defaultData);

                    const numberOfLines = DebugUtils.getNumberOfLinesFromString(stringValue);

                    return (
                        <View style={styles.mb5}>
                            <InputWrapper
                                InputComponent={TextInput}
                                inputID={key}
                                accessibilityLabel="Text input field"
                                shouldSaveDraft
                                forceActiveLabel
                                label={key}
                                numberOfLines={numberOfLines}
                                multiline={numberOfLines > 1}
                                defaultValue={stringValue}
                            />
                        </View>
                    );
                })}
                <Text style={[styles.headerText, styles.textAlignCenter]}>{translate('debug.hint')}</Text>
            </FormProvider>
            <Button
                danger
                large
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
