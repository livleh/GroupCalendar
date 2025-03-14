import { StyleSheet, Text, View, Image } from 'react-native';

export default function TitleBar (){
  const userName = 'Lea';
  var dayTime = (new Date().getHours()) < 12 ? 'morning' : 'afternoon';
  return (
      <View style={styles.container}>
          <Text style={styles.title}> Good {dayTime}, {userName}! </Text>
          <View style={styles.profile}><Image source={require('../assets/icon.png')} style= {styles.profilePic} /></View>
      </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
      }, 
    title: {
        flex: 6,
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'left',
        textAlignVertical: 'center',
        paddingLeft: 10,
      },
      profile: {
        flex: 1,
        alignContent: 'flex-end',
        paddingRight: 10,
        justifyContent: 'center',
      },
      profilePic: {
        width: 50,
        height: 50,
      },
});