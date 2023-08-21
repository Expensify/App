const convertMillisecondsToTime = (milliseconds) => {
    if (milliseconds <= 0) {
        return '0:00'; // Handle negative input if needed
    }

    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedMinutes = String(minutes);
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
};

export default convertMillisecondsToTime;
