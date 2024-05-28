import {useState} from 'react';
import useSafeAreaInsets from './useSafeAreaInsets';
import useThemeStyles from './useThemeStyles';

// Useful when there's a need to hide the submit button from FormProvider,
// to let form content fill the page when virtual keyboard is shown
function useSubmitButtonVisibility() {
    const styles = useThemeStyles();
    const [isSubmitButtonVisible, setIsSubmitButtonVisible] = useState(true);
    const {bottom} = useSafeAreaInsets();

    const showSubmitButton = () => {
        setIsSubmitButtonVisible(true);
    };

    const hideSubmitButton = () => {
        setIsSubmitButtonVisible(false);
    };

    // When the submit button is hidden there's a need to manually
    // add its bottom style to the FormProvider style prop,
    // otherwise the form content will touch the bottom of the page/screen
    const formStyle = !isSubmitButtonVisible && bottom === 0 && styles.mb5;

    return {
        isSubmitButtonVisible,
        showSubmitButton,
        hideSubmitButton,
        formStyle,
    };
}

export default useSubmitButtonVisibility;
