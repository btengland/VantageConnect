import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';

type CustomTextProps = TextProps & {
  bold?: boolean;
  small?: boolean;
};

function CustomText(props: CustomTextProps) {
  const { style, bold = false, small = false, ...rest } = props;

  return (
    <Text
      {...rest}
      style={[
        styles.text,
        bold && styles.bold,
        small && styles.small,
        style as TextStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 16,
    color: '#000',
  },
  bold: {
    fontFamily: 'Orbitron-Bold',
  },
  small: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
  },
});

export default CustomText;
