import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event) {
    console.log(this.username.value, this.password.value);
    this.setState({
      username: this.username.value,
      email: this.email.value,
      password: this.password.value,
    }, () => {
      axios.post('/users', {
        params: {
          username: this.state.username,
          email: this.state.email,
          password: this.state.password,
        },
      }).then((result) => {
        console.log(result.data);
      }).catch((error) => {
        console.log(error);
      });
    });
    event.preventDefault();
  }
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-xs-10 col-xs-offset-1">
            <form onSubmit={this.handleSubmit}>
              <label htmlFor="username">Username:
                <input type="text" name="username" ref={(input) => { this.username = input; }} />
              </label>
              <br />
              <label htmlFor="email">Email:
                <input type="email" name="email" ref={(input) => { this.email = input; }} />
              </label>
              <br />
              <label htmlFor="password">Password:
                <input type="password" name="password" ref={(input) => { this.password = input; }} />
              </label>
              <button type="submit" >Submit</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById('app'));
