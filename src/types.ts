// Interface representing a video with an ID, URL, and title
export interface Video {
  id: string; // Unique identifier for the video
  url: string | Blob; // URL can be a string or a Blob object
  title: string; // Title of the video
}

// Interface representing an interactive option with an ID, text, action type, and payload
export interface InteractiveOption {
  id: string; // Unique identifier for the interactive option
  text: string; // Display text for the option
  action: 'playVideo' | 'openUrl' | 'startChat' | 'changeOptions'; // Enum-like action types
  payload: string; // Payload associated with the action (e.g., video ID or URL)
}

// Interface representing the position of a widget with vertical and horizontal alignment and offsets
export interface WidgetPosition {
  vertical: 'top' | 'bottom'; // Vertical alignment of the widget
  horizontal: 'left' | 'right'; // Horizontal alignment of the widget
  offset: {
    vertical: number; // Vertical offset in pixels
    horizontal: number; // Horizontal offset in pixels
  };
}

// Interface representing the style properties of a widget
export interface WidgetStyle {
  backgroundColor: string; // Background color of the widget
  textColor: string; // Text color within the widget
  buttonColor: string; // Color of buttons in the widget
  buttonTextColor: string; // Text color of buttons
  borderRadius: number; // Border radius of the widget in pixels
  width: number; // Width of the widget in pixels
  height: number; // Height of the widget in pixels
}

// Type representing a set of options, where the first element is a string and the second is an array of InteractiveOption
export type OptionSet = [string, InteractiveOption[]];

// Interface representing the options for the SDK
export interface SDKOptions {
  videos: Video[]; // Array of videos
  avatarUrl: string; // URL of the avatar image
  name: string; // Name of the user or entity
  interactiveOptions: InteractiveOption[]; // Array of interactive options
  position?: WidgetPosition; // Optional position of the widget
  style?: Partial<WidgetStyle>; // Optional style properties of the widget
  predefinedOptionSets?: OptionSet[]; // Optional predefined sets of options
  apiUrl?: string; // Optional API URL
}

// Extending the global Window interface to include Intercom
declare global {
  interface Window {
    Intercom: any; // Intercom object of any type
  }
}