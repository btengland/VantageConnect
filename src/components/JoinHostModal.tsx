import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SharedStyles } from './SharedStyles';
import CustomText from './CustomText';
import { joinGame, connectWebSocket } from '../api';

type GameData = {
  playerId: number;
  sessionCode: number;
};

type JoinModalProps = {
  isOpen: boolean;
  toggleModal: (type: string, data?: GameData) => void;
};

const JoinHostModal = ({ isOpen, toggleModal }: JoinModalProps) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinGame = async () => {
    setLoading(true);
    try {
      await connectWebSocket();
      const sessionNumber = Number(text);
      const data = await joinGame(sessionNumber);

      if ((data as any).action === 'error') {
        Alert.alert('Error', 'Failed to join game. Please try again.');
        return;
      }

      const gameData: GameData = {
        playerId: data.playerId,
        sessionCode: data.sessionCode,
      };

      toggleModal('join', gameData);
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setText('');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={() => toggleModal('')}
    >
      <View style={SharedStyles.flexCenter}>
        <View style={SharedStyles.modalView}>
          <CustomText style={styles.modalText} bold>
            Join a Game
          </CustomText>

          <TextInput
            placeholderTextColor="#888888"
            style={styles.textInput}
            onChangeText={setText}
            value={text}
            placeholder="Enter six digit code"
            keyboardType="number-pad"
            maxLength={6}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#2196F3" />
          ) : (
            <View style={SharedStyles.buttonContainer}>
              <Pressable
                style={SharedStyles.closeButton}
                onPress={() => toggleModal('')}
              >
                <CustomText style={styles.textStyle} small bold>
                  Close
                </CustomText>
              </Pressable>

              <Pressable style={styles.button} onPress={handleJoinGame}>
                <CustomText style={styles.textStyle} small bold>
                  Join Game
                </CustomText>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalText: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 20,
  },
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

export default JoinHostModal;
