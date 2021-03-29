import React from "react";
import "./DownloadFile.css"
import {get, post} from "axios";

const URL = "http://localhost:8080/get/"

class DownloadFile extends React.Component {

  setPassword(pass) {
    this.setState({password: pass.target.value.replace(" ", "")})
  }

  constructor(props) {
    super(props)
    this.state = {
      passwordNeeded: false,
      id: props.id,
      password: ""
    }
    this.setPassword = this.setPassword.bind(this)
    this.checkIfPassNeeded()
  }

  checkIfPassNeeded() {
    // console.log(this.props.id)
    return get('http://localhost:8080/getStats/' + this.props.id).then((response) => {
      this.state.passwordNeeded = response.data["protected"]
      console.log(response.data["protected"])
      console.log("tate= " + this.state.passwordNeeded)
      this.forceUpdate()
      this.renderPass()
    })
  }

  downloadFile = () => {
    const url = URL + this.props.id
    const formData = new FormData()
    let config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    if (this.state.password !== "")
      config.headers["password"] = this.state.password
    console.log(this.state.password)
    return post(url, formData, config)
  }

  renderPass() {
    console.log("state1= " + this.state.passwordNeeded)
    if (this.state.passwordNeeded) {
      return (
        <input className="password"
               onChange={this.setPassword}
               value={this.state.password}
               placeholder="Password"
        />
      )
    }
    console.log("state2= " + this.state.passwordNeeded)
  }

  render() {
    this.state.id = this.props.id
    return (
      <form>
        {this.renderPass()}
        <a href={URL + this.props.id}>
          <button type="button" className="fancyButton" onClick={this.downloadFile}>Download</button>
        </a>
        <button type="button" className="fancyButton">Remove</button>
        <button type="button" className="fancyButton">Edit</button>
      </form>
    )
  }
}


export default DownloadFile
