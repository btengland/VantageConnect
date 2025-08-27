import React, { useState } from 'react';
import { Modal, Pressable, View, StyleSheet, TextInput } from 'react-native';
import { SharedStyles } from './SharedStyles';
import CustomText from './CustomText'; // import CustomText
import { useWebSocket } from './useWebSocket';

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
  const [text, setText] = useState('');

  const { connected, sendMessage } = useWebSocket({
    url: 'wss://gh1j093d4d.execute-api.us-east-2.amazonaws.com/production/',
    onMessage: (data: any) => {
      console.log('Received WS message:', data);
    },
  });

  const handleJoinHost = () => {
    if (buttonPressed === 'join') {
      sendMessage({ action: 'joinSession', sessionCode: text });
    } else {
      sendMessage({ action: 'hostSession' });
    }
    toggleModal('', true);
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

          <View style={SharedStyles.buttonContainer}>
            <Pressable style={styles.button} onPress={() => toggleModal('')}>
              <CustomText style={styles.textStyle} small bold>
                Close
              </CustomText>
            </Pressable>

            <Pressable style={styles.button} onPress={handleJoinHost}>
              <CustomText style={styles.textStyle} small bold>
                {buttonPressed === 'join' ? 'Join' : 'Host'} Game
              </CustomText>
            </Pressable>
          </View>
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
