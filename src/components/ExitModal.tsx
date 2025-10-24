import React, { useState } from 'react';
import { View, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SharedStyles } from './SharedStyles';
import BaseModal from './BaseModal';
import CustomText from './CustomText';
import { leaveGame } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ExitModalProps = {
  playerId: number;
  isOpen: boolean;
  toggleModal: (navigate?: boolean) => void;
};

const ExitModal = ({ playerId, isOpen, toggleModal }: ExitModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExit = async () => {
    setIsLoading(true);

    try {
      // tell backend to remove me
      await leaveGame(playerId);

      await AsyncStorage.clear();

      // now navigate home
      toggleModal(true);
    } catch (err) {
      console.error('Failed to leave game:', err);
      setIsLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => toggleModal(false)}
      title="Are you sure you want to exit?"
    >
      <View style={SharedStyles.buttonContainer}>
        <Pressable style={styles.button} onPress={() => toggleModal(false)}>
          <CustomText style={styles.textStyle} small bold>
            Close
          </CustomText>
        </Pressable>
        <Pressable style={styles.button} onPress={handleExit}>
          <CustomText style={styles.textStyle} small bold>
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              'Exit'
            )}
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
