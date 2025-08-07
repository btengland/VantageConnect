import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';

type CustomTextProps = TextProps & {
  bold?: boolean;
  small?: boolean;
};

function CustomText(props: CustomTextProps) {
  const { style, bold = false, small = false, ...rest } = props;

  let textStyle: TextStyle[] = [styles.text];

  if (small && bold) {
    textStyle.push(styles.smallBold);
  } else if (small) {
    textStyle.push(styles.small);
  } else if (bold) {
    textStyle.push(styles.bold);
  }

  if (style) {
    textStyle.push(style as TextStyle);
  }

  return <Text {...rest} style={textStyle} />;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 20,
  },
  bold: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 20,
  },
  small: {
    fontFamily: 'Roboto-Regular',
    fontSize: 18,
  },
  smallBold: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
  },
});

export default CustomText;
