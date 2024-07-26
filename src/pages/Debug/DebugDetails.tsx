import React, {useState} from 'react';
import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import isObject from '@src/utils/isObject';

type DebugDetailsProps = {
    data: Record<string, unknown>;
    onSave: (data: Record<string, unknown>) => void;
    onDelete: () => void;
};

function DebugDetails({data, onSave, onDelete}: DebugDetailsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [draftData, setDraftData] = useState(data);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    return (
        <ScrollView
            style={styles.mt5}
            contentContainerStyle={[styles.gap5, styles.ph5, styles.pb5]}
        >
            {Object.entries(data ?? {}).map(([key, value]) => (
                <TextInput
                    errorText={errors[key]}
                    accessibilityLabel="Text input field"
                    key={key}
                    forceActiveLabel
                    label={key}
                    numberOfLines={4}
                    multiline={isObject(value)}
                    defaultValue={isObject(value) ? JSON.stringify(value, null, 6) : String(value)}
                    onChangeText={(updatedValue) => {
                        setDraftData((currentDraftData) => ({...currentDraftData, [key]: updatedValue}));
                        setHasChanges(true);
                    }}
                />
            ))}
            <Text style={[styles.headerText, styles.textAlignCenter]}>{translate('debug.hint')}</Text>
            <Button
                success
                text={translate('common.save')}
                isDisabled={!hasChanges}
                onPress={() => {
                    let updatedData = draftData;
                    let hasErrors = false;
                    setErrors({});
                    const results = Object.entries(draftData).map(([key, value]) => {
                        try {
                            if (isObject(data[key])) {
                                return [key, typeof value === 'string' ? JSON.parse(value.replaceAll('\n', '')) : value] as [string, unknown];
                            }
                        } catch (e) {
                            setErrors((currentErrors) => ({...currentErrors, [key]: (e as SyntaxError).message}));
                            hasErrors = true;
                        }
                        return [key, value];
                    });
                    updatedData = Object.fromEntries(results) as Record<string, unknown>;
                    if (hasErrors) {
                        return;
                    }
                    setHasChanges(false);
                    onSave(updatedData);
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
