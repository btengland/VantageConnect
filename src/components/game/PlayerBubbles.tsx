import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import CustomText from '../CustomText';
import { getCharacterColor } from '../../utils';
import { usePlayerStore, Player } from '../../store/playerStore';

type PlayerBubblesProps = {
  players: Player[];
  viewedPlayerId: number | null;
  onSetViewedPlayer: (id: number) => void;
};

const PlayerBubbles = ({
  players,
  viewedPlayerId,
  onSetViewedPlayer,
}: PlayerBubblesProps) => {
  return (
    <View style={styles.sidebar}>
      {players.map(player => (
        <View key={player.id} style={styles.innerSidebar}>
          <Pressable
            onPress={() => onSetViewedPlayer(player.id)}
            style={[
              styles.bubble,
              { backgroundColor: getCharacterColor(player.character) },
              player.turn && {
                borderWidth: 3,
                borderColor: 'white',
              },
            ]}
          >
            <CustomText style={styles.bubbleText} bold>
              {player.name?.trim()?.charAt(0)?.toUpperCase() || '?'}
            </CustomText>
          </Pressable>

          {player.id === viewedPlayerId && (
            <View
              style={[
                styles.triangle,
                { borderTopColor: getCharacterColor(player.character) },
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    zIndex: 100,
    marginTop: 16,
  },
  innerSidebar: {
    alignItems: 'center',
  },
  bubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
  },
  bubbleText: {
    color: 'white',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 15,
    marginTop: -2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

export default PlayerBubbles;
