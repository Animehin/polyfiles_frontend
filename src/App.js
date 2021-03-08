import './App.css';
import React from 'react'
import {post} from 'axios';
// import {useCookies} from "react-cookie";

class App extends React.Component {
    // cokie;
    //
    // doCookie() {
    //     this.cokie = setCookie(name, value, [options])
    // }

    bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        if (i === 0) return bytes + ' ' + sizes[i];
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    }

    constructor(props) {
        super(props);
        this.state = {
            file: null,
            upload_response: null,
            error_message: '',
            button_state: false
        }
        this.onFormSubmit = this.onFormSubmit.bind(this)
        this.onChange = this.onChange.bind(this)
        this.fileUpload = this.fileUpload.bind(this)
    }

    onFormSubmit(e) {
        e.preventDefault() // Stop form submit
        // console.log(e.status);
        this.fileUpload(this.state.file).then((response) => {
            this.setState({upload_response: response.data})
            console.log(response.headers)
            this.setState({error_message: ""})
        }).catch(error => this.setState({error_message: error.message}));
    }

    onChange(e) {
        try {
            if (e.target.files[0].size <= 20 * 1024 * 1024) {
                this.setState({file: e.target.files[0]})
                this.setState({error_message: ""})
                this.setState({button_state: true})
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
        const url = 'http://localhost:8080/upload';
        const formData = new FormData();
        formData.append('file', file)
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        }
        return post(url, formData, config)
    }

    render() {
        const {upload_response} = this.state;
        return (
            <form onSubmit={this.onFormSubmit}>
                <h1>File Upload</h1>
                <input type="file" onChange={this.onChange}/>
                {this.state.file && <div>File name: {this.state.file.name}</div>}
                {this.state.file && <div>File size: {this.bytesToSize(this.state.file.size)}</div>}
                <button type="upload" disabled={!this.state.button_state}>Upload</button>
                <div>Response: {upload_response}</div>
                <button type="download">Download</button>
                <button type="change">Change file</button>
                {this.state.error_message &&
                <h3 className="error" style={{color: "red"}}> {this.state.error_message} </h3>}
            </form>
        );
    }
}

export default App;
