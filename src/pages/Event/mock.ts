const MOCK_EVENTS = Array.from({ length: 20 }, (_, index) => {
    const startDate = 1753300046869 + index * 86400000; // base start date + 1 day per event
    const event = {
        id: index.toString(),
        name: `Event ${index}`,
        startDate: startDate.toString(),
        endDate: '',
        thumbnail: 'https://cdn.encoreglobal.com/wp-content/uploads/sites/5/2020/08/27003811/styling-theming-enchanted-forest.jpg',
    };

    /** In the task it says, that sometimes there are no endDate */
    if (Math.random() > 0.5) {
        const duration = Math.floor(Math.random() * 3 + 1) * 86400000; // 1 to 3 days
        event.endDate = (startDate + duration).toString();
    }

    return event;
});

export default MOCK_EVENTS;