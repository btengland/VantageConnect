import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomText from './CustomText';

type Option = {
  label: string;
  value: string;
};

type IconPickerProps = {
  disabled: boolean;
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
};

const IconPicker = ({
  disabled,
  options,
  selectedValue,
  onValueChange,
}: IconPickerProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(option => option.value === selectedValue);

  return (
    <>
      <Pressable
        disabled={disabled}
        style={styles.picker}
        onPress={() => setModalVisible(true)}
      >
        {selectedOption?.value === 'any' ? (
          <Text style={styles.pickerText}>{selectedOption?.label}</Text>
        ) : (
          <MaterialCommunityIcons
            name={selectedOption?.value as any}
            size={24}
            color="black"
          />
        )}
        <MaterialCommunityIcons name="chevron-down" size={24} color="black" />
      </Pressable>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <FlatList
                  data={options}
                  keyExtractor={item => item.value}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.option}
                      onPress={() => {
                        onValueChange(item.value);
                        setModalVisible(false);
                      }}
                    >
                      {item.value !== 'any' ? (
                        <MaterialCommunityIcons
                          name={item.value as any}
                          size={24}
                          color="black"
                        />
                      ) : (
                        <CustomText small>{item.label}</CustomText>
                      )}
                    </Pressable>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    height: 70,
  },
  pickerText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    width: '20%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  option: {
    padding: 10,
    alignItems: 'center',
  },
});

export default IconPicker;
