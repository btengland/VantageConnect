import { StyleSheet, View, Modal } from 'react-native';
import { SharedStyles } from './SharedStyles';
import CustomText from './CustomText';
import AppButton from './AppButton';

type InfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const InfoModal = ({ isOpen, onClose }: InfoModalProps) => {
  return (
    <Modal animationType="slide" transparent={true} visible={isOpen}>
      <View style={SharedStyles.flexCenter}>
        <View style={SharedStyles.modalView}>
          <CustomText style={styles.header} bold>
            Important Notice
          </CustomText>

          <CustomText style={styles.text} small>
            To keep gameplay fair, this app disconnects you from a session if
            it’s closed or your phone is turned off for more than 5 seconds.
          </CustomText>

          <CustomText style={styles.text} small>
            This prevents players from unintentionally leaving a game running
            and stalling the experience for everyone. This system ensures that
            only active players remain in a lobby.
          </CustomText>

          <View style={SharedStyles.buttonContainer}>
            <AppButton title="Got it" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    marginBottom: 12,
  },
});

export default InfoModal;
