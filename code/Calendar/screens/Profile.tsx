import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";

import FullLengthTile from "../components/FullLengthTile";
import TopNavigation from "../components/TopNavigation";
import React = require("react");
import { useCallback, useEffect, useState } from "react";
import { User } from "../services/models";
import { getCurrentUser, getFriends, getDBConnection } from "../services/db-service";
import ProfilePicture from "../components/ProfilePicture";

// @ts-ignore
export default function Profile({ navigation }) {
  const windowWidth = Dimensions.get("window").width;
  const windowWidth45 = windowWidth * 0.45;
  const halfwindowWidth45 = windowWidth45 * 0.5;

  let [friends, setFriends] = useState<string[]>([])

  let [currentUser, setCurrentUser] = useState<User>({
    id: "",
    name: "",
    profilePicPath: "",
  });

  const loadDataCallback = useCallback(async () => {
    const db = getDBConnection();
    const user = await getCurrentUser(db);
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);

  useEffect(() => {
    const db = getDBConnection();
    getFriends(db, currentUser.id).then((results) => {setFriends(results)});
  }, [currentUser])

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <View style={{ backgroundColor: "#000000", height: "25%" }}>
        <TopNavigation
          navigation={navigation}
          title={"Profile"}
          color={"#ffffff"}
        />
      </View>
      <View
        style={{
          backgroundColor: "#ffffff",
          height: "75%",
          borderRadius: 20,
          alignItems: "center",
        }}
      >
        <ProfilePicture
          userId={currentUser.id}
          style={{
            height: windowWidth45,
            width: windowWidth45,
            borderRadius: halfwindowWidth45,
            borderWidth: 1,
            borderColor: "#000000",
            marginTop: -halfwindowWidth45,
          }}
        />
        <Text style={{ marginTop: 20, fontWeight: "700", fontSize: 20 }}>
          {currentUser.name}
        </Text>
        <View
          style={{
            flex: 1,
            width: "100%",
            alignItems: "center",
            marginTop: 20,
            marginBottom: 60,
          }}
        >
          <FullLengthTile title={`Friends (${friends.length})`}>
            <View style={{ flexDirection: "row", marginTop:15 }}>
            {friends.map((profile, index) => (
              <ProfilePicture
                userId={profile}
                key={index}
                style={{
                  height: 50,
                  width: 50,
                  borderRadius: 40,
                  borderWidth: 2,
                  borderColor: "#ffffff",
                  marginLeft: 10,
                }}
            /> ))}
              
            </View>
          </FullLengthTile>
        </View>
      </View>
    </View>
  );
}
