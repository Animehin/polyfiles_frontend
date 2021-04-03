import React, { Component } from "react";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";

class CookiesHandler extends Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    state = {
        user: this.props.cookies.get("user") || ""
    };

    handleSetCookie = () => {
        const { cookies } = this.props;
        cookies.set("user", "obydul", { path: "/" }); // set the cookie
        this.setState({ user: cookies.get("user") });
        // console.log("BIBA");
        // console.log(lel);
    };

    handleRemoveCookie = () => {
        const { cookies } = this.props;
        cookies.remove("user"); // remove the cookie
        this.setState({ user: cookies.get("user") });
    };

    render() {
        const { user } = this.state;
        return (
            <div className="App">
                <h1>React Cookie</h1>
                <p>{user}</p> {/* access the cookie */}
                <button onClick={this.handleSetCookie}>{}Set Cookie</button>
                <button onClick={this.handleRemoveCookie}>Remove Cookie</button>
            </div>
        );
    }
}

export default withCookies(CookiesHandler);
