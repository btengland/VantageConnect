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
import { getOrdinal, lightenColor } from '../utils';
import { endTurn } from '../api';
import { debounce, isEqual } from 'lodash';

type SkillToken = { quantity: number };
type ImpactDiceSlot = { symbol: string; checked: boolean };
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
  statuses: { heart: number; star: number; 'timer-sand-full': number };
  impactDiceSlots: ImpactDiceSlot[];
};

type PlayerCardProps = {
  currentPlayerId: number;
  player: Player;
  getCharacterColor: (characterText: string) => string;
  skillTokenIcons: any[];
  onUpdatePlayer: (updates: Partial<Player>) => void;
  totalPlayers: number;
};

function PlayerCard({
  currentPlayerId,
  player,
  getCharacterColor,
  skillTokenIcons,
  onUpdatePlayer,
  totalPlayers,
}: PlayerCardProps) {
  const [localPlayer, setLocalPlayer] = useState(player);
  const [isLoading, setIsLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const isEditable = currentPlayerId === player.id;

  // Debounced update to the parent
  const debouncedOnUpdatePlayer = useCallback(
    debounce((p: Player) => {
      onUpdatePlayer(p);
    }, 500), // 500ms delay
    [onUpdatePlayer],
  );

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // When localPlayer changes, call the debounced update function.
    debouncedOnUpdatePlayer(localPlayer);

    // Cleanup function to cancel any pending debounced calls
    return () => {
      debouncedOnUpdatePlayer.cancel();
    };
  }, [localPlayer, debouncedOnUpdatePlayer]);

  useEffect(() => {
    // This effect syncs the local state with the `player` prop from the parent.
    if (isEditable) {
      // If the user is editing this card, we only want to accept authoritative
      // changes from the parent, like `turn` status, to avoid overwriting input.
      if (player.turn !== localPlayer.turn) {
        setLocalPlayer(prev => ({ ...prev, turn: player.turn }));
      }
    } else {
      // If the card is not editable (another player's card), we accept all
      // changes from the parent if the data is different.
      if (!isEqual(player, localPlayer)) {
        setLocalPlayer(player);
      }
    }
  }, [player, localPlayer, isEditable]);

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

  const updatePlayer = (updates: Partial<Player>) => {
    setLocalPlayer(prev => ({ ...prev, ...updates }));
  };

  const handleAddImpactSlot = () => {
    if (!isEditable) return;
    updatePlayer({
      impactDiceSlots: [
        ...localPlayer.impactDiceSlots,
        { symbol: 'any', checked: false },
      ],
    });
  };

  const handleUpdateImpactSlot = (index: number, newSlot: ImpactDiceSlot) => {
    if (!isEditable) return;
    const slots = [...localPlayer.impactDiceSlots];
    slots[index] = newSlot;
    updatePlayer({ impactDiceSlots: slots });
  };

  const handleRemoveImpactSlot = (index: number) => {
    if (!isEditable) return;
    const slots = localPlayer.impactDiceSlots.filter((_, i) => i !== index);
    updatePlayer({ impactDiceSlots: slots });
  };

  const handleStatusChange = (
    status: 'heart' | 'star' | 'timer-sand-full',
    change: 1 | -1,
  ) => {
    if (!isEditable) return;
    const currentLevel = localPlayer.statuses[status];
    const newLevel = Math.max(0, Math.min(6, currentLevel + change));
    updatePlayer({
      statuses: { ...localPlayer.statuses, [status]: newLevel },
    });
  };

  // Reset loading when it becomes this player's turn again
  useEffect(() => {
    setIsLoading(false);
  }, [player.turn, currentPlayerId, player.id]);

  const handleEndTurn = async () => {
    // Prevent multiple clicks
    if (!isEditable || isLoading) return;

    setIsLoading(true);
    try {
      // This call informs the backend. The UI update will come via WebSocket.
      await endTurn(player.sessionCode, player.id);
      // We DON'T set isLoading to false here. The button will disappear
      // when the player's `turn` status is updated via WebSocket,
      // which is the source of truth.
    } catch (err) {
      console.error('End turn failed', err);
      // If the API call fails, re-enable the button for another attempt.
      setIsLoading(false);
    }
  };

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
          {player.turn && player.id === currentPlayerId && (
            <View style={styles.buttonContainer}>
              <View style={[styles.turnTextContainer, styles.myTurnBackground]}>
                <CustomText style={styles.turnText} small bold>
                  It's your turn
                </CustomText>
              </View>

              <Pressable
                disabled={isLoading || totalPlayers <= 1}
                onPress={handleEndTurn}
                style={({ pressed }) => [
                  {
                    opacity:
                      pressed || isLoading || totalPlayers <= 1 ? 0.5 : 1,
                  },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <CustomText
                    style={totalPlayers > 1 && SharedStyles.button}
                    small
                    bold
                  >
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
                {/* First option disabled */}
                <Picker.Item
                  label="Select a character..."
                  value=""
                  enabled={false}
                />

                {/* Rest of the options */}
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
                        {isEditable && (
                          <Pressable
                            style={styles.tokenButton}
                            onPress={() => {
                              if (!isEditable) return;
                              const newTokens = localPlayer.skillTokens.map(
                                (token, i) =>
                                  i === index
                                    ? {
                                        ...token,
                                        quantity: Math.max(
                                          0,
                                          token.quantity - 1,
                                        ),
                                      }
                                    : token,
                              );
                              updatePlayer({ skillTokens: newTokens });
                            }}
                          >
                            <CustomText style={styles.tokenButtonText}>
                              -
                            </CustomText>
                          </Pressable>
                        )}
                        <CustomText style={styles.tokenQuantity}>
                          {token.quantity}
                        </CustomText>
                        {isEditable && (
                          <Pressable
                            style={styles.tokenButton}
                            onPress={() => {
                              if (!isEditable) return;
                              const newTokens = localPlayer.skillTokens.map(
                                (token, i) =>
                                  i === index
                                    ? { ...token, quantity: token.quantity + 1 }
                                    : token,
                              );
                              updatePlayer({ skillTokens: newTokens });
                            }}
                          >
                            <CustomText style={styles.tokenButtonText}>
                              +
                            </CustomText>
                          </Pressable>
                        )}
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
                      isEditable &&
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
                    <IconPicker
                      disabled={!isEditable}
                      options={IMPACT_SYMBOLS}
                      selectedValue={slot.symbol}
                      onValueChange={value =>
                        isEditable &&
                        handleUpdateImpactSlot(index, {
                          ...slot,
                          symbol: value,
                        })
                      }
                    />
                  </View>
                  {isEditable && (
                    <Pressable
                      onPress={() =>
                        isEditable && handleRemoveImpactSlot(index)
                      }
                    >
                      <MaterialCommunityIcons
                        name="delete"
                        size={24}
                        color="red"
                      />
                    </Pressable>
                  )}
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
                          if (!isEditable) return;
                          updatePlayer({
                            statuses: {
                              ...localPlayer.statuses,
                              [status]: i + 1,
                            },
                          });
                        }}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            i <
                            localPlayer.statuses[
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
                    {isEditable && (
                      <Pressable
                        onPress={() => handleStatusChange(status as any, -1)}
                      >
                        <MaterialCommunityIcons
                          name="minus"
                          size={30}
                          color="black"
                        />
                      </Pressable>
                    )}
                    <CustomText style={styles.statusLevel}>
                      {
                        localPlayer.statuses[
                          status as 'heart' | 'star' | 'timer-sand-full'
                        ]
                      }
                    </CustomText>
                    {isEditable && (
                      <Pressable
                        onPress={() => handleStatusChange(status as any, 1)}
                      >
                        <MaterialCommunityIcons
                          name="plus"
                          size={30}
                          color="black"
                        />
                      </Pressable>
                    )}
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

export default React.memo(PlayerCard);
