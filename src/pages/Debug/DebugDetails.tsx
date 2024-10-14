import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ObjectType, OnyxDataType} from '@libs/DebugUtils';
import DebugUtils from '@libs/DebugUtils';
import Navigation from '@libs/Navigation/Navigation';
import Debug from '@userActions/Debug';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';
import type {DetailsConstantFieldsKeys, DetailsDatetimeFieldsKeys, DetailsDisabledKeys} from './const';
import {DETAILS_CONSTANT_FIELDS, DETAILS_DATETIME_FIELDS, DETAILS_DISABLED_KEYS} from './const';
import ConstantSelector from './ConstantSelector';
import DateTimeSelector from './DateTimeSelector';

type DebugDetailsProps = {
    /** The report or report action data to be displayed and editted. */
    data: OnyxEntry<Report> | OnyxEntry<ReportAction> | OnyxEntry<Transaction>;

    children?: React.ReactNode;

    /** Callback to be called when user saves the debug data. */
    onSave: (values: Record<string, unknown>) => void;

    /** Callback to be called when user deletes the debug data. */
    onDelete: () => void;

    /** Callback to be called every time the debug data form is validated. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate: (key: any, value: string) => void;
};

function DebugDetails({data, children, onSave, onDelete, validate}: DebugDetailsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [formDraftData] = useOnyx(ONYXKEYS.FORMS.DEBUG_DETAILS_FORM_DRAFT);
    const booleanFields = useMemo(
        () =>
            Object.entries(data ?? {})
                .filter(([, value]) => typeof value === 'boolean')
                .sort((a, b) => a[0].localeCompare(b[0])) as Array<[string, boolean]>,
        [data],
    );
    const constantFields = useMemo(
        () =>
            Object.entries(data ?? {})
                .filter((entry): entry is [string, string] => DETAILS_CONSTANT_FIELDS.includes(entry[0] as DetailsConstantFieldsKeys))
                .sort((a, b) => a[0].localeCompare(b[0])),
        [data],
    );
    const numberFields = useMemo(
        () =>
            Object.entries(data ?? {})
                .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
                .sort((a, b) => a[0].localeCompare(b[0])),
        [data],
    );
    const textFields = useMemo(
        () =>
            Object.entries(data ?? {})
                .filter(
                    (entry): entry is [string, string | ObjectType] =>
                        (typeof entry[1] === 'string' || typeof entry[1] === 'object') &&
                        !DETAILS_CONSTANT_FIELDS.includes(entry[0] as DetailsConstantFieldsKeys) &&
                        !DETAILS_DATETIME_FIELDS.includes(entry[0] as DetailsDatetimeFieldsKeys),
                )
                .map(([key, value]) => [key, DebugUtils.onyxDataToString(value)])
                .sort((a, b) => (a.at(0) ?? '').localeCompare(b.at(0) ?? '')),
        [data],
    );
    const dateTimeFields = useMemo(
        () => Object.entries(data ?? {}).filter((entry): entry is [string, string] => DETAILS_DATETIME_FIELDS.includes(entry[0] as DetailsDatetimeFieldsKeys)),
        [data],
    );

    const validator = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.DEBUG_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.DEBUG_DETAILS_FORM> => {
            const newErrors: Record<string, string | undefined> = {};
            Object.entries(values).forEach(([key, value]) => {
                try {
                    validate(key, DebugUtils.onyxDataToString(value));
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
            const dataPreparedToSave = Object.entries<string | boolean>(values).reduce((acc: Record<string, unknown>, [key, value]) => {
                if (typeof value === 'boolean') {
                    acc[key] = value;
                } else {
                    acc[key] = DebugUtils.stringToOnyxData(value, typeof data?.[key as keyof typeof data] as OnyxDataType);
                }
                return acc;
            }, {});

            onSave(dataPreparedToSave);
        },
        [data, onSave],
    );

    const isSubmitDisabled = useMemo(
        () =>
            !Object.entries(formDraftData ?? {}).some(([key, value]) => {
                const onyxData = data?.[key as keyof typeof data];
                if (typeof value === 'string') {
                    return !DebugUtils.compareStringWithOnyxData(value, onyxData);
                }
                return onyxData !== value;
            }),
        [formDraftData, data],
    );

    return (
        <ScrollView style={styles.mv5}>
            {children}
            <FormProvider
                style={styles.flexGrow1}
                formID={ONYXKEYS.FORMS.DEBUG_DETAILS_FORM}
                validate={validator}
                shouldValidateOnChange
                onSubmit={handleSubmit}
                isSubmitDisabled={isSubmitDisabled}
                submitButtonText={translate('common.save')}
                submitButtonStyles={[styles.ph5, styles.mt0]}
                enabledWhenOffline
                allowHTML
            >
                <Text style={[styles.headerText, styles.ph5, styles.mb3]}>{translate('debug.textFields')}</Text>
                <View style={[styles.mb5, styles.ph5, styles.gap5]}>
                    {textFields.map(([key, value]) => {
                        const numberOfLines = DebugUtils.getNumberOfLinesFromString((formDraftData?.[key as keyof typeof formDraftData] as string) ?? value);
                        return (
                            <InputWrapper
                                InputComponent={TextInput}
                                inputID={key}
                                accessibilityLabel={key}
                                shouldSaveDraft
                                forceActiveLabel
                                label={key}
                                numberOfLines={numberOfLines}
                                multiline={numberOfLines > 1}
                                defaultValue={value}
                                disabled={DETAILS_DISABLED_KEYS.includes(key as DetailsDisabledKeys)}
                                shouldInterceptSwipe
                            />
                        );
                    })}
                    {textFields.length === 0 && <Text style={[styles.textNormalThemeText, styles.ph5]}>{translate('debug.none')}</Text>}
                </View>
                <Text style={[styles.headerText, styles.ph5, styles.mb3]}>{translate('debug.numberFields')}</Text>
                <View style={[styles.mb5, styles.ph5, styles.gap5]}>
                    {numberFields.map(([key, value]) => (
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={key}
                            accessibilityLabel={key}
                            shouldSaveDraft
                            forceActiveLabel
                            label={key}
                            defaultValue={String(value)}
                            disabled={DETAILS_DISABLED_KEYS.includes(key as DetailsDisabledKeys)}
                            shouldInterceptSwipe
                        />
                    ))}
                    {numberFields.length === 0 && <Text style={[styles.textNormalThemeText, styles.ph5]}>{translate('debug.none')}</Text>}
                </View>
                <Text style={[styles.headerText, styles.ph5, styles.mb3]}>{translate('debug.constantFields')}</Text>
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
                    {constantFields.length === 0 && <Text style={[styles.textNormalThemeText, styles.ph5]}>{translate('debug.none')}</Text>}
                </View>
                <Text style={[styles.headerText, styles.ph5, styles.mb3]}>{translate('debug.dateTimeFields')}</Text>
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
                    {dateTimeFields.length === 0 && <Text style={[styles.textNormalThemeText, styles.ph5]}>{translate('debug.none')}</Text>}
                </View>
                <Text style={[styles.headerText, styles.ph5, styles.mb3]}>{translate('debug.booleanFields')}</Text>
                <View style={[styles.mb5, styles.ph5, styles.gap5]}>
                    {booleanFields.map(([key, value]) => (
                        <InputWrapper
                            InputComponent={CheckboxWithLabel}
                            label={key}
                            inputID={key}
                            shouldSaveDraft
                            accessibilityLabel={key}
                            defaultValue={value}
                        />
                    ))}
                    {booleanFields.length === 0 && <Text style={[styles.textNormalThemeText, styles.ph5]}>{translate('debug.none')}</Text>}
                </View>
                <Text style={[styles.headerText, styles.textAlignCenter]}>{translate('debug.hint')}</Text>
                <View style={[styles.ph5, styles.mb3, styles.mt5]}>
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
            </FormProvider>
        </ScrollView>
    );
}

DebugDetails.displayName = 'DebugDetails';

export default DebugDetails;
