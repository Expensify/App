import {useEffect, useRef, useState} from 'react';
import {Dimensions} from 'react-native';
import useSafeAreaInsets from './useSafeAreaInsets';
import useThemeStyles from './useThemeStyles';
import useWindowDimensions from './useWindowDimensions';

// Useful when there's a need to hide the submit button from FormProvider,
// to let form content fill the page when virtual keyboard is shown
function useSubmitButtonVisibility() {
    const styles = useThemeStyles();
    const {windowHeight, isSmallScreenWidth} = useWindowDimensions();
    const [isSubmitButtonVisible, setIsSubmitButtonVisible] = useState(true);
    const initialWindowHeightRef = useRef(windowHeight);
    const isSmallScreenWidthRef = useRef(isSmallScreenWidth);
    const {bottom} = useSafeAreaInsets();

    // Web: the submit button is shown when the height of the window is the same or greater,
    // otherwise it's hidden
    useEffect(() => {
        const dimensionsListener = Dimensions.addEventListener('change', ({window}) => {
            if (!isSmallScreenWidthRef.current) {
                return;
            }

            if (window.height < initialWindowHeightRef.current) {
                setIsSubmitButtonVisible(false);
                return;
            }

            setIsSubmitButtonVisible(true);
        });

        return () => dimensionsListener.remove();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Web: the submit button is only shown when the window height is the same or greater,
    // so executing this function won't do anything
    const showSubmitButton = () => {};

    // Web: the submit button is only hidden when the window height becomes smaller,
    // so executing this function won't do anything
    const hideSubmitButton = () => {};

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
