import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Animated, Easing } from 'react-native';
import CustomText from '../CustomText';

type PlayerLocationProps = {
  isEditable: boolean;
  location: string;
  lighterBg: string;
  onLocationChange: (location: string) => void;
  onFocus: (field: string) => void;
  onBlur: () => void;
};

const PlayerLocation: React.FC<PlayerLocationProps> = ({
  isEditable,
  location,
  lighterBg,
  onLocationChange,
  onFocus,
  onBlur,
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.locationContainer}>
      <CustomText style={styles.subHeader} small bold>
        Current Location
      </CustomText>
      <Animated.View
        style={[
          styles.locationInputWrapper,
          {
            shadowOpacity: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.8],
            }),
            shadowRadius: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [5, 15],
            }),
            transform: [
              {
                scale: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.05],
                }),
              },
            ],
          },
        ]}
      >
        <TextInput
          keyboardType="number-pad"
          maxLength={3}
          style={[styles.locationInput, { color: lighterBg }]}
          value={location}
          editable={isEditable}
          onChangeText={onLocationChange}
          onFocus={() => onFocus('location')}
          onBlur={onBlur}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  subHeader: {
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 6,
  },
  locationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
    width: '100%',
  },
  locationInputWrapper: {
    backgroundColor: '#025472',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 30,
  },
  locationInput: {
    width: 90,
    fontSize: 38,
    fontFamily: 'Roboto-Bold',
    backgroundColor: 'transparent',
    textAlign: 'center',
    paddingVertical: 0,
  },
});

export default PlayerLocation;
