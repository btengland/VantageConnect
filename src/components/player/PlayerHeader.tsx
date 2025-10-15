import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomText from '../CustomText';
import { CHARACTERS, ESCAPE_PODS } from '../../constants';
import { SharedStyles } from '../SharedStyles';
import { endTurn } from '../../api';
import { Player } from '../../store/playerStore';

type PlayerHeaderProps = {
  isEditable: boolean;
  player: Player;
  totalPlayers: number;
  onNameChange: (name: string) => void;
  onCharacterChange: (character: string) => void;
  onEscapePodChange: (escapePod: string) => void;
  onFocus: (field: string) => void;
  onBlur: () => void;
};

const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  isEditable,
  player,
  totalPlayers,
  onNameChange,
  onCharacterChange,
  onEscapePodChange,
  onFocus,
  onBlur,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (player.turn) setIsLoading(false);
  }, [player.turn]);

  const handleEndTurn = async () => {
    if (!isEditable || isLoading) return;
    setIsLoading(true);
    try {
      await endTurn(player.sessionCode, player.id);
    } catch (err) {
      console.error('End turn failed', err);
      setIsLoading(false);
    }
  };

  const renderPickerItems = (items: string[]) =>
    items.map(item => <Picker.Item key={item} label={item} value={item} />);

  return (
    <View>
      <CustomText style={styles.sectionHeader} small bold>
        {getOrdinal(player.playerNumber)} Player
      </CustomText>

      {player.turn && isEditable && (
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
                opacity: pressed || isLoading || totalPlayers <= 1 ? 0.5 : 1,
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

      <View style={styles.row}>
        <CustomText style={styles.label} small bold>
          Player Name:
        </CustomText>
        <TextInput
          style={styles.value}
          value={player.name}
          placeholder="Enter your name"
          editable={isEditable}
          onChangeText={onNameChange}
          onFocus={() => onFocus('name')}
          onBlur={onBlur}
        />
      </View>

      <View style={styles.row}>
        <CustomText style={styles.label} small bold>
          Character:
        </CustomText>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={player.character}
            style={Platform.OS === 'android' ? styles.pickerAndroid : undefined}
            itemStyle={styles.pickerItem}
            enabled={isEditable}
            onValueChange={onCharacterChange}
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

      <View style={styles.row}>
        <CustomText style={styles.label} small bold>
          Escape Pod:
        </CustomText>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={player.escapePod}
            style={Platform.OS === 'android' ? styles.pickerAndroid : undefined}
            itemStyle={styles.pickerItem}
            enabled={isEditable}
            onValueChange={onEscapePodChange}
          >
            {renderPickerItems(ESCAPE_PODS)}
          </Picker>
        </View>
      </View>
    </View>
  );
};

const getOrdinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const styles = StyleSheet.create({
  sectionHeader: {
    textAlign: 'center',
    borderBottomWidth: 1,
    marginBottom: 16,
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
});

export default PlayerHeader;
