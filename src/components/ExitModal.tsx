import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { SharedStyles } from './SharedStyles';
import BaseModal from './BaseModal';
import CustomText from './CustomText';

type ExitModalProps = {
  isOpen: boolean;
  toggleModal: (navigate?: boolean) => void;
};

const ExitModal = ({ isOpen, toggleModal }: ExitModalProps) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => toggleModal(false)}
      title="Are you sure you want to exit?"
    >
      <View style={SharedStyles.buttonContainer}>
        <Pressable style={styles.button} onPress={() => toggleModal(false)}>
          <CustomText style={styles.textStyle} bold>
            Close
          </CustomText>
        </Pressable>
        <Pressable style={styles.button} onPress={() => toggleModal(true)}>
          <CustomText style={styles.textStyle} bold>
            Exit
          </CustomText>
        </Pressable>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    textAlign: 'center',
  },
});

export default ExitModal;
