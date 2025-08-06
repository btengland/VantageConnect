import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
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
  getCharacterColor: (characterText: string) => string;
};

const CHARACTERS = [
  'Jules, the Captain',
  'Tina, the Marine',
  'Ariel, the Engineer',
  'Emilien, the Scholar',
  'Ira, the Medic',
  'Soren, the Navigator',
];

const ESCAPE_PODS = ['002', '003', '004', '005', '006', '007'];

function PlayerCard({ player, getCharacterColor }: PlayerCardProps) {
  const getOrdinal = (n: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return `${n}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]}`;
  };

  const renderPickerItems = (items: string[]) =>
    items.map(item => <Picker.Item key={item} label={item} value={item} />);

  const getTurnText = () =>
    player.turn
      ? "It's your turn"
      : `It's ${player.name}${player.name.endsWith('s') ? "'" : "'s"} turn`;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.card,
        { backgroundColor: getCharacterColor(player.character) },
      ]}
    >
      {/* Header */}
      <CustomText style={styles.sectionHeader} bold>
        {getOrdinal(player.id + 1)} Player
      </CustomText>

      {/* Player Name */}
      <View style={styles.row}>
        <CustomText style={styles.label} bold>
          Player Name:
        </CustomText>
        <TextInput style={styles.value} value={player.name} />
      </View>

      {/* Character Picker */}
      <View style={styles.row}>
        <CustomText style={styles.label} bold>
          Character:
        </CustomText>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={player.character}
            style={Platform.OS === 'android' ? styles.pickerAndroid : undefined}
            itemStyle={styles.pickerItem}
          >
            {renderPickerItems(CHARACTERS)}
          </Picker>
        </View>
      </View>

      {/* Escape Pod Picker */}
      <View style={styles.row}>
        <CustomText style={styles.label} bold>
          Escape Pod:
        </CustomText>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={player.escapePod}
            style={Platform.OS === 'android' ? styles.pickerAndroid : undefined}
            itemStyle={styles.pickerItem}
          >
            {renderPickerItems(ESCAPE_PODS)}
          </Picker>
        </View>
      </View>

      {/* Current Location */}
      <View style={styles.locationContainer}>
        <CustomText style={styles.label} bold>
          Current Location
        </CustomText>
        <TextInput
          keyboardType="number-pad"
          maxLength={3}
          style={styles.locationInput}
          value={player.location}
        />
      </View>

      {/* Current Turn Section */}
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
            {getTurnText()}
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

      {/* Skill Tokens */}
      <CustomText style={styles.subHeader} bold>
        Skill Tokens
      </CustomText>
      <View style={styles.skillTokenGrid}>
        {player.skillTokens.map((token, index) => (
          <View key={index} style={styles.skillTokenBox}>
            <View style={styles.iconBox}>
              <View style={styles.tokenContent}>
                <View style={styles.tokenIcon}>
                  <View style={styles.iconWrapper}>
                    <Image
                      source={token.icon}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <View style={styles.counterContainer}>
                  <Pressable style={styles.tokenButton}>
                    <CustomText style={styles.tokenButtonText}>-</CustomText>
                  </Pressable>
                  <CustomText style={styles.tokenQuantity}>
                    {token.quantity}
                  </CustomText>
                  <Pressable style={styles.tokenButton}>
                    <CustomText style={styles.tokenButtonText}>+</CustomText>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Impact Dice Grid */}
      <CustomText style={styles.subHeader} bold>
        Impact Dice Slots in Card Grid
      </CustomText>
      <View style={styles.grid} />

      {/* Status Box */}
      <CustomText style={styles.subHeader} bold>
        Status Updates
      </CustomText>
      <View style={styles.statusBox} />

      {/* Journal */}
      <CustomText style={styles.subHeader} bold>
        Journal
      </CustomText>
      <View style={styles.journalBox} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // CARD BASE
  card: {
    padding: 24,
    borderRadius: 10,
    backgroundColor: 'white',
  },

  // HEADERS
  sectionHeader: {
    textAlign: 'center',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  subHeader: {
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 10,
    marginBottom: 6,
  },

  // ROWS
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  value: {
    width: 210,
    height: 60,
    backgroundColor: '#eee',
    borderRadius: 6,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  locationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
    width: '100%',
  },
  locationInput: {
    width: 100,
    fontWeight: 'bold',
    fontSize: 36,
    backgroundColor: '#eee',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  // PICKER STYLES
  pickerWrapper: {
    width: 210,
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
  },
  pickerAndroid: {
    height: 60,
    color: '#000',
  },
  pickerItem: {
    fontSize: 14,
  },

  // TURN STATUS
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 8,
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
  myTurnBackground: {
    backgroundColor: '#a5f0a8',
  },
  turnText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },

  // GRIDS & BOXES
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
    borderTopWidth: 1,
    borderColor: '#ccc',
  },

  // SKILL TOKENS
  skillTokenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  skillTokenBox: {
    width: '48%',
    backgroundColor: '#eee',
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  iconBox: {
    width: '100%',
    alignItems: 'center',
  },
  tokenContent: {
    flex: 1,
    alignItems: 'center',
  },
  tokenIcon: {
    alignItems: 'center',
    marginBottom: 4,
  },
  iconWrapper: {
    width: 30,
    height: 30,
  },
  tokenQuantity: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
  },
  tokenButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenButtonText: {
    color: 'white',
    fontSize: 20,
  },
});

export default PlayerCard;
