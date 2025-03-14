import { StyleSheet, Text, View, Image } from 'react-native';

export default function Menu(){
  return(
    <View style={styles.container}>
      <Text>Test</Text>
    </View>
  )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
      },
});