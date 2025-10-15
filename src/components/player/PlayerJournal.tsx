import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import CustomText from '../CustomText';

type PlayerJournalProps = {
  isEditable: boolean;
  journalText: string;
  onJournalChange: (text: string) => void;
  onFocus: (field: string) => void;
  onBlur: () => void;
};

const PlayerJournal: React.FC<PlayerJournalProps> = ({
  isEditable,
  journalText,
  onJournalChange,
  onFocus,
  onBlur,
}) => {
  return (
    <View style={{ marginTop: 16 }}>
      <CustomText style={styles.subHeader} small bold>
        Journal
      </CustomText>
      <TextInput
        style={styles.journalInput}
        multiline
        value={journalText}
        placeholder="Write your notes here..."
        editable={isEditable}
        onChangeText={onJournalChange}
        onFocus={() => onFocus('journalText')}
        onBlur={onBlur}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  subHeader: {
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 6,
  },
  journalInput: {
    height: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
});

export default PlayerJournal;
