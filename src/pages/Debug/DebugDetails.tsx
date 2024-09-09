import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
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
import Debug from '@userActions/Debug';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, ReportAction} from '@src/types/onyx';
import {DETAILS_CONSTANT_FIELDS, DETAILS_DATETIME_FIELDS} from './const';
import ConstantSelector from './ConstantSelector';
import DateTimeSelector from './DateTimeSelector';

type DebugDetailsProps = {
    /** The report or report action data to be displayed and editted. */
    data: OnyxEntry<Report> | OnyxEntry<ReportAction>;

    /** Callback to be called when user saves the debug data. */
    onSave: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.DEBUG_DETAILS_FORM>) => void;

    /** Callback to be called when user deletes the debug data. */
    onDelete: () => void;

    /** Callback to be called every time the debug data form is validated. */
    validate: (key: never, value: string) => void;
};

function DebugDetails({data, onSave, onDelete, validate}: DebugDetailsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [formDraftData] = useOnyx(ONYXKEYS.FORMS.DEBUG_DETAILS_FORM_DRAFT);
    const booleanFields = useMemo(() => Object.entries(data ?? {}).filter(([, value]) => typeof value === 'boolean') as Array<[string, boolean]>, [data]);
    const constantFields = useMemo(() => Object.entries(data ?? {}).filter(([key]) => DETAILS_CONSTANT_FIELDS.includes(key)) as Array<[string, string]>, [data]);
    const numberFields = useMemo(() => Object.entries(data ?? {}).filter(([, value]) => typeof value === 'number') as Array<[string, number]>, [data]);
    const textFields = useMemo(
        () =>
            Object.entries(data ?? {}).filter(([key, value]) => typeof value === 'string' && !DETAILS_CONSTANT_FIELDS.includes(key) && !DETAILS_DATETIME_FIELDS.includes(key)) as Array<
                [string, string]
            >,
        [data],
    );
    const dateTimeFields = useMemo(() => Object.entries(data ?? {}).filter(([key]) => DETAILS_DATETIME_FIELDS.includes(key)) as Array<[string, string]>, [data]);

    const validator = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.DEBUG_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.DEBUG_DETAILS_FORM> => {
            const newErrors: Record<string, string | undefined> = {};
            Object.entries(values).forEach(([key, value]) => {
                try {
                    validate(key as never, DebugUtils.onyxDataToString(value));
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
        Debug.resetDebugDetailsDraftForm();
    }, []);

    const handleSubmit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.DEBUG_DETAILS_FORM>) => {
            const dataPreparedToSave = Object.entries(values).reduce((acc: FormOnyxValues<typeof ONYXKEYS.FORMS.DEBUG_DETAILS_FORM>, [key, value]) => {
                if (typeof value === 'boolean') {
                    acc[key] = value;
                } else {
                    acc[key] = DebugUtils.stringToOnyxData(value as string, typeof data?.[key as keyof Report & keyof ReportAction] as OnyxDataType);
                }
                return acc;
            }, {});

            onSave(dataPreparedToSave);
        },
        [data, onSave],
    );

    return (
        <ScrollView style={styles.mv5}>
            <FormProvider
                style={styles.flexGrow1}
                formID={ONYXKEYS.FORMS.DEBUG_DETAILS_FORM}
                validate={validator}
                shouldValidateOnChange
                onSubmit={handleSubmit}
                isSubmitDisabled={!Object.entries(formDraftData ?? {}).some(([key, value]) => data?.[key as keyof typeof data] !== value)}
                submitButtonText={translate('common.save')}
                submitButtonStyles={styles.ph5}
                enabledWhenOffline
            >
                <Text style={[styles.headerText, styles.textAlignCenter]}>Text fields</Text>
                <View style={[styles.mb5, styles.ph5, styles.gap5]}>
                    {textFields.map(([key, value]) => {
                        const numberOfLines = DebugUtils.getNumberOfLinesFromString(value);
                        return (
                            <InputWrapper
                                InputComponent={TextInput}
                                inputID={key}
                                accessibilityLabel="Text input field"
                                shouldSaveDraft
                                forceActiveLabel
                                label={key}
                                numberOfLines={numberOfLines}
                                multiline={numberOfLines > 1}
                                defaultValue={value}
                            />
                        );
                    })}
                    {textFields.length === 0 && <Text style={[styles.textNormalThemeText, styles.textAlignCenter]}>None</Text>}
                </View>
                <Text style={[styles.headerText, styles.textAlignCenter]}>Number fields</Text>
                <View style={[styles.mb5, styles.ph5, styles.gap5]}>
                    {numberFields.map(([key, value]) => (
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={key}
                            accessibilityLabel="Text input field"
                            shouldSaveDraft
                            forceActiveLabel
                            label={key}
                            defaultValue={String(value)}
                        />
                    ))}
                    {numberFields.length === 0 && <Text style={[styles.textNormalThemeText, styles.textAlignCenter]}>None</Text>}
                </View>
                <Text style={[styles.headerText, styles.textAlignCenter]}>Constant fields</Text>
                <View style={styles.mb5}>
                    {constantFields.map(([key, value]) => (
                        <InputWrapper
                            key={key}
                            InputComponent={ConstantSelector}
                            inputID={key}
                            name={key}
                            shouldSaveDraft
                            defaultValue={String(value)}
                        />
                    ))}
                    {constantFields.length === 0 && <Text style={[styles.textNormalThemeText, styles.textAlignCenter]}>None</Text>}
                </View>
                <Text style={[styles.headerText, styles.textAlignCenter]}>Datetime fields</Text>
                <View style={styles.mb5}>
                    {dateTimeFields.map(([key, value]) => (
                        <InputWrapper
                            key={key}
                            InputComponent={DateTimeSelector}
                            inputID={key}
                            name={key}
                            shouldSaveDraft
                            defaultValue={String(value)}
                        />
                    ))}
                    {dateTimeFields.length === 0 && <Text style={[styles.textNormalThemeText, styles.textAlignCenter]}>None</Text>}
                </View>
                <Text style={[styles.headerText, styles.textAlignCenter]}>Boolean fields</Text>
                <View style={[styles.mb5, styles.ph5, styles.gap5]}>
                    {booleanFields.map(([key, value]) => (
                        <InputWrapper
                            InputComponent={CheckboxWithLabel}
                            label={key}
                            inputID={key}
                            shouldSaveDraft
                            accessibilityLabel="Checkbox input field"
                            defaultValue={value}
                        />
                    ))}
                    {booleanFields.length === 0 && <Text style={[styles.textNormalThemeText, styles.textAlignCenter]}>None</Text>}
                </View>
                <Text style={[styles.headerText, styles.textAlignCenter]}>{translate('debug.hint')}</Text>
            </FormProvider>
            <View style={styles.ph5}>
                <Button
                    danger
                    large
                    text={translate('common.delete')}
                    onPress={() => {
                        onDelete();
                        Navigation.goBack();
                    }}
                />
            </View>
        </ScrollView>
    );
}

DebugDetails.displayName = 'DebugDetails';

export default DebugDetails;
