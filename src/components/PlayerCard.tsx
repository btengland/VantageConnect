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
import { MaterialCommunityIcons } from '@expo/vector-icons';

type SkillToken = {
  quantity: number;
};

type ImpactDiceSlot = {
  symbol: string;
  checked: boolean;
};

type Player = {
  id: number;
  name: string;
  character: string;
  escapePod: string;
  location: string;
  skillTokens: SkillToken[];
  turn: boolean;
  journalText: string;
  statuses: {
    heart: number;
    star: number;
    'timer-sand-full': number;
  };
  impactDiceSlots: ImpactDiceSlot[];
};

type PlayerCardProps = {
  player: Player;
  getCharacterColor: (characterText: string) => string;
  skillTokenIcons: any[];
  onUpdatePlayer: (player: Player) => void;
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

function PlayerCard({
  player,
  getCharacterColor,
  skillTokenIcons,
  onUpdatePlayer,
}: PlayerCardProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const IMPACT_SYMBOLS = [
    { label: 'Any', value: 'any' },
    { label: 'Heart', value: 'heart' },
    { label: 'Hourglass', value: 'timer-sand-full' },
    { label: 'Star', value: 'star' },
    { label: 'Negative', value: 'negative' },
    { label: 'U-Turn', value: 'uturn' },
  ];

  const handleAddImpactSlot = () => {
    const newSlots = [
      ...player.impactDiceSlots,
      { symbol: 'any', checked: false },
    ];
    onUpdatePlayer({ ...player, impactDiceSlots: newSlots });
  };

  const handleUpdateImpactSlot = (index: number, newSlot: ImpactDiceSlot) => {
    const newSlots = [...player.impactDiceSlots];
    newSlots[index] = newSlot;
    onUpdatePlayer({ ...player, impactDiceSlots: newSlots });
  };

  const handleRemoveImpactSlot = (index: number) => {
    const newSlots = player.impactDiceSlots.filter((_, i) => i !== index);
    onUpdatePlayer({ ...player, impactDiceSlots: newSlots });
  };

  const handleStatusChange = (
    status: 'heart' | 'star' | 'timer-sand-full',
    change: 1 | -1,
  ) => {
    const currentLevel = player.statuses[status];
    const newLevel = Math.max(0, Math.min(6, currentLevel + change));
    const newStatuses = { ...player.statuses, [status]: newLevel };
    onUpdatePlayer({ ...player, statuses: newStatuses });
  };

  const handleJournalChange = (text: string) => {
    onUpdatePlayer({ ...player, journalText: text });
  };

  function lightenColor(hex: string, percent: number) {
    // Remove hash if present
    hex = hex.replace(/^#/, '');

    // Parse r,g,b
    const num = parseInt(hex, 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;

    // Increase each channel by percent towards 255
    r = Math.min(255, Math.floor(r + (255 - r) * percent));
    g = Math.min(255, Math.floor(g + (255 - g) * percent));
    b = Math.min(255, Math.floor(b + (255 - b) * percent));

    // Return new hex
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  const lighterBg = lightenColor(getCharacterColor(player.character), 0.8);

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

  return (
    <View style={styles.cardContainer}>
      <ScrollView
        contentContainerStyle={[styles.card, { backgroundColor: lighterBg }]}
      >
        {/* Current Turn Section */}
        {player.turn && (
          <View style={styles.buttonContainer}>
            <View
              style={[
                styles.turnTextContainer,
                player.turn && styles.myTurnBackground,
              ]}
            >
              <CustomText style={styles.turnText} small bold>
                It's your turn
              </CustomText>
            </View>
            <Pressable>
              <CustomText style={SharedStyles.button} small bold>
                Done
              </CustomText>
            </Pressable>
          </View>
        )}

        {/* Header */}
        <CustomText style={styles.sectionHeader} small bold>
          {getOrdinal(player.id + 1)} Player
        </CustomText>
        {/* Player Name */}
        <View style={styles.row}>
          <CustomText style={styles.label} small bold>
            Player Name:
          </CustomText>
          <TextInput
            style={styles.value}
            value={player.name}
            placeholder="Enter your name"
          />
        </View>

        {/* Character Picker */}
        <View style={styles.row}>
          <CustomText style={styles.label} small bold>
            Character:
          </CustomText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={player.character}
              style={
                Platform.OS === 'android' ? styles.pickerAndroid : undefined
              }
              itemStyle={styles.pickerItem}
            >
              {renderPickerItems(CHARACTERS)}
            </Picker>
          </View>
        </View>
        {/* Escape Pod Picker */}
        <View style={styles.row}>
          <CustomText style={styles.label} small bold>
            Escape Pod:
          </CustomText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={player.escapePod}
              style={
                Platform.OS === 'android' ? styles.pickerAndroid : undefined
              }
              itemStyle={styles.pickerItem}
            >
              {renderPickerItems(ESCAPE_PODS)}
            </Picker>
          </View>
        </View>

        {/* Current Location */}
        <View style={styles.locationContainer}>
          <CustomText style={styles.subHeader} small bold>
            Current Location
          </CustomText>
          <Animated.View
            style={[
              styles.locationInputWrapper,
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
              style={[styles.locationInput, { color: lighterBg }]}
              value={player.location}
            />
          </Animated.View>
        </View>

        {/* Skill Tokens */}
        <View style={{ marginTop: 16 }}>
          <CustomText style={styles.subHeader} small bold>
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
                          source={skillTokenIcons[index]}
                          style={{ width: 30, height: 30 }}
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                    <View style={styles.counterContainer}>
                      <Pressable style={styles.tokenButton}>
                        <CustomText style={styles.tokenButtonText}>
                          -
                        </CustomText>
                      </Pressable>
                      <CustomText style={styles.tokenQuantity}>
                        {token.quantity}
                      </CustomText>
                      <Pressable style={styles.tokenButton}>
                        <CustomText style={styles.tokenButtonText}>
                          +
                        </CustomText>
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
          <CustomText style={styles.subHeader} small bold>
            Impact Dice Slots
          </CustomText>
          <View style={styles.impactGrid}>
            {player.impactDiceSlots.map((slot, index) => (
              <View key={index} style={styles.impactSlot}>
                <Pressable
                  onPress={() =>
                    handleUpdateImpactSlot(index, {
                      ...slot,
                      checked: !slot.checked,
                    })
                  }
                >
                  <MaterialCommunityIcons
                    name={
                      slot.checked
                        ? 'checkbox-marked'
                        : 'checkbox-blank-outline'
                    }
                    size={24}
                    color="black"
                  />
                </Pressable>
                <View style={styles.pickerWrapperImpact}>
                  <Picker
                    selectedValue={slot.symbol}
                    onValueChange={itemValue =>
                      handleUpdateImpactSlot(index, {
                        ...slot,
                        symbol: itemValue,
                      })
                    }
                    style={
                      Platform.OS === 'android' ? styles.pickerAndroid : {}
                    }
                    itemStyle={styles.pickerItem}
                  >
                    {IMPACT_SYMBOLS.map(symbol => (
                      <Picker.Item
                        key={symbol.value}
                        label={symbol.label}
                        value={symbol.value}
                      />
                    ))}
                  </Picker>
                </View>
                <Pressable onPress={() => handleRemoveImpactSlot(index)}>
                  <MaterialCommunityIcons name="delete" size={24} color="red" />
                </Pressable>
              </View>
            ))}
          </View>
          <Pressable style={styles.addButton} onPress={handleAddImpactSlot}>
            <MaterialCommunityIcons name="flash" size={24} color="white" />
            <CustomText style={styles.addButtonText}>Add Slot</CustomText>
          </Pressable>
        </View>

        {/* Status Box */}
        <View style={{ marginTop: 16 }}>
          <CustomText style={styles.subHeader} small bold>
            Status Updates
          </CustomText>
          <View style={styles.statusContainer}>
            {['heart', 'star', 'timer-sand-full'].map(status => (
              <View key={status} style={styles.statusRow}>
                <MaterialCommunityIcons
                  name={status as any}
                  size={30}
                  color="black"
                />
                <View style={styles.statusTrack}>
                  {[...Array(6)].map((_, i) => (
                    <Pressable
                      key={i}
                      onPress={() => {
                        const newStatuses = {
                          ...player.statuses,
                          [status]: i + 1,
                        };
                        onUpdatePlayer({ ...player, statuses: newStatuses });
                      }}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          i <
                          player.statuses[
                            status as 'heart' | 'star' | 'timer-sand-full'
                          ]
                            ? styles.statusDotFilled
                            : {},
                        ]}
                      />
                    </Pressable>
                  ))}
                </View>
                <View style={styles.statusControls}>
                  <Pressable
                    onPress={() =>
                      handleStatusChange(
                        status as 'heart' | 'star' | 'timer-sand-full',
                        -1,
                      )
                    }
                  >
                    <MaterialCommunityIcons
                      name="minus"
                      size={30}
                      color="black"
                    />
                  </Pressable>
                  <CustomText style={styles.statusLevel}>
                    {
                      player.statuses[
                        status as 'heart' | 'star' | 'timer-sand-full'
                      ]
                    }
                  </CustomText>
                  <Pressable
                    onPress={() =>
                      handleStatusChange(
                        status as 'heart' | 'star' | 'timer-sand-full',
                        1,
                      )
                    }
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={30}
                      color="black"
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Journal */}
        <View style={{ marginTop: 16 }}>
          <CustomText style={styles.subHeader} small bold>
            Journal
          </CustomText>
          <TextInput
            style={styles.journalInput}
            multiline
            onChangeText={handleJournalChange}
            value={player.journalText}
            placeholder="Write your notes here..."
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    flex: 1,
  },
  // CARD BASE
  card: {
    padding: 24,
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
  locationInputWrapper: {
    backgroundColor: '#025472',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 30,
  },
  locationInput: {
    width: 90,
    fontSize: 38,
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Regular',
  },

  // TURN STATUS
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#eee',
    borderRadius: 16,
    padding: 16,
    alignSelf: 'center',
  },
  turnTextContainer: {
    backgroundColor: '#f0f4f8',
    paddingVertical: 8,
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
    textAlign: 'center',
  },

  // GRIDS & BOXES
  grid: {
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginBottom: 10,
  },
  impactGrid: {
    marginBottom: 10,
  },
  impactSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  pickerWrapperImpact: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#025472',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statusTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  statusDotFilled: {
    backgroundColor: '#025472',
  },
  statusControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLevel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  journalInput: {
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    textAlignVertical: 'top',
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
