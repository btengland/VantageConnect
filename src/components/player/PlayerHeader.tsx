import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomText from '../CustomText';
import { CHARACTERS, ESCAPE_PODS } from '../../constants';

type PlayerHeaderProps = {
  isEditable: boolean;
  name: string;
  character: string;
  escapePod: string;
  playerNumber: number;
  onNameChange: (name: string) => void;
  onCharacterChange: (character: string) => void;
  onEscapePodChange: (escapePod: string) => void;
  onFocus: (field: string) => void;
  onBlur: () => void;
};

const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  isEditable,
  name,
  character,
  escapePod,
  playerNumber,
  onNameChange,
  onCharacterChange,
  onEscapePodChange,
  onFocus,
  onBlur,
}) => {
  const renderPickerItems = (items: string[]) =>
    items.map(item => <Picker.Item key={item} label={item} value={item} />);

  return (
    <View>
      <CustomText style={styles.sectionHeader} small bold>
        {getOrdinal(playerNumber)} Player
      </CustomText>
      <View style={styles.row}>
        <CustomText style={styles.label} small bold>
          Player Name:
        </CustomText>
        <TextInput
          style={styles.value}
          value={name}
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
            selectedValue={character}
            style={Platform.OS === 'android' ? styles.pickerAndroid : undefined}
            itemStyle={styles.pickerItem}
            enabled={isEditable}
            onValueChange={onCharacterChange}
          >
            <Picker.Item label="Select a character..." value="" enabled={false} />
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
            selectedValue={escapePod}
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

// Helper function, assuming it's available or moved to a shared utils file
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
});

export default PlayerHeader;
