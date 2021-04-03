import './App.css'
import {post} from 'axios'
import React from "react"
import {instanceOf} from "prop-types"
import {Cookies, withCookies} from "react-cookie"
import {SafeAreaView} from "react-native";

const URL = "http://localhost:3000/"

class App extends React.Component {

  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  }

  state = {
    history: this.props.cookies.get("history") || ""
  }

  onFormSubmit(e) {
    e.preventDefault() // Stop form submit
    this.fileUpload(this.state.file).then((response) => {
      this.setState({upload_response: response.data})
      this.setState({error_message: ""})
      // console.log("response.data.headers")
      // console.log(response.headers)
      if (response.data === undefined) {
        // console.log("something went wrong")
      } else {
        this.updateCookie(response.data)
      }
    }).catch(error => this.setState({error_message: error.message}))
  }

  updateCookie(newElement) {
    let cookies = this.props.cookies.get("history")
    if (cookies === undefined) {
      cookies = {"data": []}
    }
    console.log(cookies.data.length)
    cookies.data[cookies.data.length] = newElement
    console.log(cookies.data.length)
    console.log(newElement)
    console.log(cookies.data)
    this.handleSetCookie(cookies)
  }

  handleSetCookie(cookie) {
    const {cookies} = this.props
    cookies.set("history", cookie, {path: "/"}) // set the cookie
    this.setState({history: cookies.get("history")})
    // console.log("BIBA")
  }

  handleRemoveCookie = () => {
    const {cookies} = this.props
    cookies.remove("history")
    this.setState({history: cookies.get("history")})
    // console.log("BOBA")
  }

  handleCheckboxChange = event =>
      this.setState({checked: event.target.checked})

  bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return 'n/a'
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    if (i === 0) return bytes + ' ' + sizes[i]
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i]
  }

  constructor(props) {
    super(props)
    this.state = {
      file: null,
      upload_response: null,
      error_message: '',
      button_state: false,
      checked: false,
      password: ""
    }
    this.setPassword = this.setPassword.bind(this)
    this.onFormSubmit = this.onFormSubmit.bind(this)
    this.onChange = this.onChange.bind(this)
    this.fileUpload = this.fileUpload.bind(this)
  }

  setPassword(pass) {
    this.setState({password: pass.target.value.replace(" ", "")})
  }

  onChange(e) {
    try {
      if (e.target.files[0].size <= 20 * 1024 * 1024) {
        if (e.target.files[0].size < 1) {
          this.setState({upload_response: null})
          this.setState({error_message: "File size cannot be empty"})
          this.setState({button_state: false})
        } else {
          this.setState({file: e.target.files[0]})
          this.setState({error_message: ""})
          this.setState({button_state: true})
        }
      } else {
        this.setState({upload_response: null})
        this.setState({error_message: "File size cannot exceed 20MB"})
        this.setState({button_state: false})
      }
    } catch (error) {
      this.setState({error_message: "No file chosen"})
      this.setState({file: ""})
      // console.log(error.message)
    }
  }


  fileUpload(file) {
    const url = 'http://localhost:8080/upload'
    const formData = new FormData()
    formData.append('file', file)
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

  renderFileUploaded() {
    return (
        <div>
          <button type="button" className="fancyButton"
                  onClick={() => navigator.clipboard.writeText(
                      URL + 'files/' + this.state.upload_response)}>Copy file link
          </button>
          <a href={'/files/' + this.state.upload_response}>
            <button type="button" className="fancyButton" id="fancyFileUploaded" style={{marginLeft: '.5rem'}}>
              Go to file
            </button>
          </a>
        </div>
    )
  }

  render() {
    const {upload_response} = this.state
    let divResStyle = {
      display: this.state.upload_response ? 'block' : 'none'
    }
    let divUplStyle = {
      display: this.state.upload_response ? 'none' : 'block'
    }
    let divFileChosenStyle = {
      display: this.state.button_state ? 'block' : 'none'
    }
    let divPassStyle = {
      display: this.state.checked ? 'block' : 'none'
    }
    return (
        <form className="App">
          <div style={divUplStyle}>
            <div>
              <h1 style={{color: 'white'}}>File Upload</h1>
            </div>
            <div>
              <input className="file input choose boba" type="file"
                     onChange={this.onChange}/>
            </div>
            <div>
              {this.state.file &&
              <div>File name: {this.state.file.name}</div>}
              {this.state.file &&
              <div>File
                size: {this.bytesToSize(this.state.file.size)}</div>}
            </div>
            <div>
              <div style={divFileChosenStyle}>
                <label>
                  <span>Do you wish to secure file with password?</span>
                  <input type="checkbox"
                         id="PasswordCheckBox"
                         checked={this.state.checked}
                         onChange={this.handleCheckboxChange}
                  />
                </label>
                <div style={divPassStyle}>
                  <SafeAreaView>
                    {/*<input className="password" type="password"*/}
                    <input className="password"
                           id="PasswordInput"
                           onChange={this.setPassword}
                           value={this.state.password}
                           name="file input"
                           placeholder="Password"
                    />
                  </SafeAreaView>
                </div>
              </div>
            </div>
            <button onClick={this.onFormSubmit} name="upload button" className="upload"
                    disabled={!this.state.button_state}>Upload
            </button>
          </div>
          <div style={divResStyle}>
            <div id="response">Response: {upload_response}</div>
            {this.renderFileUploaded()}
          </div>
          <div>
            {this.state.error_message &&
            <h3 className="error" id="error"> {this.state.error_message} </h3>}
          </div>
        </form>
    )
  }
}

export default withCookies(App)
