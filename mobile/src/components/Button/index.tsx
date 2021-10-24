import React from 'react';

import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  Text, 
  ColorValue,
  ActivityIndicator
} from 'react-native';

import { AntDesign } from '@expo/vector-icons';

import { styles } from './styles';

type Props = TouchableOpacityProps & {
  title: string,
  color: ColorValue,
  backgroundColor: ColorValue,
  icon?: React.ComponentProps<typeof AntDesign>['name'],
  isLoading?: boolean,
}

export function Button({ 
  title, 
  color, 
  backgroundColor, 
  icon, 
  isLoading = false,
  ...rest 
}: Props){
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isLoading}
      style={[
        styles.button,
        {
          backgroundColor
        }
      ]}
      {...rest}
    >
      {
        isLoading ? (
        <ActivityIndicator color={color} />
        ) :(
        <>
          <AntDesign name={icon} size={24} style={styles.icon} />
          <Text
            style={[
              styles.title, 
              {
                color
              }
            ]}
          >
            {title}
          </Text>
        </>
        )
      }
    </TouchableOpacity>
  );
}