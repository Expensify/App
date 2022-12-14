/**
 * For native Android devices, if an input is focused while an animation is happening, then they keyboard is not displayed. Delaying the focus until after the animation is done will ensure
 * that the keyboard opens properly.
 *
 * @param {Object} inputRef
 * @param {Number} animationLength you must use your best guess as to what a good animationLength is. It can't be too short, or the animation won't be finished. It can't be too long or
 *      the user will notice that it feels sluggish
 */
const focusTextInputAfterAnimation = (inputRef, animationLength = 0) => {
    // This setTimeout is necessary because there are some animations that are just impossible to listen to in order to determine when they are finished (like when items are added to
    // a FlatList).
    setTimeout(() => {
        inputRef.focus();
    }, animationLength);
};

export default focusTextInputAfterAnimation;
