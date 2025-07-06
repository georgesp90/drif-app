/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  return colorFromProps ?? Colors[theme][colorName];
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}
export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;

  // Check if user explicitly set backgroundColor
  const userStyle = Array.isArray(style) ? Object.assign({}, ...style) : style || {};
  const userDefinedBg = userStyle?.backgroundColor !== undefined;

  // Only apply theme background if user did NOT define their own
  const backgroundColor = userDefinedBg
    ? undefined
    : useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <DefaultView
      style={[style, backgroundColor !== undefined && { backgroundColor }]}
      {...otherProps}
    />
  );
}