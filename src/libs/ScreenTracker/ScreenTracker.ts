import { useRef, useState } from "react";
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import Firebase from '@libs/Firebase'


export default function track(): void {
    const [currentScreen, setCurrentScreen] = useState("");
    Navigation.isNavigationReady().then(() => {

        // Get initial route
        if (navigationRef.current === null) {
            return;
        }
        const initialRoute = navigationRef.current.getCurrentRoute();
        setCurrentScreen(initialRoute.name);
        Firebase.trackScreen(initialRoute.name);
        navigationRef.current.addListener('state', (event) => {
            const newScreenName = Navigation.getRouteNameFromStateEvent(event);
            if (newScreenName === currentScreen) {
                return;
            }
            setCurrentScreen(newScreenName);
            Firebase.trackScreen(newScreenName);
        });
    });
}