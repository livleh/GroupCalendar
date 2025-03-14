import * as React from "react";
import { StyleProp, ImageStyle } from "react-native";
import { Image } from 'expo-image';

interface ProfilePictureProps {
    userId: string;
    style?: StyleProp<ImageStyle>;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({userId,style}) => {
  let imagePath: number;
  // hardcoded images here
  switch (userId){
    case 'a34i1':
      imagePath = require(`../assets/profile-picture1.png`);
      break;
    case 'a52d3':
      imagePath = require(`../assets/profile-picture2.png`);
      break;
    case 'a24i6':
      imagePath = require(`../assets/profile-picture3.png`);
      break;
    case 'a32c9':
      imagePath = require(`../assets/profile-picture4.png`);
      break;
    default:
      imagePath = require(`../assets/default-profile-picture.png`);
  }
  return(
    // sry no idea how to stop type error
    <Image
          source={imagePath}
          style={style}
    />
  )
}

export default ProfilePicture