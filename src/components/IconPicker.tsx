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

type Option = {
  label: string;
  value: string;
};

type IconPickerProps = {
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
};

const IconPicker = ({
  options,
  selectedValue,
  onValueChange,
}: IconPickerProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(option => option.value === selectedValue);

  return (
    <>
      <Pressable
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
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
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
                      <MaterialCommunityIcons
                        name={item.value as any}
                        size={24}
                        color="black"
                      />
                      {item.value === 'any' && (
                        <Text style={styles.optionText}>{item.label}</Text>
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
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    minHeight: 60,
  },
  pickerText: {
    fontSize: 16,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default IconPicker;
