import React from 'react';
import { ImageBackground, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CivilDate, todayVietnam } from '../lib/calendar';
import { villageArtwork } from '../data/artwork';
import { Text } from './Typography';
import { Icon } from './UI';
export function TabArtwork({ date = todayVietnam(), offset = 0 }: { date?: CivilDate; offset?: number }) {
  const art = villageArtwork(date, offset);
  return <ImageBackground source={art.image} imageStyle={{ width: '100%', height: '100%' }} accessibilityLabel={art.title} style={{ height: 145, borderRadius: 22, overflow: 'hidden', justifyContent: 'flex-end' }}>
    <LinearGradient colors={['#173E3400', '#173E3499']} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
    <View style={{ padding: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{art.title}</Text><Icon name="leaf-outline" size={17} color="#fff" /></View>
  </ImageBackground>;
}
