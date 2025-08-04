// src/components/PlayerCard.tsx

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SharedStyles } from './SharedStyles';
import { TextInput } from 'react-native';

type Player = {
  id: number;
  name: string;
  character: string;
  escapePod: string;
  location: string;
};

type PlayerCardProps = {
  player: Player;
  playerTurn: number;
  setPlayerTurn: React.Dispatch<React.SetStateAction<number>>;
  totalPlayers: number;
  currentTurnPlayerName: string;
  updatePlayerField: (id: number, field: string, value: string) => void;
  getCharacterColor: (characterText: string) => string;
};

function PlayerCard(props: PlayerCardProps) {
  const {
    player,
    playerTurn,
    setPlayerTurn,
    totalPlayers,
    currentTurnPlayerName,
    updatePlayerField,
    getCharacterColor,
  } = props;

  const handleEndTurn = () => {
    setPlayerTurn(prev => (prev + 1) % totalPlayers);
  };

  const getOrdinal = (n: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return `${n}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]}`;
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: getCharacterColor(player.character) },
      ]}
    >
      <Text style={styles.sectionHeader}>
        {getOrdinal(player.id + 1)} Player
      </Text>
      <View style={styles.row}>
        <Text style={styles.label}>Player Name:</Text>
        <TextInput
          style={styles.value}
          value={player.name}
          onChangeText={text => updatePlayerField(player.id, 'name', text)}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Character:</Text>
        <TextInput
          style={styles.value}
          value={player.character}
          onChangeText={text => updatePlayerField(player.id, 'character', text)}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Escape Pod:</Text>
        <TextInput
          style={styles.value}
          value={player.escapePod}
          onChangeText={text => updatePlayerField(player.id, 'escapePod', text)}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Current Location:</Text>
        <TextInput
          keyboardType="number-pad"
          maxLength={3}
          style={styles.locationInput}
          value={player.location}
          onChangeText={text => updatePlayerField(player.id, 'location', text)}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Text style={styles.subHeader}>Current Action</Text>
        <View
          style={[
            styles.turnTextContainer,
            playerTurn === player.id && styles.myTurnBackground,
          ]}
        >
          <Text style={styles.turnText}>
            {playerTurn === player.id
              ? "It's your turn"
              : `It's ${currentTurnPlayerName}${
                  currentTurnPlayerName.endsWith('s') ? "'" : "'s"
                } turn`}
          </Text>
        </View>

        {playerTurn === player.id && (
          <Pressable onPress={handleEndTurn}>
            <Text style={SharedStyles.button}>Done</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.subHeader}>Skill Tokens</Text>
      <View style={styles.grid} />
      <Text style={styles.subHeader}>Impact Dice Slots in Card Grid</Text>
      <View style={styles.grid} />
      <Text style={styles.subHeader}>Status Updates</Text>
      <View style={styles.statusBox} />
      <Text style={styles.subHeader}>Journal</Text>
      <View style={styles.journalBox} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  sectionHeader: {
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  subHeader: {
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 10,
    marginBottom: 6,
  },
  myTurnBackground: {
    backgroundColor: '#a5f0a8',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  value: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  locationInput: {
    alignItems: 'center',
    width: 100,
    fontWeight: 'bold',
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  turnTextContainer: {
    backgroundColor: '#f0f4f8', // subtle light background
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignSelf: 'center', // centers container horizontally
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // for Android shadow
    minWidth: '60%', // or fixed width like 200
  },
  turnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  grid: {
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginBottom: 10,
  },
  statusBox: {
    height: 40,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  journalBox: {
    height: 40,
    borderColor: '#ccc',
    borderTopWidth: 1,
  },
});

export default PlayerCard;
