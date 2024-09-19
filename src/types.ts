export interface Video {
  id: string;
  url: string;
  title: string;
}

export interface InteractiveOption {
  id: string;
  text: string;
  action: 'playVideo' | 'openUrl' | 'startChat';
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

export interface SDKOptions {
  videos: Video[];
  avatarUrl: string;
  name: string;
  interactiveOptions: InteractiveOption[];
  position?: WidgetPosition;
  style?: Partial<WidgetStyle>;
}

declare global {
  interface Window {
    Intercom: any;
  }
}