// JoinHostModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  Text,
  Pressable,
  View,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SharedStyles } from './SharedStyles';

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

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={() => toggleModal('')}
    >
      <View style={[SharedStyles.flexCenter, SharedStyles.dimBackground]}>
        <View style={SharedStyles.modalView}>
          <Text style={styles.modalText}>
            {buttonPressed === 'join' ? 'Join' : 'Host'} a Game
          </Text>

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
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>

            <Pressable
              style={styles.button}
              onPress={() => toggleModal('', true)}
            >
              <Text style={styles.textStyle}>
                {buttonPressed === 'join' ? 'Join' : 'Host'} Game
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalText: {
    fontSize: 18,
    marginBottom: 15,
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
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default JoinHostModal;
