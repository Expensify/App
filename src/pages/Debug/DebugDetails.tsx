import React, {useState} from 'react';
import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DebugUtils from '@libs/DebugUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {TranslationPaths} from '@src/languages/types';

type DebugDetailsProps = {
    data: Record<string, unknown>;
    onSave: (data: Record<string, unknown>) => void;
    onDelete: () => void;
    validate: (key: never, value: string) => void;
};

function DebugDetails({data, onSave, onDelete, validate}: DebugDetailsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [draftData, setDraftData] = useState<Record<string, string>>(DebugUtils.onyxDataToDraftData(data));
    const [errors, setErrors] = useState<Record<string, string>>({});
    return (
        <ScrollView
            style={styles.mt5}
            contentContainerStyle={[styles.gap5, styles.ph5, styles.pb5]}
        >
            {Object.entries(draftData ?? {}).map(([key, value]) => (
                <TextInput
                    errorText={errors[key]}
                    accessibilityLabel="Text input field"
                    key={key}
                    forceActiveLabel
                    label={key}
                    numberOfLines={DebugUtils.getNumberOfLinesFromString(value)}
                    multiline={DebugUtils.getNumberOfLinesFromString(value) > 1}
                    value={value}
                    onChangeText={(updatedValue) => {
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
                    }}
                />
            ))}
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
