import React, {PureComponent} from 'react';
import BaseSidebarScreen from './BaseSidebarScreen';

class SidebarScreen extends PureComponent {
    /**
     * Method create event listener and bind.
     * @param {BaseSidebarScreen} baseComponent
     */
    createDragoverListener= (baseComponent) => {
        this.dragOverListener = this.dragOverListener.bind(baseComponent);
        document.addEventListener('dragover', this.dragOverListener);
    }

    /**
     * Method remove event listener.
     */
    removeDragoverListener= () => {
        document.removeEventListener('dragover', this.dragOverListener);
    }

    /**
     * Method called when dragover events on document.
     */
    dragOverListener() {
        this.hideCreateMenu();
    }

    render() {
        return (
            <BaseSidebarScreen
                afterShowCreateMenu={this.createDragoverListener}
                beforeHideCreateMenu={this.removeDragoverListener}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
            />
        );
    }
}

export default SidebarScreen;
