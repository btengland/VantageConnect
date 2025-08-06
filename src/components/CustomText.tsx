import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';

type CustomTextProps = TextProps & {
  bold?: boolean;
};

function CustomText(props: CustomTextProps) {
  const { style, bold = false, ...rest } = props;

  return (
    <Text
      {...rest}
      style={[styles.text, bold && styles.bold, style as TextStyle]}
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
});

export default CustomText;
