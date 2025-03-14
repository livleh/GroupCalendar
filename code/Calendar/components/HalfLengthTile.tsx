import { View, Text, ViewStyle, StyleProp, Image, Dimensions } from 'react-native';
import React, { ReactNode } from 'react';
import ProfilePicture from './ProfilePicture';

interface HalfLengthTileProps {
    children: ReactNode;
    title?: string;
    style?: StyleProp<ViewStyle>;
    profiles?: string[];
  }
  const windowWidth = Dimensions.get('window').width;
  const halfwindowWidth = 0.45*windowWidth;
  const marginwindowWidth = 0.025*windowWidth;
  
  const HalfLengthTile: React.FC<HalfLengthTileProps> = ({children,title,style,profiles=[]}) => {
    return(
      <View style={[{backgroundColor:'#f5f5f5',height:halfwindowWidth, width:halfwindowWidth, marginLeft:marginwindowWidth, borderRadius:20, shadowColor:'#000000', shadowOffset:{width:0, height:4}, shadowOpacity: 0.25, shadowRadius:4, elevation:5, paddingVertical:20, paddingHorizontal:15},style]}>
        <View style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignContent:'center' }}>
            <View style={{width:`${100- 10*(profiles.length+1)}%`}}>
              <Text numberOfLines={2} ellipsizeMode="tail" style={{fontWeight:'600', fontSize: 1.8 * marginwindowWidth}} >{ title }</Text>
            </View>
            <View style={{display:'flex', flexDirection:'row'}}>
              {profiles.length > 0 ? profiles.map((profile, index) => (
              <ProfilePicture
                userId={profile}
                key={index}
                style={{
                  height: 30,
                  width: 30,
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: '#000000',
                  marginRight: index === profiles.length - 1 ? 0 : -15
                }} /> )): (<></>) }
            </View>
        </View>
            {children}
        </View>
    )
  }

export default HalfLengthTile