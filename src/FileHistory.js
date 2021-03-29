import {get} from 'axios'
import React from 'react';
import {Cookies, withCookies} from "react-cookie";
import "./FileHistory.css"
import {instanceOf} from "prop-types";
import {RingLoader} from "react-spinners";


class FileHistoryClass extends React.Component {

  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props)
    this.state = {
      history: this.props.cookies.get("history") || "",
      listItems: [],
      listR: [],
      ready: false
    }
    this.ListH()
  }

  ListH() {
    let list = {"data": []}
    let count = 0
    if (this.state.history.data === undefined) {
      return
    }
    const length = this.state.history.data.length
    list.data = this.state.history.data
    for (const element in this.state.history.data) {
      get('http://localhost:8080/getStats/' + this.state.history.data[element]).then((response) => {
        if (response.data === "") {
          list.data.splice(element, 1)
          this.props.cookies.set("history", list, {path: "/"})
          this.setState({history: list})
        } else {
          list.data[element] = {'fileName': response.data['fileName'], 'id': response.data['_id']}
        }
        count += 1
        if (count === length) {
          const listR = [];
          for (const it of list.data) {
            listR.push(<li key={it["id"]}>
              <a href={'/files/' + it["id"]}>
                <button title={it["fileName"]} className="fancyListButton">
                  {it["fileName"]}
                </button>
              </a>
            </li>)
          }
          // console.log(response.data)
          this.setState({listR: listR})
          this.setState({ready: true})
        }
      })
    }
  }

  renderList() {
    // console.log("sss")
    if (this.state.ready) {
      return (
        <ul className="ul">
          {this.state.listR}
        </ul>)
    }
    return (
      <div><RingLoader color={"#ffffff"} loading={true} css={{
        display: "block", margin: "50px auto"
      }} size={50}/></div>)
  }

  render() {
    return (
      <div>
        <div id="mySidenav" className="sidenav">
          <a href={`/`}>
            <button className="fancyButton">Home</button>
          </a>
          <div>
            {this.renderList()}
          </div>
        </div>
      </div>
    )
  }
}

export default withCookies(FileHistoryClass);
