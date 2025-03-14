import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  GestureResponderEvent,
  Button,
  ScrollView,
  Pressable,
  Share,
} from "react-native";
import {
  clearDatabase,
  getDBConnection,
  getPerformanceData,
  getTemplateState,
  initDefaultData,
  setTemplateState,
} from "../services/db-service";
import TopNavigation from "../components/TopNavigation";
import * as Icon from "react-native-feather";
import { PerformanceData } from "../services/models";
import { useFocusEffect } from "@react-navigation/native";

export default function Settings({ navigation, route }: any) {
  let [loading0, setLoading0] = useState(false);
  let [loading1, setLoading1] = useState(false);
  let [loading2, setLoading2] = useState(false);
  let [restoreDBSuccess, setRestoreDBSuccess] = useState(false);
  let [exportPerformanceSuccess, setExportPerformanceSuccess] = useState(false);
  let [templateStateSuccess, setTemplateStateSuccess] = useState(false);
  let [templateVariant, setTemplateVariant] = useState(0)

  useFocusEffect(
    React.useCallback(() => {
      scrollRef.current?.scrollTo({ x:0, y:0 })
      setLoading0(false);
      setLoading1(false);
      setLoading2(false);
      setRestoreDBSuccess(false);
      setExportPerformanceSuccess(false);
      setTemplateStateSuccess(false);
    }, [])
  );

  const loadDataCallback = useCallback(async () => {
    const db = getDBConnection();
    const state:number = await getTemplateState(db);
    setTemplateVariant(state);
  }, []);

  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);

  async function restoreDBButton(event: GestureResponderEvent): Promise<void> {
    setRestoreDBSuccess(false);
    setLoading0(true);
    const db = getDBConnection();
    clearDatabase(db);
    initDefaultData(db);
    setTimeout(() => {
      setLoading0(false);
      setRestoreDBSuccess(true);
    }, 1000);
  }
  async function exportPerformanceData(
    event: GestureResponderEvent
  ): Promise<void> {
    setExportPerformanceSuccess(false);
    setLoading1(true);
    //export data here
    const db = getDBConnection();
    const exportData: PerformanceData[] = await getPerformanceData(db);
    const exportArrays = [["-1",exportData[0].time.toString(), exportData[0].scroll.toString(),"-1"],["-1",exportData[1].time.toString(), exportData[1].scroll.toString(),"-1"]]
    const exportString = "ID,Variant,Time,Scroll,Errors \n" + exportArrays[0].join(",") + "\n" + exportArrays[1].join(",")
    console.log(exportArrays)
    setTimeout(async () => {
      setLoading1(false);
      setExportPerformanceSuccess(true);
      try {
        const result = await Share.share({
          message: exportString,
        });
      } catch (error: any) {
        console.log(error);
      }
      console.log("Export done.");
    }, 1000);
  }

  async function changeTemplateVariant(
    event: GestureResponderEvent
  ): Promise<void> {
    setTemplateStateSuccess(false);
    setLoading2(true);
    //export data here
    const db = getDBConnection();
    setTemplateState(db,Math.abs(templateVariant-1))
    setTimeout(async () => {
      setLoading2(false);
      setTemplateStateSuccess(true);
      setTemplateVariant(Math.abs(templateVariant-1))
      console.log("Template state change done.");
    }, 1000);
  }

  const scrollRef = useRef<ScrollView>(null);

  return (
    <ScrollView style={styles.container} ref={scrollRef}>
      <TopNavigation
        navigation={navigation}
        title={"Settings"}
        color={"#000000"}
      />
      <View style={{marginHorizontal:20}}>
      <Text>{"\n"}</Text>

      <Pressable style={styles.button} onPress={restoreDBButton}>
        <Text style={styles.buttonText}>Restore Database To Default State</Text>
        {loading0 && <Icon.Loader stroke={"#ffff"} />}
        {restoreDBSuccess && <Icon.CheckCircle stroke={"#008000"} />}
      </Pressable>

      <Text>{"\n"}</Text>
      <Pressable style={styles.button} onPress={exportPerformanceData}>
        <Text style={styles.buttonText}>Export Performance Data</Text>
        {loading1 && <Icon.Loader stroke={"#ffff"} />}
        {exportPerformanceSuccess && <Icon.CheckCircle stroke={"#008000"} />}
      </Pressable>

      <Text>{"\n"}</Text>
      <Pressable style={styles.button} onPress={changeTemplateVariant}>
        { templateVariant == 1 && <Text style={styles.buttonText}>Change Template View to a Grid (A)</Text>}
        { templateVariant == 0 && <Text style={styles.buttonText}>Change Template View to a List (B)</Text>}
        {loading2 && <Icon.Loader stroke={"#ffff"} />}
        {templateStateSuccess && <Icon.CheckCircle stroke={"#008000"} />}
      </Pressable>
      

      <Text>{"\n"}</Text>
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
    flex: 1,
  },
  buttonText: {
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
