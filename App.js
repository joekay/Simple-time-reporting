import React from 'react';
import { StyleSheet, Text, View, StatusBar, ListView} from 'react-native';
import { Container, Content, Header, Form, Input, Icon, Item, Button, List, ListItem, Footer } from 'native-base'
import * as firebase from 'firebase';
import moment from 'moment';

const firebaseConfig = {
  apiKey: "AIzaSyBGxD14KqAv5aPxKGRFYizfJAw6GnBqo7M",
  authDomain: "tidrapportering-8ce05.firebaseapp.com",
  databaseURL: "https://tidrapportering-8ce05.firebaseio.com",
  projectId: "tidrapportering-8ce05",
  storageBucket: "tidrapportering-8ce05.appspot.com",
  messagingSenderId: "848435043689"
};

firebase.initializeApp(firebaseConfig);

var data = []
var sumHours = 0

export default class App extends React.Component {

  constructor(props) {

    super(props)
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })

    this.state = {
      listViewData: data,
      newTimeLog: ""
    }
  }

  componentDidMount() {

    var previous = this
    var inputObject = this.refs.input
    sumHours = 0

    firebase.database().ref('/dates').on('child_added', function (data) {
      var newData = [...previous.state.listViewData]
      newData.push(data)
      sumHours += parseInt(data.val().hours)
      previous.setState({ listViewData: newData })
    })

  }

  addDate(data) {
    var key = firebase.database().ref('/dates').push().key
    firebase.database().ref('/dates').child(key).set({ date: moment().format('L'), hours: data })
  }

  async deleteDate(secId, rowId, rowMap, data) {
    sumHours -= data.val().hours;
    await firebase.database().ref('dates/' + data.key).set(null)

    rowMap[`${secId}${rowId}`].props.closeRow();
    var newData = [...this.state.listViewData];
    newData.splice(rowId, 1)
    this.setState({ listViewData: newData });
  }

  render() {
    return (
      <Container style={styles.container}>
        <Header style={{ marginTop: StatusBar.currentHeight }}>
            <Item style={{ flex: 1, marginTop: 10}}>
              <Text>Tidrapportering</Text>
            </Item>
            <Item style={{marginTop: 10}}>
              <Text>Antal timmar totalt: {sumHours}</Text>
            </Item>
        </Header>

        <Content>
          <Item style={{marginBottom:10}}>
              <Input id="input" ref="input"
                onChangeText={(newTimeLog) => this.setState({ newTimeLog })}
                placeholder="Hur många timmar har du jobbat idag?"
              />
              <Button success onPress={() => this.addDate(this.state.newTimeLog)}>
                <Icon name="add" />
              </Button>
          </Item>
          <List
            enableEmptySections = {true}
            dataSource={this.ds.cloneWithRows(this.state.listViewData)}
            renderRow={data =>
              <ListItem>
                <Text> Datum: {data.val().date} Timmar: {data.val().hours}</Text>
              </ListItem>
            }
            renderRightHiddenRow={(data, secId, rowId, rowMap) =>
              <Button full danger onPress={() => this.deleteDate(secId, rowId, rowMap, data)}>
                <Text>Ta bort</Text>
              </Button>
            }
            rightOpenValue={-75}
          />
        </Content>

        <Footer style={{ marginTop: StatusBar.currentHeight }}>
        </Footer>

      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
