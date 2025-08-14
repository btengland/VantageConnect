import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { webSocketManager } from '../api/websocket';

type JoinHostModalProps = {
  isOpen: boolean;
  toggleModal: (type: string, navigate?: boolean) => void;
  buttonPressed: string;
};

const JoinHostModal = ({
  isOpen,
  toggleModal,
  buttonPressed,
}: JoinHostModalProps) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setRoomNumber('');
    }
  }, [isOpen]);

  const handleJoin = () => {
    if (roomNumber && roomNumber.length === 6) {
      toggleModal('');
      navigation.navigate('Game', { sessionId: roomNumber });
    } else {
      Alert.alert('Invalid Code', 'Please enter a valid 6-digit room code.');
    }
  };

  const handleHost = async () => {
    setIsLoading(true);
    try {
      webSocketManager.onMessage(data => {
        if (data.action === 'sessionCreated' && data.sessionId) {
          webSocketManager.disconnect();
          setIsLoading(false);
          toggleModal('');
          navigation.navigate('Game', { sessionId: data.sessionId });
        }
      });

      await webSocketManager.connect();
      webSocketManager.sendMessage({ action: 'createSession' });
    } catch (error) {
      console.error('Failed to host session:', error);
      Alert.alert(
        'Error',
        'Could not create a game session. Please try again.',
      );
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    toggleModal('');
    if (isLoading) {
      webSocketManager.disconnect();
    }
  };

  const handlePrimaryAction = () => {
    if (buttonPressed === 'host') {
      handleHost();
    } else {
      handleJoin();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={handleClose}
    >
      <View style={SharedStyles.flexCenter}>
        <View style={SharedStyles.modalView}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <>
              <CustomText style={styles.modalText} bold>
                {buttonPressed === 'join' ? 'Join' : 'Host'} a Game
              </CustomText>

              {buttonPressed === 'join' && (
                <TextInput
                  style={styles.textInput}
                  onChangeText={setRoomNumber}
                  value={roomNumber}
                  placeholder={'Enter six digit code'}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              )}

              <View style={SharedStyles.buttonContainer}>
                <Pressable
                  style={styles.button}
                  onPress={handleClose}
                  disabled={isLoading}
                >
                  <CustomText style={styles.textStyle} small bold>
                    Close
                  </CustomText>
                </Pressable>

                <Pressable
                  style={styles.button}
                  onPress={handlePrimaryAction}
                  disabled={isLoading}
                >
                  <CustomText style={styles.textStyle} small bold>
                    {buttonPressed === 'join' ? 'Join' : 'Host'} Game
                  </CustomText>
                </Pressable>
              </View>
            </>
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
