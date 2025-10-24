import { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  ScrollView,
  Animated,
  Easing,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import DropdownPicker from './DropdownPicker';
import { SharedStyles } from './SharedStyles';
import CustomText from './CustomText';
import IconPicker from './IconPicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CHARACTERS, ESCAPE_PODS, IMPACT_SYMBOLS } from '../constants';
import { getOrdinal, lightenColor, getCharacterColor } from '../utils';
import { endTurn } from '../api';
import SkillTokens from './player/SkillTokens';
import StatusUpdates from './player/StatusUpdates';

type SkillToken = { id: string; quantity: number };
type ImpactDiceSlot = { id: string; symbol: string; checked: boolean };
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
  skillTokenIconMap: { [key: string]: any };
  onUpdatePlayer: (updates: Partial<Player>) => void;
  totalPlayers: number;
};

function PlayerCard({
  currentPlayerId,
  player,
  skillTokenIconMap,
  onUpdatePlayer,
  totalPlayers,
}: PlayerCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const isEditable = currentPlayerId === player.id;

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
    onUpdatePlayer(updates);
  };

  const handleAddImpactSlot = () => {
    if (!isEditable) return;

    const newSlot: ImpactDiceSlot = {
      id: Date.now().toString(),
      symbol: 'any',
      checked: false,
    };

    updatePlayer({
      impactDiceSlots: [...player.impactDiceSlots, newSlot],
    });
  };

  const handleUpdateImpactSlot = (
    id: string,
    updates: Partial<ImpactDiceSlot>,
  ) => {
    if (!isEditable) return;
    const newSlots = player.impactDiceSlots.map(slot =>
      slot.id === id ? { ...slot, ...updates } : slot,
    );
    updatePlayer({ impactDiceSlots: newSlots });
  };

  const handleRemoveImpactSlot = (id: string) => {
    if (!isEditable) return;
    const newSlots = player.impactDiceSlots.filter(slot => slot.id !== id);
    updatePlayer({ impactDiceSlots: newSlots });
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

  const lighterBg = lightenColor(getCharacterColor(player.character), 0.8);

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
            {getOrdinal(player.playerNumber)} Player
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
              value={player.name}
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
              <DropdownPicker
                options={CHARACTERS}
                selectedValue={player.character}
                onValueChange={value => updatePlayer({ character: value })}
                disabled={!isEditable}
              />
            </View>
          </View>

          {/* Escape Pod Picker */}
          <View style={styles.row}>
            <CustomText style={styles.label} small bold>
              Escape Pod:
            </CustomText>
            <View style={styles.pickerWrapper}>
              <DropdownPicker
                options={ESCAPE_PODS}
                selectedValue={player.escapePod}
                onValueChange={value => updatePlayer({ escapePod: value })}
                disabled={!isEditable}
              />
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
                editable={isEditable}
                onChangeText={text => updatePlayer({ location: text })}
              />
            </Animated.View>
          </View>

          <SkillTokens
            skillTokens={player.skillTokens}
            skillTokenIconMap={skillTokenIconMap}
            isEditable={isEditable}
            onUpdate={newTokens => updatePlayer({ skillTokens: newTokens })}
          />

          {/* Impact Dice */}
          <View style={{ marginTop: 16 }}>
            <CustomText style={styles.subHeader} small bold>
              Impact Dice Slots
            </CustomText>
            <View style={styles.impactGrid}>
              {player.impactDiceSlots.map(slot => (
                <View key={slot.id} style={styles.impactSlot}>
                  <Pressable
                    onPress={() =>
                      isEditable &&
                      handleUpdateImpactSlot(slot.id, {
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
                        handleUpdateImpactSlot(slot.id, { symbol: value })
                      }
                    />
                  </View>
                  {isEditable && (
                    <Pressable
                      onPress={() =>
                        isEditable && handleRemoveImpactSlot(slot.id)
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

          <StatusUpdates
            statuses={player.statuses}
            isEditable={isEditable}
            onUpdate={newStatuses => updatePlayer({ statuses: newStatuses })}
          />

          {/* Journal */}
          <View style={{ marginTop: 16 }}>
            <CustomText style={styles.subHeader} small bold>
              Journal
            </CustomText>
            <TextInput
              style={styles.journalInput}
              multiline
              value={player.journalText}
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
    fontFamily: 'Roboto-Regular',
    fontSize: 18,
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
  journalInput: {
    height: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
});

export default PlayerCard;
