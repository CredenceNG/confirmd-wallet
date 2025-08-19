declare module "*.svg" {
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare module "react-native-argon2";

declare module "@react-native-community/netinfo/jest/netinfo-mock";

declare module "react-native-vector-icons/MaterialIcons" {
  import { Component } from "react";
  export interface IconProps {
    size?: number;
    name: string;
    color?: string;
    style?: any;
  }
  const Icon: React.FC<IconProps>;
  export default Icon;
}

declare module "react-native-vector-icons/MaterialCommunityIcons" {
  import { Component } from "react";
  export interface IconProps {
    size?: number;
    name: string;
    color?: string;
    style?: any;
  }
  const Icon: React.FC<IconProps>;
  export default Icon;
}
