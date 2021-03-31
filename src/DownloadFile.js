import React from "react";
import "./DownloadFile.css"
import {get, post} from "axios";

const URL = "http://localhost:8080/"

const FileDownload = require('js-file-download');

class DownloadFile extends React.Component {

  setPassword(pass) {
    this.setState({password: pass.target.value.replace(" ", "")})
  }

  constructor(props) {
    super(props)
    this.state = {
      passwordNeeded: false,
      id: props.id,
      password: "",
      error_message: '',
      file: null
    }
    this.setPassword = this.setPassword.bind(this)
    this.checkIfPassNeeded()
    this.onChange = this.onChange.bind(this)
  }

  checkIfPassNeeded() {
    // console.log(this.props.id)
    return get('http://localhost:8080/getStats/' + this.props.id).then((response) => {
      this.setState({passwordNeeded: response.data["protected"]})
      // console.log(response.data["protected"])
      // console.log("tate= " + this.state.passwordNeeded)
      this.forceUpdate()
      this.renderPass()
    })
  }

  downloadFile = () => {
    const url = URL + "get/" + this.props.id
    let config = {
      headers: {
      }
    }
    if (this.state.password !== "")
      config.headers["password"] = this.state.password
    return get(url, config).then(r => {
      FileDownload(r.data, r.headers.filename)
      // console.log(url)
      // console.log(r.headers.filename)
    })
  }

  removeFile = () => {

  }

  editFileHandler = () => {
    const url = URL + "update"
    const formData = new FormData()
    formData.append('file', this.state.file)
    let config = {
      headers: {
        'content-type': 'multipart/form-data',
        'id': this.props.id
      }
    }
    // console.log(r.headers.filename)
    if (this.state.password !== "")
      config.headers["password"] = this.state.password
    console.log(url)
    console.log(formData)
    console.log(config)
    return post(url, formData, config).then(r => {
      console.log(r)
    })
  }

  renderPass() {
    // console.log("state1= " + this.state.passwordNeeded)
    if (this.state.passwordNeeded) {
      return (
        <input className="password"
               onChange={this.setPassword}
               value={this.state.password}
               placeholder="Password"
        />
      )
    }
    // console.log("state2= " + this.state.passwordNeeded)
  }

  removeFile = () => {
    const url = URL + "delete/" + this.props.id
    let config = {
      headers: {
      }
    }
    // console.log(r.headers.filename)
    if (this.state.password !== "")
      config.headers["password"] = this.state.password
    console.log(url)
    console.log(config)
    return get(url, config).then(r => {
      console.log(r.data)
    })
  }

  onChange(e) {
    try {
      if (e.target.files[0].size <= 20 * 1024 * 1024) {
        this.setState({file: e.target.files[0]})
        this.setState({error_message: ""})
      } else {
        this.setState({upload_response: null})
        this.setState({error_message: "File size cannot exceed 20MB"})
      }
    } catch (error) {
      this.setState({error_message: "No file chosen"})
      this.setState({file: ""})
      // console.log(error.message)
    }
  }

  render() {
    this.setState({id: this.props.id})
    return (
      <form>
        <div> {this.renderPass()} </div>
        <button type="button" className="fancyButtonD" onClick={this.downloadFile}>Download</button>
        <button type="button" className="fancyButtonD" onClick={this.removeFile}>Remove</button>
        <div>
          <input type="file" onChange={this.onChange} />
          <button type="button" className="fancyButtonD" onClick={this.editFileHandler}>Re-upload File</button>
        </div>
        <div>
          {this.state.error_message &&
          <h3 className="error"> {this.state.error_message} </h3>}
        </div>
      </form>
    )
  }
}


export default DownloadFile
