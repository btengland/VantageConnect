import { useState } from 'react';
import { View, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import CustomText from './CustomText';

type DropdownPickerProps = {
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
};

const DropdownPicker = ({
  options,
  selectedValue,
  onValueChange,
  disabled = false,
}: DropdownPickerProps) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={() => !disabled && setVisible(true)}
      >
        <CustomText style={{ color: selectedValue ? '#000' : '#d6d6d6' }} small>
          {selectedValue || 'Select...'}
        </CustomText>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => handleSelect(item)}
                >
                  <CustomText small>{item}</CustomText>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: 210 },
  button: {
    backgroundColor: '#eee',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 6,
    width: '80%',
    maxHeight: '50%',
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default DropdownPicker;
