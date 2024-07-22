import React, {useState} from 'react';
import type {OnyxKey} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';

type DebugDetailsProps = {
    data: Record<string, unknown>;
    onyxKey: OnyxKey;
    isCollection?: boolean;
    idSelector?: (data: Record<string, unknown>) => string;
};

function DebugDetails({data, onyxKey, isCollection = false, idSelector = () => ''}: DebugDetailsProps) {
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
                    multiline={typeof value === 'object'}
                    defaultValue={typeof value === 'object' ? JSON.stringify(value, null, 6) : (value as string)}
                    onChangeText={(updatedValue) => {
                        setDraftData((currentDraftData) => {
                            return {...currentDraftData, [key]: updatedValue};
                        });
                        setHasChanges(true);
                    }}
                />
            ))}
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
                            if (data && typeof data === 'object' && typeof data[key] === 'object') {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                                return [key, typeof value === 'string' ? JSON.parse(value.replaceAll('\n', '')) : value];
                            }
                        } catch (e) {
                            setErrors((currentErrors) => ({...currentErrors, [key]: (e as SyntaxError).message}));
                            hasErrors = true;
                        }
                        return [key, value];
                    });
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    updatedData = Object.fromEntries(results);
                    if (hasErrors) {
                        return;
                    }
                    setHasChanges(false);
                    // eslint-disable-next-line rulesdir/prefer-actions-set-data
                    Onyx.merge(onyxKey, updatedData);
                }}
            />
            <Button
                danger
                text={translate('common.delete')}
                onPress={() => {
                    if (isCollection) {
                        // eslint-disable-next-line rulesdir/prefer-actions-set-data
                        Onyx.merge(onyxKey, {[idSelector(data)]: null});
                    } else {
                        // eslint-disable-next-line rulesdir/prefer-actions-set-data
                        Onyx.set(onyxKey, null);
                    }
                    Navigation.goBack();
                }}
            />
        </ScrollView>
    );
}

DebugDetails.displayName = 'DebugDetails';

export default DebugDetails;
