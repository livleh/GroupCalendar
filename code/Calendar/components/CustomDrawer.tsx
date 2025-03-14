import * as React from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import * as Icon from "react-native-feather";
import { useCallback, useEffect, useState } from "react";
import { User } from "../services/models";
import { getCurrentUser, getDBConnection } from "../services/db-service";
import { useFocusEffect } from "@react-navigation/native";

const CustomDrawer = (props?: any) => {
  let [currentUser, setCurrentUser] = useState<User>({
    id: "",
    name: "",
    profilePicPath: "",
  });

  let [templateVariant, setTemplateVariant] =  useState<number>(0)

  const loadDataCallback = useCallback(async () => {
    const db = getDBConnection();
    const user = await getCurrentUser(db);
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);

  
  useFocusEffect(
    React.useCallback(() => {
      console.log("open")
      return () => {
        console.log("closed")
      }
    }, [])
  );

  function returnImage(userId: string): React.ReactNode {
    if (userId == "a32c9") {
      return (
        <Image
          source={require(`../assets/profile-picture4.png`)}
          style={{
            height: 50,
            width: 50,
            borderRadius: 40,
            borderWidth: 2,
            borderColor: "#ffffff",
            marginLeft: 10,
          }}
        />
      );
    } else if (userId == "a24i6") {
      return <Image
        source={require(`../assets/profile-picture3.png`)}
        style={{
          height: 50,
          width: 50,
          borderRadius: 40,
          borderWidth: 2,
          borderColor: "#ffffff",
          marginLeft: 10,
        }}
      />;
    } else if (userId == "a52d3") {
      return <Image
        source={require(`../assets/profile-picture2.png`)}
        style={{
          height: 50,
          width: 50,
          borderRadius: 40,
          borderWidth: 2,
          borderColor: "#ffffff",
          marginLeft: 10,
        }}
      />;
    } else if (userId == "a34i1") {
      return <Image
        source={require(`../assets/profile-picture1.png`)}
        style={{
          height: 50,
          width: 50,
          borderRadius: 40,
          borderWidth: 2,
          borderColor: "#ffffff",
          marginLeft: 10,
        }}
      />;
    } else if (userId == "") {
      return (
        <Image
          source={require(`../assets/default-profile-picture.png`)}
          style={{
            height: 50,
            width: 50,
            borderRadius: 40,
            borderWidth: 2,
            borderColor: "#ffffff",
            marginLeft: 10,
          }}
        />
      );
    }
  }

  const Logout = () =>
    Alert.alert(
      "Log Out",
      "Are you sure, you want to log out? I'm serious, you should be doing other things, like completing the user study!",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#000000", borderRadius: 20 }}>
      <DrawerContentScrollView {...props}>
        <TouchableOpacity onPress={() => props.navigation.navigate("Profile")}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingBottom: 40,
            }}
          >
            {returnImage(currentUser.id)}
            <View style={{ marginLeft: 15 }}>
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 20,
                  fontWeight: "800",
                  marginBottom: 10,
                }}
              >
                {currentUser.name}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View
        style={{ padding: 20, borderBlockColor: "#ffffff", borderTopWidth: 2 }}
      >
        <TouchableOpacity onPress={Logout} style={{ paddingVertical: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon.LogOut stroke={"#ffffff"} style={{ marginLeft: 6 }} />
            <Text
              style={{
                color: "#ffffff",
                paddingLeft: 24,
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Log out
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomDrawer;
