// src/components/PlayerCard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type PlayerInfo = {
  id: number;
  name: string;
  character?: string;
  escapePod?: string;
  location?: string;
  isTurn?: boolean;
};

const PlayerCard = ({ player }: { player: PlayerInfo }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionHeader}>First Player</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Player Name:</Text>
        <Text style={styles.value}>{player.name || '—'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Character:</Text>
        <Text style={styles.value}>{player.character || '—'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Escape Pod:</Text>
        <Text style={styles.value}>{player.escapePod || '—'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Current Location:</Text>
        <Text style={styles.value}>{player.location || '000'}</Text>
      </View>

      <Text style={styles.subHeader}>Current Action</Text>
      <View style={styles.buttonContainer}>
        <Text style={styles.turnButton}>
          {player.isTurn ? "it's my turn" : '—'}
        </Text>
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
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
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
    marginTop: 10,
    marginBottom: 6,
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
    textAlign: 'right',
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  turnButton: {
    backgroundColor: '#5b4025',
    color: 'white',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 10,
    fontWeight: 'bold',
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
