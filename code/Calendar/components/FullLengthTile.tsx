import { View, Text, ViewStyle, StyleProp, Image } from 'react-native';
import React, { ReactNode } from 'react';
import ProfilePicture from './ProfilePicture';

interface FullLengthTileProps {
    children: ReactNode;
    height?: number | string;
    title?: string;
    style?: StyleProp<ViewStyle>;
    profiles?: string[];
  }
  
  const FullLengthTile: React.FC<FullLengthTileProps> = ({children,height,title,style,profiles=[]}) => {
    return(
      <View style={[{backgroundColor:'#f5f5f5',height:height,width:'84%', marginHorizontal:'8%', borderRadius:20, shadowColor:'#000000', shadowOffset:{width:0, height:4}, shadowOpacity: 0.25, shadowRadius:4, elevation:5, padding:20},style]}>
        <View style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignContent:'center', width:'100%' }}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={{fontWeight:'600', fontSize:16}} > {title} </Text>
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

export default FullLengthTile