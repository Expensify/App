// height percent calculation based on font scale
const hp = (percentage: number, screenHeight: number, fontScale: number) => {
    const value = percentage;
    return (screenHeight * (value + fontScale)) / 100;
};

const flexDistributionPercentCalculation = (screenHeight: number, fontScale: number, restHeightPercent: number, buttonHeightPercent: number, flexRelativeDistributionInContainer: number) => {
    const restHeight = hp(restHeightPercent, screenHeight, fontScale); // the rest height should be 70% of the screen height
    const buttonHeight = hp(buttonHeightPercent, screenHeight, fontScale); // next button height should be 10% of the screen height
    const containerHeight = restHeight + buttonHeight; // The total height should be the rest plus button container in percent

    // The button height and offline indicator should be the same percent in the flex container distribution
    const flexTotalHeightPercentButton = (buttonHeight / containerHeight) * flexRelativeDistributionInContainer;
    const offlineIndicatorFlexPercentReserved = flexTotalHeightPercentButton;
    // We should reserve the offline indicator height to avoid the bug
    const flexTotalHeightPercentRest = (restHeight / containerHeight) * flexRelativeDistributionInContainer - offlineIndicatorFlexPercentReserved;

    return {flexTotalHeightPercentRest, flexTotalHeightPercentButton};
};

export default flexDistributionPercentCalculation;
