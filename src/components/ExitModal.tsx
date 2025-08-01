// ExitModal.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SharedStyles } from './SharedStyles';
import BaseModal from './BaseModal';

type ExitModalProps = {
  isOpen: boolean;
  toggleModal: (navigate?: boolean) => void;
};

const ExitModal: React.FC<ExitModalProps> = ({ isOpen, toggleModal }) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => toggleModal(false)}
      title="Are you sure you want to exit?"
    >
      <View style={SharedStyles.buttonContainer}>
        <Pressable style={styles.button} onPress={() => toggleModal(false)}>
          <Text style={styles.textStyle}>Close</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => toggleModal(true)}>
          <Text style={styles.textStyle}>Exit</Text>
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
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ExitModal;
