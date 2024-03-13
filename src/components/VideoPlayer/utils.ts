// Converts milliseconds to '[hours:]minutes:seconds' format
const convertMillisecondsToTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds / 60000) % 60);
    const seconds = Math.floor((milliseconds / 1000) % 60)
        .toFixed(0)
        .padStart(2, '0');
    return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`;
};

export default convertMillisecondsToTime;
