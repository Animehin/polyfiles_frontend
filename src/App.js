import './App.css';
import React from 'react'
import {post} from 'axios';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            file: null,
            upload_response: null,
            error_message: ''
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
            this.setState({error_message: ""})
        }).catch(error => this.setState({error_message: error.message}));
    }

    onChange(e) {
        if (e.target.files[0].size <= 20*1024*1024) {
            this.setState({file: e.target.files[0]})
            this.setState({error_message: ""})
        } else this.setState({error_message: "File size cannot exceed 20MB"})
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
                <button type="upload">Upload</button>
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
