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
import { hostGame, joinGame } from '../api';

type GameData = {
  playerId: string;
  sessionCode: string;
};

type JoinHostModalProps = {
  isOpen: boolean;
  toggleModal: (type: string, data?: GameData) => void;
  buttonPressed: string;
};

const JoinHostModal = ({
  isOpen,
  toggleModal,
  buttonPressed,
}: JoinHostModalProps) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      let data;
      if (buttonPressed === 'host') {
        data = await hostGame();
      } else {
        if (text.length !== 6) {
          Alert.alert('Error', 'Please enter a valid 6-digit session code.');
          setLoading(false);
          return;
        }
        data = await joinGame(text);
      }
      toggleModal(buttonPressed, data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
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
            {buttonPressed === 'join' ? 'Join' : 'Host'} a Game
          </CustomText>

          {buttonPressed === 'join' && (
            <TextInput
              style={styles.textInput}
              onChangeText={setText}
              value={text}
              placeholder={'Enter six digit code'}
              keyboardType="number-pad"
              maxLength={6}
            />
          )}

          {loading ? (
            <ActivityIndicator size="large" color="#2196F3" />
          ) : (
            <View style={SharedStyles.buttonContainer}>
              <Pressable style={styles.button} onPress={() => toggleModal('')}>
                <CustomText style={styles.textStyle} small bold>
                  Close
                </CustomText>
              </Pressable>

              <Pressable style={styles.button} onPress={handleAction}>
                <CustomText style={styles.textStyle} small bold>
                  {buttonPressed === 'join' ? 'Join' : 'Host'} Game
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
