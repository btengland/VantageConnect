import React from 'react';
import { render } from '@testing-library/react-native';
import CustomText from '../src/components/CustomText';

describe('CustomText', () => {
  it('applies the small style when the small prop is true', () => {
    const { getByText } = render(<CustomText small>Small Text</CustomText>);
    const textElement = getByText('Small Text');

    const styles = textElement.props.style;
    const flattenedStyles = styles.flat();

    const hasSmallStyle = flattenedStyles.some(style =>
      style && style.fontFamily === 'Roboto-Regular' && style.fontSize === 18
    );

    expect(hasSmallStyle).toBe(true);
  });
});
