import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomText from '../CustomText';
import IconPicker from '../IconPicker';
import { IMPACT_SYMBOLS } from '../../constants';

type ImpactDiceSlot = { symbol: string; checked: boolean };

type PlayerImpactDiceProps = {
  isEditable: boolean;
  impactDiceSlots: ImpactDiceSlot[];
  onUpdate: (slots: ImpactDiceSlot[]) => void;
};

const PlayerImpactDice: React.FC<PlayerImpactDiceProps> = ({
  isEditable,
  impactDiceSlots,
  onUpdate,
}) => {
  const handleAddImpactSlot = () => {
    if (!isEditable) return;
    onUpdate([...impactDiceSlots, { symbol: 'any', checked: false }]);
  };

  const handleUpdateImpactSlot = (index: number, newSlot: ImpactDiceSlot) => {
    if (!isEditable) return;
    const slots = [...impactDiceSlots];
    slots[index] = newSlot;
    onUpdate(slots);
  };

  const handleRemoveImpactSlot = (index: number) => {
    if (!isEditable) return;
    const slots = impactDiceSlots.filter((_, i) => i !== index);
    onUpdate(slots);
  };

  return (
    <View style={{ marginTop: 16 }}>
      <CustomText style={styles.subHeader} small bold>
        Impact Dice Slots
      </CustomText>
      <View style={styles.impactGrid}>
        {impactDiceSlots.map((slot, index) => (
          <View key={index} style={styles.impactSlot}>
            <Pressable
              onPress={() =>
                isEditable &&
                handleUpdateImpactSlot(index, { ...slot, checked: !slot.checked })
              }
            >
              <MaterialCommunityIcons
                name={slot.checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
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
                  handleUpdateImpactSlot(index, { ...slot, symbol: value })
                }
              />
            </View>
            {isEditable && (
              <Pressable onPress={() => isEditable && handleRemoveImpactSlot(index)}>
                <MaterialCommunityIcons name="delete" size={24} color="red" />
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
  );
};

const styles = StyleSheet.create({
  subHeader: {
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 6,
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
});

export default PlayerImpactDice;
