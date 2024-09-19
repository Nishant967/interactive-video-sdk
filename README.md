# Interactive Video SDK

This SDK allows you to easily add interactive video widgets to your web applications. It provides a customizable video player with interactive options, perfect for product demos, tutorials, and customer engagement.

## Installation

You can install the Interactive Video SDK via npm:

```bash
npm install interactive-video-sdk
```

## Usage

Here's a basic example of how to use the Interactive Video SDK:

```javascript
import InteractiveVideoSDK from 'interactive-video-sdk';

const sdk = new InteractiveVideoSDK({
  videos: [
    { id: 'intro', url: 'https://example.com/intro-video.mp4', title: 'Introduction' },
    { id: 'demo', url: 'https://example.com/demo-video.mp4', title: 'Product Demo' }
  ],
  avatarUrl: 'https://example.com/avatar.jpg',
  name: 'Yana',
  interactiveOptions: [
    { 
      id: 'what-is',
      text: "What's our product?", 
      action: 'playVideo',
      payload: 'intro'
    },
    { 
      id: 'show-demo',
      text: "Show me a demo", 
      action: 'playVideo',
      payload: 'demo'
    },
    { 
      id: 'visit-website',
      text: "Visit our website", 
      action: 'openUrl',
      payload: 'https://www.example.com'
    },
    { 
      id: 'chat',
      text: "Chat with support", 
      action: 'startChat',
      payload: "Hi, I'd like to learn more!"
    }
  ],
  position: {
    vertical: 'bottom',
    horizontal: 'right',
    offset: { vertical: 20, horizontal: 20 }
  },
  style: {
    backgroundColor: '#f0f0f0',
    textColor: '#333333',
    buttonColor: '#4CAF50',
    buttonTextColor: '#ffffff',
    borderRadius: 15,
    width: 350,
    height: 450
  }
});

sdk.show();
```

## API Reference

### Constructor Options

The `InteractiveVideoSDK` constructor accepts an options object with the following properties:

- `videos`: An array of video objects, each with `id`, `url`, and `title`.
- `avatarUrl`: URL of the avatar image for the minimized widget.
- `name`: Name of the virtual assistant or product.
- `interactiveOptions`: An array of interactive option objects.
- `position`: Object specifying the widget's position on the page.
- `style`: Object for customizing the widget's appearance.

### Methods

- `show()`: Display the widget.
- `hide()`: Hide the widget.
- `addVideo(video)`: Add a new video to the widget.
- `removeVideo(videoId)`: Remove a video from the widget.
- `addInteractiveOption(option)`: Add a new interactive option.
- `removeInteractiveOption(optionId)`: Remove an interactive option.
- `setPosition(newPosition)`: Update the widget's position.
- `setStyle(newStyle)`: Update the widget's style.

## Customization

You can customize the appearance and behavior of the widget by modifying the `style` and `position` properties in the constructor options, or by using the `setStyle` and `setPosition` methods after initialization.

## Integration with Chat Platforms

This SDK is designed to work seamlessly with Intercom. When a chat action is triggered, it will open the Intercom messenger if available.

## Browser Support

This SDK supports all modern browsers including Chrome, Firefox, Safari, and Edge.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
