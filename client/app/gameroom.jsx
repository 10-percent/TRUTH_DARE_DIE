import React from 'react';
import axios from 'axios';
import { WebcamCapture } from './recorder.jsx';
import styled from 'styled-components';

const Title = styled.h1`
  font-family: Nosifer;
  font-size: 26px;
  color: black;
  margin-top: 4%
`;

// const Div = styled.div`
//   margin-top: 5%;
//   margin-bottom: 1em;
//   float: right;
// `;

const Chat = styled.h1`
  font-size: 26px;
  padding-left: 6%
`;

const User = styled.li`
  color: white;
  font-size: 30px;
  list-style-type: none;
  float: left;
  display: block;
  text-align: center;
  padding: 14px 16px;
`;

const Deaths = styled.li`
  color: red;
  font-size: 30px;
  list-style-type: none;
  float: right;
  display: block;
  text-align: center;
  padding: 14px 16px;
  background-color: black;
`;

const Saves = styled.li`
  font-size: 30px;
  list-style-type: none;
  float: right;
  display: block;
  text-align: center;
  padding: 14px 16px;
  background-color: gold;
`;

const Wins = styled.li`
  font-size: 30px;
  list-style-type: none;
  float: right;
  display: block;
  text-align: center;
  padding: 14px 16px;
  background-color: white;
`;


const TopBar = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: gray;
  overflow: hidden;
  position: fixed;
  top: 0;
  width: 100%;
`;

const Section = styled.form`
  float: left;
  padding-left: 6%;
  padding-right: 6%
`;

const Message = styled.div`
  list-style-type: none;
  font-size: 22px
`;

const Input = styled.input`
    padding:5px 15px; 
    border:1px solid black;
    width: 200px;
    padding-bottom: 8px;
    padding-top: 8px;
    padding-right: 4px;
    height: 50%
    font-size: 20px;
    -webkit-border-radius: 5px;
    border-radius: 5px; 
`;

const Button = styled.button`
  background-color: black;
  border: none;
  color: white;
  padding: 16px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  border-radius: 12px
`;

class GameRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      messageHistory: [],
      truth: '',
      alive: true,
      currentUsersTurnDisplay: '',
      currentUsersTurn: false
    };
    // bind function to send messages and truth answer to component
    this.userSendVideo = this.userSendVideo.bind(this);
    this.userSendMessage = this.userSendMessage.bind(this);
    this.userSelectDare = this.userSelectDare.bind(this);
    this.userSelectTruth = this.userSelectTruth.bind(this);
  }
  componentDidMount() {
    this.props.socket.on('sentMessage', (message) => {
      this.setState({ messageHistory: [...this.state.messageHistory, message] });
    });
    this.props.socket.on('this-user-turn', (message) => {
      this.setState({
        currentUsersTurnDisplay: message,
        currentUsersTurn: true
      }, () => {
        console.log(message, 'message from this-user-turn');
        console.log(this.state);
      });
    });
    this.props.socket.on('user-turn', (message) => {
      this.setState({
        currentUsersTurnDisplay: message,
        currentUsersTurn: false
      }, () => {
        console.log(message, 'message from this-user-turn');
        console.log(this.state);
      });
    });
  }
  userSendMessage(event) {
    const message = `${this.props.userInfo.username}: ${event.target.sendMessage.value}`;
    if (this.state.messageHistory.length >= 15) {
      const messages = this.state.messageHistory;
      messages.splice(0, 1);
      messages.push(message);
      this.setState({ messageHistory: messages }, () => {
        this.props.socket.emit('sendMessage', message);
      });
      event.preventDefault();
    } else {
      this.setState({ messageHistory: [...this.state.messageHistory, message] }, () => {
        this.props.socket.emit('sendMessage', message);
      });
      event.preventDefault();
    }
  }
  userSelectTruth(e) {
    axios.get('/truths').then(({ data }) => {
      this.setState({ truth: data });
    }).catch((error) => {
      console.log(error);
    });
    this.props.socket.emit('truth');
    e.preventDefault();
  }
  userSelectDare(e) {
    axios.get('/dares').then(({ data }) => {
      this.setState({ truth: data });
    }).catch((error) => {
      console.log(error);
    });
    this.props.socket.emit('dare');
    e.preventDefault();
  }
  userSendVideo(video) {
    console.log(video.get('file'));
    axios.post('/video', video)
      .then((result) => {
        console.log(result);
      }).catch((err) => {
        console.log(err);
      });
  }
  userSelectPass(e) {
    axios.post('/votes', { vote: 'pass' })
      .then((result) => {
        console.log(result);
      }).catch((err) => {
        console.log(err);
      });
    e.preventDefault();
  }
  userSelectFail(e) {
    axios.post('/votes', { vote: 'fail' })
      .then((result) => {
        console.log(result);
      }).catch((err) => {
        console.log(err);
      });
    e.preventDefault();
  }
  userStartGame(e) {
    axios.post('/room', {
      room: this.props.roomname
    });
    e.preventDefault();
  }
  render() {
    const { username } = this.props.userInfo;
    const messageList = this.state.messageHistory.map(message => <li key={message}>{message}</li>);
    const truthOrDare = (
      <div>
        <Button type="submit" name="truth" onClick={(e) => { this.userSelectTruth(e); }}>TRUTH</Button>
        <Button type="submit" name="dare" onClick={(e) => { this.userSelectDare(e); }}>DARE</Button>
      </div>);
    const passOrFail = (
      <div>
        <Button type="submit" name="pass" onClick={(e) => { this.userSelectPass(e); }}>PASS</Button>
        <Button type="submit" name="fail" onClick={(e) => { this.userSelectFail(e); }}>FAIL</Button>
      </div>);
    return (
      <div>
        <TopBar className="userInfo">
          <User>
            {this.props.admin ? (
              <div>
                <Button
                  type="submit"
                  name="start"
                  onClick={(e) => {
                    this.userStartGame(e);
                    e.preventDefault();
                  }}
                >START
                </Button>
              </div>
            ) : (<div />)
            }
          </User>
          <User>Stay Alive {username}</User>
          <Saves>Saves: {this.props.userInfo.save_tokens}</Saves>
          <Deaths>Deaths: {this.props.userInfo.death_tokens}</Deaths>
          <Wins>Wins: {this.props.userInfo.win_tokens}</Wins>
        </TopBar>
        <Title>Welcome to {this.props.roomname}</Title>
        <Chat htmlFor="chatRoom">
          Chats
        </Chat>
        <Section onSubmit={(e) => {
            this.userSendMessage(e);
            e.preventDefault();
          }}
        >
          <Input type="text" name="sendMessage" />
          <Input type="submit" value="Send" />
          <Message className="chatroom">{messageList}</Message>
        </Section>
        <Section>
          <div>
            {this.state.currentUsersTurn ? (truthOrDare) : (passOrFail)}
            {this.state.truth ? this.state.truth : this.state.dare}
          </div>
          <iframe title="webChat" src="https://tokbox.com/embed/embed/ot-embed.js?embedId=8c5d069b-b5fb-458e-81fe-b2a7dcd20555&room=DEFAULT_ROOM&iframe=true" width="800" height="640" allow="microphone; camera" />
        </Section>
      </div>
    );
  }
}

export { GameRoom };
