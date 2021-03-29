import {BrowserRouter as Router, Route, Switch, useLocation, useParams} from "react-router-dom";
import React, {Fragment} from "react";
import App from './App';
import "./RouterApp.css"
import DownloadFile from "./DownloadFile";

class RouterApp extends React.Component {
    render() {
        return (
            <div className="main">
                <Router>
                    <main>
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                            <Switch>
                                <Route exact strict path="/" component={Home}/>
                                <Route exact strict path="/contact" component={Contact}/>
                                <Route exact strict path="/files/:id" component={Files}/>
                                <Route>
                                    <NoMatch/>
                                </Route>
                            </Switch>
                        </div>
                    </main>
                </Router>
            </div>
        )
    }

}

const Home = () => (
    <Fragment>
        <App/>
    </Fragment>
);

function NoMatch() {
    let location = useLocation();

    return (
        <div>
            <h3>
                No match for <code>{location.pathname}</code>
            </h3>
        </div>
    );
}

const Contact = () => {
    const {pathname} = useLocation();

    return (
        <div>
            <Fragment>
                <h1>Contact</h1>
                <h2>Call me +78005553535</h2>
                <h3>Current URL: {pathname}</h3>
            </Fragment>
        </div>
    )
};

const Files = () => {
    const {id} = useParams();

    return (
        <div className="main">
            <div>
                <h2>Current id: {id}</h2>
                <DownloadFile id={id} />
            </div>
        </div>
    )
};

export default RouterApp;
