import React from 'react';
import { View, StyleSheet, Pressable, TextInput, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SharedStyles } from './SharedStyles';
import CustomText from './CustomText';

type SkillToken = {
  icon: any;
  quantity: number;
};

type Player = {
  id: number;
  name: string;
  character: string;
  escapePod: string;
  location: string;
  skillTokens: SkillToken[];
  turn: boolean;
};

type PlayerCardProps = {
  player: Player;
  updatePlayerField: (id: number, field: string, value: string) => void;
  getCharacterColor: (characterText: string) => string;
};

function PlayerCard(props: PlayerCardProps) {
  const { player, updatePlayerField, getCharacterColor } = props;

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
      <CustomText style={styles.sectionHeader} bold>
        {getOrdinal(player.id + 1)} Player
      </CustomText>

      <View style={styles.row}>
        <CustomText style={styles.label} bold>
          Player Name:
        </CustomText>
        <TextInput
          style={styles.value}
          value={player.name}
          onChangeText={text => updatePlayerField(player.id, 'name', text)}
        />
      </View>

      <View style={styles.row}>
        <CustomText style={styles.label} bold>
          Character:
        </CustomText>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={player.character}
            onValueChange={value =>
              updatePlayerField(player.id, 'character', value)
            }
            style={Platform.OS === 'android' ? styles.pickerAndroid : undefined}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item
              label="Jules, the Captain"
              value="Jules, the Captain"
            />
            <Picker.Item label="Tina, the Marine" value="Tina, the Marine" />
            <Picker.Item
              label="Ariel, the Engineer"
              value="Ariel, the Engineer"
            />
            <Picker.Item
              label="Emilien, the Scholar"
              value="Emilien, the Scholar"
            />
            <Picker.Item label="Ira, the Medic" value="Ira, the Medic" />
            <Picker.Item
              label="Soren, the Navigator"
              value="Soren, the Navigator"
            />
          </Picker>
        </View>
      </View>

      <View style={styles.row}>
        <CustomText style={styles.label} bold>
          Escape Pod:
        </CustomText>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={player.escapePod}
            onValueChange={value =>
              updatePlayerField(player.id, 'escapePod', value)
            }
            style={Platform.OS === 'android' ? styles.pickerAndroid : undefined}
            itemStyle={styles.pickerItem}
          >
            {['002', '003', '004', '005', '006', '007'].map(pod => (
              <Picker.Item key={pod} label={pod} value={pod} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.row}>
        <CustomText style={styles.label} bold>
          Current Location:
        </CustomText>
        <TextInput
          keyboardType="number-pad"
          maxLength={3}
          style={styles.locationInput}
          value={player.location}
          onChangeText={text => updatePlayerField(player.id, 'location', text)}
        />
      </View>

      <View style={styles.buttonContainer}>
        <CustomText style={styles.subHeader} bold>
          Current Action
        </CustomText>
        <View
          style={[
            styles.turnTextContainer,
            player.turn && styles.myTurnBackground,
          ]}
        >
          <CustomText style={styles.turnText} bold>
            {player.turn
              ? "It's your turn"
              : `It's ${player.name}${
                  player.name.endsWith('s') ? "'" : "'s"
                } turn`}
          </CustomText>
        </View>

        {player.turn && (
          <Pressable>
            <CustomText style={SharedStyles.button} bold>
              Done
            </CustomText>
          </Pressable>
        )}
      </View>

      <CustomText style={styles.subHeader} bold>
        Skill Tokens
      </CustomText>
      <View style={styles.grid} />

      <CustomText style={styles.subHeader} bold>
        Impact Dice Slots in Card Grid
      </CustomText>
      <View style={styles.grid} />

      <CustomText style={styles.subHeader} bold>
        Status Updates
      </CustomText>
      <View style={styles.statusBox} />

      <CustomText style={styles.subHeader} bold>
        Journal
      </CustomText>
      <View style={styles.journalBox} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  sectionHeader: {
    textAlign: 'center',
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  subHeader: {
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
    alignItems: 'center',
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  value: {
    flex: 1,
    height: 50,
    backgroundColor: '#eee',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
  },
  pickerAndroid: {
    height: 50,
    color: '#000',
  },
  pickerItem: {
    fontSize: 14,
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
    backgroundColor: '#f0f4f8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: '60%',
  },
  turnText: {
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
