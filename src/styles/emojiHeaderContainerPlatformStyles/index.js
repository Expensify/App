// This change is only temporary until browser have fixed the issue with position: sticky causing the header to bounce on scroll in non-native apps
// https://github.com/Expensify/App/issues/15282
// https://bugs.chromium.org/p/chromium/issues/detail?id=734461
export default {
    top: -1,
};
