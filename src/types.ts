export interface Video {
  id: string;
  url: string | Blob;
  title: string;
}

export interface InteractiveOption {
  id: string;
  text: string;
  action: 'playVideo' | 'openUrl' | 'startChat' | 'changeOptions';
  payload: string;
}

export interface WidgetPosition {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'right';
  offset: {
    vertical: number;
    horizontal: number;
  };
}

export interface WidgetStyle {
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  borderRadius: number;
  width: number;
  height: number;
}

export type OptionSet = [string, InteractiveOption[]];

export interface SDKOptions {
  videos: Video[];
  avatarUrl: string;
  name: string;
  interactiveOptions: InteractiveOption[];
  position?: WidgetPosition;
  style?: Partial<WidgetStyle>;
  predefinedOptionSets?: OptionSet[];
  apiUrl?: string;
}

declare global {
  interface Window {
    Intercom: any;
  }
}