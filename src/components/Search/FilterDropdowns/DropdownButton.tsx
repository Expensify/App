import React, {useMemo} from 'react';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type DropdownButtonProps<T = unknown> = {
    label: string;
    value: string | string[] | null;
    items: Array<Omit<T, 'onChange'>>;
    listItem: React.FC<T>;
    onChange?: () => void;
};

function DropdownButton({label, value, listItem, items, onChange}: DropdownButtonProps) {
    const styles = useThemeStyles();

    const buttonText = useMemo(() => {
        if (!value) {
            return label;
        }

        const valueString = Array.isArray(value) ? value.join(', ') : value;
        return `${label}: ${valueString}`;
    }, [label, value]);

    return (
        <Button small>
            <CaretWrapper style={styles.flex1}>
                <Text style={styles.textMicroBold}>{buttonText}</Text>
            </CaretWrapper>
        </Button>
    );
}

DropdownButton.displayName = 'DropdownButton';
export default DropdownButton;
