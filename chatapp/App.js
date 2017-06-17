import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  FlatList,
  Keyboard,
 } from 'react-native';
import firebase from 'firebase';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messageLog: [],
      messageText: '',
      loggedUser: '',
      chatId: 'b89b341b-3e58-ba56-7eb1-832d5a4e9ca4',
      messagesArray: [],
      event: { isTyping: false }
    };
  }

  componentWillMount() {
    const config = {
      apiKey: "AIzaSyChnnxSu_rM7VDI5jjUEj25_Ul-0nENlhY",
      authDomain: "chatapp-8a62e.firebaseapp.com",
      databaseURL: "https://chatapp-8a62e.firebaseio.com",
      projectId: "chatapp-8a62e",
      storageBucket: "chatapp-8a62e.appspot.com",
      messagingSenderId: "1034995860228",
    };
    firebase.initializeApp(config);

    this.userSignInHandler();
    this.fetchData();
  }

  idGenerator() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  getChatMessages(chatId) {
    firebase.database().ref(`/messages/${chatId}/`)
    .once('value')
    .then((snapshot) => {
      if (snapshot.val()) {
        let messagesArray = Object.keys(snapshot.val()).map((key) => snapshot.val()[key]).reverse();
        this.setState({ messagesArray });
      }
    });
  }

  fetchData() {
    if (this.state.chatId) {
      firebase.database().ref(`/messages/${this.state.chatId}/`).on('value', (snap) => {
        this.getChatMessages(this.state.chatId)
      });
    } else {
      this.setState({ chatId: this.idGenerator() })
    }
  }

  userSignInHandler() {
    firebase.auth().signInAnonymously().then((user) => {
      if (user) {
        this.setState({ ...this.state, loggedUser: user.uid });
      }
    });
  }

  onTextChange(text) {
    this.setState({ ...this.state, messageText: text });
  }

  pushMessageToFireBase(newMessage) {
    const { key, message, author, date } = newMessage;
    firebase.database().ref(`/messages/${this.state.chatId}/`)
      .push({ key, message, author, date })
      .then(
        this.getChatMessages(this.state.chatId)
      );
  }

  onSendPress() {
    if (this.state.messageText) {
      const message = this.state.messageText;
      const date = new Date();
      const key = this.idGenerator();
      const newMessage = {
        key,
        message,
        author: this.state.loggedUser,
        date,
      };
      const newLog = this.state.messageLog.slice();
      newLog.push(newMessage);

      this.setState({
        ...this.state,
        messageLog: newLog,
        messageText: '', 
      });
      this.pushMessageToFireBase(newMessage);
    }
  }

  renderItem(item) {
    let content;
    if (item.author === this.state.loggedUser) {
      content = <View style={[styles.messageContainer, styles.ownMessageContainer]}>
          <Text style={[styles.message, styles.ownMessage]}>
          {item.message}
        </Text>
      </View>
    } else {
      content = <View style={[styles.messageContainer, styles.friendMessageContainer]}>
        <Text style={[styles.message, styles.friendMessage]}>
          {item.message}
        </Text>
      </View>
    }
    return content;
  }
  render() {
    return (
        <View style={ styles.container }>
          <View style={ styles.header }>
            <Text> Chat App </Text>
          </View>
          <View style={ styles.messagesContainer }>
            <FlatList
              ref='flatList'
              style={ styles.flatList }
              contentContainerStyle={ styles.flatListContentContainer }
              data={this.state.messagesArray}
              renderItem={({item}) => 
                this.renderItem(item)
              }
              keyExtractor={item=>item.key}
            />
          </View>
          <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={0} style={ styles.inputMessageContainer }>
            <TextInput 
              style={ styles.inputMessage } 
              placeholder='Type your message...' 
              autoCorrect
              underlineColorAndroid='transparent'
              placeholderTextColor='#eaeded'
              value={this.state.messageText}
              onChangeText={this.onTextChange.bind(this)}
            />
            <TouchableOpacity onPress={this.onSendPress.bind(this)} style={ styles.sendButton }>
              <Text style={ styles.sendButtonText }>
                Send
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginTop: 30,
  },
  messagesContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ccd1d1',
  },
  flatList: {
    transform: [{ scaleY: -1 }],
  },
  flatListContentContainer: {
    justifyContent: 'flex-start',
    alignContent:'space-between',
  },
  messageContainer: {
    margin: 5,
    minHeight: 50,
    justifyContent: 'center',
    transform: [{ scaleY: -1 }],
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  friendMessageContainer: {
    alignItems: 'flex-start',
  },
  message: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 10,
    textAlign: 'center',
    minWidth: 90,
    justifyContent: 'center',
  },
  ownMessage: {
    borderColor: '#bbebc6',
    backgroundColor: '#abebc6',
  },
  friendMessage: {
    borderColor: '#bcccff',
    backgroundColor: '#ccccff',
  },
  inputMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ccd1d1',
  },
  inputMessage: {
    color: '#000',
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7ca',
    backgroundColor: '#9ca',
    margin: 10,
    height: 50,
    alignSelf: 'flex-end',
    flex: 4,
  },
  sendButton: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#0ca',
    backgroundColor: '#2ca',
    height: 50,
    flex: 1,
    alignSelf: 'flex-end',
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
