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
  KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SharedStyles } from './SharedStyles';
import CustomText from './CustomText';
import IconPicker from './IconPicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CHARACTERS, ESCAPE_PODS, IMPACT_SYMBOLS } from '../constants';
import { getOrdinal, lightenColor } from '../utils';
import { Player, ImpactDiceSlot, SkillToken } from '../types';

type PlayerCardProps = {
  player: Player;
  isSelf: boolean;
  getCharacterColor: (characterText: string) => string;
  skillTokenIcons: any[];
  onUpdatePlayer: (player: Player) => void;
  onNextTurn: () => void;
};

function PlayerCard({
  player,
  isSelf,
  getCharacterColor,
  skillTokenIcons,
  onUpdatePlayer,
  onNextTurn,
}: PlayerCardProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const handleUpdate = (field: keyof Player, value: any) => {
    onUpdatePlayer({ ...player, [field]: value });
  };

  const handleAddImpactSlot = () => {
    const newSlots = [
      ...player.impactDiceSlots,
      { symbol: 'any', checked: false },
    ];
    handleUpdate('impactDiceSlots', newSlots);
  };

  const handleUpdateImpactSlot = (index: number, newSlot: ImpactDiceSlot) => {
    const newSlots = [...player.impactDiceSlots];
    newSlots[index] = newSlot;
    handleUpdate('impactDiceSlots', newSlots);
  };

  const handleRemoveImpactSlot = (index: number) => {
    const newSlots = player.impactDiceSlots.filter((_, i) => i !== index);
    handleUpdate('impactDiceSlots', newSlots);
  };

  const handleStatusChange = (
    status: 'heart' | 'star' | 'timer-sand-full',
    change: number,
  ) => {
    const currentLevel = player.statuses[status];
    const newLevel = Math.max(0, Math.min(6, currentLevel + change));
    const newStatuses = { ...player.statuses, [status]: newLevel };
    handleUpdate('statuses', newStatuses);
  };

  const handleSkillTokenChange = (index: number, change: number) => {
      const newTokens = [...player.skillTokens];
      const currentQuantity = newTokens[index].quantity;
      newTokens[index] = { quantity: Math.max(0, currentQuantity + change) };
      handleUpdate('skillTokens', newTokens);
  }

  const lighterBg = lightenColor(getCharacterColor(player.character), 0.8);

  useEffect(() => {
    if (player.turn && isSelf) {
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
    } else {
        pulseAnim.stopAnimation();
        pulseAnim.setValue(0);
    }
  }, [pulseAnim, player.turn, isSelf]);

  const renderPickerItems = (items: string[]) =>
    items.map(item => <Picker.Item key={item} label={item} value={item} />);

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
          <CustomText style={styles.sectionHeader} small bold>
            {player.name}'s Card
          </CustomText>

          {player.turn && (
            <View style={styles.buttonContainer}>
              <View style={[ styles.turnTextContainer, isSelf && styles.myTurnBackground ]}>
                <CustomText style={styles.turnText} small bold>
                  {isSelf ? "It's your turn" : `It's ${player.name}'s turn`}
                </CustomText>
              </View>
              {isSelf && (
                <Pressable onPress={onNextTurn} style={SharedStyles.button}>
                  <CustomText style={SharedStyles.buttonText} small bold>
                    End Turn
                  </CustomText>
                </Pressable>
              )}
            </View>
          )}

          <View style={styles.row}>
            <CustomText style={styles.label} small bold>
              Player Name:
            </CustomText>
            <TextInput
              style={styles.value}
              value={player.name}
              placeholder="Enter your name"
              editable={isSelf}
              onChangeText={(text) => handleUpdate('name', text)}
            />
          </View>

          <View style={styles.row}>
            <CustomText style={styles.label} small bold>
              Character:
            </CustomText>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={player.character}
                enabled={isSelf}
                onValueChange={(value) => handleUpdate('character', value)}
                style={ Platform.OS === 'android' ? styles.pickerAndroid : undefined }
                itemStyle={styles.pickerItem}
              >
                {renderPickerItems(CHARACTERS)}
              </Picker>
            </View>
          </View>
          <View style={styles.row}>
            <CustomText style={styles.label} small bold>
              Escape Pod:
            </CustomText>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={player.escapePod}
                enabled={isSelf}
                onValueChange={(value) => handleUpdate('escapePod', value)}
                style={ Platform.OS === 'android' ? styles.pickerAndroid : undefined }
                itemStyle={styles.pickerItem}
              >
                {renderPickerItems(ESCAPE_PODS)}
              </Picker>
            </View>
          </View>

          <View style={styles.locationContainer}>
            <CustomText style={styles.subHeader} small bold>
              Current Location
            </CustomText>
            <Animated.View style={[ styles.locationInputWrapper, { shadowOpacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] }), shadowRadius: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [5, 15] }), transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05], }), },],},]}>
              <TextInput
                keyboardType="number-pad"
                maxLength={3}
                style={[styles.locationInput, { color: lighterBg }]}
                value={player.location}
                editable={isSelf}
                onChangeText={(text) => handleUpdate('location', text)}
              />
            </Animated.View>
          </View>

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
                          <Image source={skillTokenIcons[index]} style={{ width: 30, height: 30 }} resizeMode="contain"/>
                        </View>
                      </View>
                      <View style={styles.counterContainer}>
                        <Pressable style={styles.tokenButton} disabled={!isSelf} onPress={() => handleSkillTokenChange(index, -1)}>
                          <CustomText style={styles.tokenButtonText}>-</CustomText>
                        </Pressable>
                        <CustomText style={styles.tokenQuantity}>{token.quantity}</CustomText>
                        <Pressable style={styles.tokenButton} disabled={!isSelf} onPress={() => handleSkillTokenChange(index, 1)}>
                          <CustomText style={styles.tokenButtonText}>+</CustomText>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <CustomText style={styles.subHeader} small bold>
              Impact Dice Slots
            </CustomText>
            <View style={styles.impactGrid}>
              {player.impactDiceSlots.map((slot, index) => (
                <View key={index} style={styles.impactSlot}>
                  <Pressable disabled={!isSelf} onPress={() => handleUpdateImpactSlot(index, { ...slot, checked: !slot.checked, }) }>
                    <MaterialCommunityIcons name={ slot.checked ? 'checkbox-marked' : 'checkbox-blank-outline' } size={24} color="black"/>
                  </Pressable>
                  <View style={styles.pickerWrapperImpact}>
                    <IconPicker
                      options={IMPACT_SYMBOLS}
                      selectedValue={slot.symbol}
                      enabled={isSelf}
                      onValueChange={itemValue => handleUpdateImpactSlot(index, { ...slot, symbol: itemValue }) }
                    />
                  </View>
                  <Pressable disabled={!isSelf} onPress={() => handleRemoveImpactSlot(index)}>
                    <MaterialCommunityIcons name="delete" size={24} color="red"/>
                  </Pressable>
                </View>
              ))}
            </View>
            <Pressable style={styles.addButton} disabled={!isSelf} onPress={handleAddImpactSlot}>
              <MaterialCommunityIcons name="flash" size={24} color="white" />
              <CustomText style={styles.addButtonText}>Add Slot</CustomText>
            </Pressable>
          </View>

          <View style={{ marginTop: 16 }}>
            <CustomText style={styles.subHeader} small bold>
              Status Updates
            </CustomText>
            <View style={styles.statusContainer}>
              {(['heart', 'star', 'timer-sand-full'] as const).map(status => (
                <View key={status} style={styles.statusRow}>
                  <MaterialCommunityIcons name={status} size={30} color="black"/>
                  <View style={styles.statusTrack}>
                    {[...Array(6)].map((_, i) => (
                      <Pressable key={i} disabled={!isSelf} onPress={() => handleStatusChange(status, i + 1 - player.statuses[status])}>
                        <View style={[ styles.statusDot, i < player.statuses[status] ? styles.statusDotFilled : {}, ]}/>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.statusControls}>
                    <Pressable disabled={!isSelf} onPress={() => handleStatusChange(status, -1)}>
                      <MaterialCommunityIcons name="minus" size={30} color="black"/>
                    </Pressable>
                    <CustomText style={styles.statusLevel}>{player.statuses[status]}</CustomText>
                    <Pressable disabled={!isSelf} onPress={() => handleStatusChange(status, 1)}>
                      <MaterialCommunityIcons name="plus" size={30} color="black"/>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <CustomText style={styles.subHeader} small bold>
              Journal
            </CustomText>
            <TextInput
              style={styles.journalInput}
              multiline
              editable={isSelf}
              onChangeText={(text) => handleUpdate('journalText', text)}
              value={player.journalText}
              placeholder="Write your notes here..."
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
  card: {
    padding: 24,
    backgroundColor: 'white',
  },
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
