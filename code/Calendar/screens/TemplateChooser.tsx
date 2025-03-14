import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from "react-native";

import TopNavigation from "../components/TopNavigation";

export default function TemplateChooser({ navigation, route }: any) {

  return (
    <ScrollView>
      <TopNavigation
        navigation={navigation}
        title={"Choose template view"}
        color={"#000000"}
      />

      <View style={styles.container}>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("Templates List")}
        >
          <Text style={styles.buttonText}>List View</Text>
        </Pressable>

        <Text>{"\n"}</Text>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("Templates Grid")}
        >
          <Text style={styles.buttonText}>Grid View</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headStyle: {
    height: 30,
    width: 500,
    backgroundColor: "#ffe3f0",
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderRadius: 50,
    elevation: 10,
    backgroundColor: "black",
  },

  container: {
    marginTop: "60%",
    display: "flex",
    alignContent: "center",
    justifyContent:"center",
    marginHorizontal: 50,
  },
  buttonText: {
    fontSize: 30,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
