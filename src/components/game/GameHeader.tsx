import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import CustomText from '../CustomText';

type GameHeaderProps = {
  sessionCode: number;
  challengeDice: number;
  isMyTurn: boolean;
  onDiceChange: (delta: number) => void;
};

const GameHeader = ({
  sessionCode,
  challengeDice,
  isMyTurn,
  onDiceChange,
}: GameHeaderProps) => {
  return (
    <>
      <View style={styles.sessionCode}>
        <CustomText style={styles.mainText} small>
          Session Code: {sessionCode}
        </CustomText>
      </View>

      <View style={styles.diceContainer}>
        <CustomText style={styles.mainText} bold>
          Available Dice:
        </CustomText>
        <View style={styles.diceControl}>
          {isMyTurn && (
            <Pressable
              onPress={() => onDiceChange(-1)}
              style={[
                styles.diceButton,
                challengeDice === 0 && styles.diceButtonDisabled,
              ]}
            >
              <CustomText style={styles.diceButtonText}>-</CustomText>
            </Pressable>
          )}

          <CustomText style={styles.diceValue}>{challengeDice}</CustomText>

          {isMyTurn && (
            <Pressable
              onPress={() => onDiceChange(1)}
              style={styles.diceButton}
            >
              <CustomText style={styles.diceButtonText}>+</CustomText>
            </Pressable>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  mainText: {
    fontSize: 24,
  },
  sessionCode: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  diceContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderRadius: 16,
    padding: 16,
    alignSelf: 'center',
    alignItems: 'center',
  },
  diceControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },
  diceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceButtonDisabled: {
    backgroundColor: '#666',
  },
  diceButtonText: {
    color: 'white',
    fontSize: 24,
  },
  diceValue: {
    fontSize: 24,
  },
});

export default GameHeader;
