import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

interface MountOptions {
    mountPoint: HTMLElement;
    routingStrategy: RoutingStrategies;
    initialPathName?: string;
}

const Root = ({ routingStrategy, initialPathName }: { routingStrategy: RoutingStrategies, initialPathName: string }) => {
    return (
        <React.StrictMode>
            <App routingStrategy={routingStrategy} initialPathName={initialPathName}/>
        </React.StrictMode>
    )
};

export const mount = ({ mountPoint, routingStrategy , initialPathName = '/' }: MountOptions) => {
    if (mountPoint) {
        ReactDOM.render(<Root routingStrategy={routingStrategy} initialPathName={initialPathName}/>, mountPoint);
    }

    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    reportWebVitals();

    //unmount the app if it is not in use
    return () => {
        if (!mountPoint) {
            ReactDOM.unmountComponentAtNode(mountPoint);
        }
    }
}


