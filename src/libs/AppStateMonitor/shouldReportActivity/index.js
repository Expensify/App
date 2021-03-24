// We only need to report when the app becomes active on native since web maintains most of it's network functions while
// in the "background" and the concept is not quite the same on mobile. We avoid setting this to true for web since
// the event would fire much more frequently than it does on native causing performance issues.
export default false;
