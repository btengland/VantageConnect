import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  ScrollView,
  Animated,
  Image,
  Easing,
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
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

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
        <CustomText style={styles.subHeader} bold>
          Current Location
        </CustomText>
        <Animated.View
          style={[
            styles.locationCircle,
            {
              shadowOpacity: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              }),
              shadowRadius: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [5, 15],
              }),
              transform: [
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.05],
                  }),
                },
              ],
            },
          ]}
        >
          <TextInput
            keyboardType="number-pad"
            maxLength={3}
            style={[
              styles.locationInput,
              { color: getCharacterColor(player.character) },
            ]}
            value={player.location}
          />
        </Animated.View>
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
      <View style={{ marginTop: 16 }}>
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
      </View>

      {/* Impact Dice Grid */}
      <View style={{ marginTop: 16 }}>
        <CustomText style={styles.subHeader} bold>
          Impact Dice Slots in Card Grid
        </CustomText>
        <View style={styles.grid} />
      </View>

      {/* Status Box */}
      <View style={{ marginTop: 16 }}>
        <CustomText style={styles.subHeader} bold>
          Status Updates
        </CustomText>
        <View style={styles.statusBox} />
      </View>

      {/* Journal */}
      <View style={{ marginTop: 16 }}>
        <CustomText style={styles.subHeader} bold>
          Journal
        </CustomText>
        <View style={styles.journalBox} />
      </View>
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

  // LOCATION
  locationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
    width: '100%',
  },
  locationCircle: {
    backgroundColor: '#025472',
    borderRadius: 60,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  locationInput: {
    width: 90,
    fontWeight: '900',
    fontSize: 38,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: 'transparent',
    textAlign: 'center',
    paddingVertical: 0,
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
    marginVertical: 16,
    backgroundColor: '#eee',
    borderRadius: 16,
    padding: 16,
    alignSelf: 'center',
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
    backgroundColor: '#eee',
  },
  journalBox: {
    height: 40,
  },

  // SKILL TOKENS
  skillTokenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skillTokenBox: {
    width: '48%',
    backgroundColor: '#eee',
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
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
