import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SharedStyles } from './SharedStyles';
import CustomText from './CustomText';
import IconPicker from './IconPicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CHARACTERS, ESCAPE_PODS, IMPACT_SYMBOLS } from '../constants';
import { getOrdinal, lightenColor, useDebounce } from '../utils';
import { endTurn } from '../api';

// TYPE DEFINITIONS
type SkillToken = { quantity: number };
type ImpactDiceSlot = { symbol: string; checked: boolean };
type Status = 'heart' | 'star' | 'timer-sand-full';
type Player = {
  id: number;
  sessionCode: number;
  name: string;
  playerNumber: number;
  character: string;
  escapePod: string;
  location: string;
  skillTokens: SkillToken[];
  turn: boolean;
  journalText: string;
  statuses: { [key in Status]: number };
  impactDiceSlots: ImpactDiceSlot[];
};

type PlayerCardProps = {
  currentPlayerId: number;
  player: Player;
  getCharacterColor: (characterText: string) => string;
  skillTokenIcons: any[];
  onUpdatePlayer: (player: Player) => void;
};

const PlayerCard: React.FC<PlayerCardProps> = ({
  currentPlayerId,
  player,
  getCharacterColor,
  skillTokenIcons,
  onUpdatePlayer,
}) => {
  const [localPlayer, setLocalPlayer] = useState<Player>(player);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const isEditable = currentPlayerId === player.id;

  const debouncedPlayer = useDebounce(localPlayer, 500);

  useEffect(() => {
    onUpdatePlayer(debouncedPlayer);
  }, [debouncedPlayer]);

  // Sync with incoming player data
  useEffect(() => {
    // If this card is not for the currently editing player, always sync from props.
    if (player.id !== currentPlayerId) {
      setLocalPlayer(player);
    } else {
      // This is the currently editing player.
      // We don't want to overwrite their input, so we only sync the 'turn' status.
      if (player.turn !== localPlayer.turn) {
        setLocalPlayer(prev => ({ ...prev, turn: player.turn }));

        // When the turn is over (i.e., player.turn becomes false),
        // we must reset the loading state of the "Done" button.
        if (!player.turn) {
          setIsLoading(false);
        }
      }
    }
  }, [player, currentPlayerId, localPlayer.turn]);

  // Pulse animation for the location input
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

  // Generic update handler
  const updatePlayer = useCallback(
    (updates: Partial<Player>) => {
      if (!isEditable) return;
      setLocalPlayer(prev => ({ ...prev, ...updates }));
    },
    [isEditable],
  );

  // Handlers for specific actions
  const handleAddImpactSlot = useCallback(() => {
    updatePlayer({
      impactDiceSlots: [
        ...localPlayer.impactDiceSlots,
        { symbol: 'any', checked: false },
      ],
    });
  }, [localPlayer.impactDiceSlots, updatePlayer]);

  const handleUpdateImpactSlot = useCallback(
    (index: number, newSlot: ImpactDiceSlot) => {
      const slots = [...localPlayer.impactDiceSlots];
      slots[index] = newSlot;
      updatePlayer({ impactDiceSlots: slots });
    },
    [localPlayer.impactDiceSlots, updatePlayer],
  );

  const handleRemoveImpactSlot = useCallback(
    (index: number) => {
      const slots = localPlayer.impactDiceSlots.filter((_, i) => i !== index);
      updatePlayer({ impactDiceSlots: slots });
    },
    [localPlayer.impactDiceSlots, updatePlayer],
  );

  const handleStatusChange = useCallback(
    (status: Status, change: 1 | -1) => {
      const currentLevel = localPlayer.statuses[status];
      const newLevel = Math.max(0, Math.min(6, currentLevel + change));
      updatePlayer({
        statuses: { ...localPlayer.statuses, [status]: newLevel },
      });
    },
    [localPlayer.statuses, updatePlayer],
  );

  const handleSkillTokenChange = useCallback(
    (index: number, change: 1 | -1) => {
      const newTokens = [...localPlayer.skillTokens];
      newTokens[index].quantity = Math.max(
        0,
        newTokens[index].quantity + change,
      );
      updatePlayer({ skillTokens: newTokens });
    },
    [localPlayer.skillTokens, updatePlayer],
  );

  const handleEndTurn = async () => {
    if (!isEditable) return;
    setIsLoading(true);
    try {
      await endTurn(localPlayer.sessionCode, localPlayer.id);
    } catch (err) {
      console.error('End turn failed', err);
      setIsLoading(false); // only set loading false on error
    }
  };

  // RENDER HELPERS
  const renderPickerItems = (items: string[]) =>
    items.map(item => <Picker.Item key={item} label={item} value={item} />);

  const lighterBg = lightenColor(getCharacterColor(localPlayer.character), 0.8);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={150}
    >
      <View style={styles.cardContainer}>
        <ScrollView
          contentContainerStyle={[styles.card, { backgroundColor: lighterBg }]}
        >
          {/* Header */}
          <CustomText style={styles.sectionHeader} small bold>
            {getOrdinal(localPlayer.playerNumber)} Player
          </CustomText>

          {/* Current Turn */}
          {localPlayer.turn && localPlayer.id === currentPlayerId && (
            <View style={styles.buttonContainer}>
              <View style={[styles.turnTextContainer, styles.myTurnBackground]}>
                <CustomText style={styles.turnText} small bold>
                  It's your turn
                </CustomText>
              </View>

              <Pressable
                disabled={isLoading}
                onPress={handleEndTurn}
                style={({ pressed }) => [
                  SharedStyles.button,
                  { opacity: pressed || isLoading ? 0.5 : 1 },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <CustomText style={SharedStyles.buttonLabel} small bold>
                    Done
                  </CustomText>
                )}
              </Pressable>
            </View>
          )}

          {/* Player Name */}
          <View style={styles.row}>
            <CustomText style={styles.label} small bold>
              Player Name:
            </CustomText>
            <TextInput
              style={styles.value}
              value={localPlayer.name}
              placeholder="Enter your name"
              editable={isEditable}
              onChangeText={text => updatePlayer({ name: text })}
            />
          </View>

          {/* Character Picker */}
          <View style={styles.row}>
            <CustomText style={styles.label} small bold>
              Character:
            </CustomText>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={localPlayer.character}
                style={
                  Platform.OS === 'android' ? styles.pickerAndroid : undefined
                }
                itemStyle={styles.pickerItem}
                enabled={isEditable}
                onValueChange={value => updatePlayer({ character: value })}
              >
                <Picker.Item
                  label="Select a character..."
                  value=""
                  enabled={false}
                />
                {CHARACTERS.map(c => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
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
                selectedValue={localPlayer.escapePod}
                style={
                  Platform.OS === 'android' ? styles.pickerAndroid : undefined
                }
                itemStyle={styles.pickerItem}
                enabled={isEditable}
                onValueChange={value => updatePlayer({ escapePod: value })}
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
                value={localPlayer.location}
                editable={isEditable}
                onChangeText={text => updatePlayer({ location: text })}
              />
            </Animated.View>
          </View>

          {/* Skill Tokens */}
          <View style={{ marginTop: 16 }}>
            <CustomText style={styles.subHeader} small bold>
              Skill Tokens
            </CustomText>
            <View style={styles.skillTokenGrid}>
              {localPlayer.skillTokens.map((token, index) => (
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
                        <Pressable
                          style={styles.tokenButton}
                          onPress={() => handleSkillTokenChange(index, -1)}
                          disabled={!isEditable}
                        >
                          <CustomText style={styles.tokenButtonText}>
                            -
                          </CustomText>
                        </Pressable>
                        <CustomText style={styles.tokenQuantity}>
                          {token.quantity}
                        </CustomText>
                        <Pressable
                          style={styles.tokenButton}
                          onPress={() => handleSkillTokenChange(index, 1)}
                          disabled={!isEditable}
                        >
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

          {/* Impact Dice */}
          <View style={{ marginTop: 16 }}>
            <CustomText style={styles.subHeader} small bold>
              Impact Dice Slots
            </CustomText>
            <View style={styles.impactGrid}>
              {localPlayer.impactDiceSlots.map((slot, index) => (
                <View key={index} style={styles.impactSlot}>
                  <Pressable
                    onPress={() =>
                      handleUpdateImpactSlot(index, {
                        ...slot,
                        checked: !slot.checked,
                      })
                    }
                    disabled={!isEditable}
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
                    <IconPicker
                      options={IMPACT_SYMBOLS}
                      selectedValue={slot.symbol}
                      onValueChange={value =>
                        handleUpdateImpactSlot(index, {
                          ...slot,
                          symbol: value,
                        })
                      }
                      disabled={!isEditable}
                    />
                  </View>
                  <Pressable
                    onPress={() => handleRemoveImpactSlot(index)}
                    disabled={!isEditable}
                  >
                    <MaterialCommunityIcons
                      name="delete"
                      size={24}
                      color="red"
                    />
                  </Pressable>
                </View>
              ))}
            </View>
            {isEditable && (
              <Pressable style={styles.addButton} onPress={handleAddImpactSlot}>
                <MaterialCommunityIcons name="flash" size={24} color="white" />
                <CustomText style={styles.addButtonText}>Add Slot</CustomText>
              </Pressable>
            )}
          </View>

          {/* Status Updates */}
          <View style={{ marginTop: 16 }}>
            <CustomText style={styles.subHeader} small bold>
              Status Updates
            </CustomText>
            <View style={styles.statusContainer}>
              {(Object.keys(localPlayer.statuses) as Status[]).map(status => (
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
                        onPress={() =>
                          updatePlayer({
                            statuses: {
                              ...localPlayer.statuses,
                              [status]: i + 1,
                            },
                          })
                        }
                        disabled={!isEditable}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            i < localPlayer.statuses[status]
                              ? styles.statusDotFilled
                              : {},
                          ]}
                        />
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.statusControls}>
                    <Pressable
                      onPress={() => handleStatusChange(status, -1)}
                      disabled={!isEditable}
                    >
                      <MaterialCommunityIcons
                        name="minus"
                        size={30}
                        color="black"
                      />
                    </Pressable>
                    <CustomText style={styles.statusLevel}>
                      {localPlayer.statuses[status]}
                    </CustomText>
                    <Pressable
                      onPress={() => handleStatusChange(status, 1)}
                      disabled={!isEditable}
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
              value={localPlayer.journalText}
              placeholder="Write your notes here..."
              editable={isEditable}
              onChangeText={text => updatePlayer({ journalText: text })}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

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
    height: 300,
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
