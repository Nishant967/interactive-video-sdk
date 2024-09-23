import { Video, InteractiveOption, WidgetPosition, WidgetStyle, SDKOptions } from './types';

class InteractiveVideoSDK {
  private container: HTMLElement;
  private widget: HTMLElement;
  private videoContainer: HTMLElement;
  private video: HTMLVideoElement;
  private videoOverlay: HTMLElement;
  private playPauseButton: HTMLElement;
  private minimizedWidget: HTMLElement;
  private optionsContainer: HTMLElement;
  private progressBar: HTMLProgressElement;
  private controlsContainer: HTMLDivElement;
  private isMinimized: boolean = true;
  private position: WidgetPosition;
  private style: WidgetStyle;
  private videos: Video[];
  private interactiveOptions: InteractiveOption[];
  private currentVideoId: string | null = null;
  private optionSets: Map<string, InteractiveOption[]>;
  private apiUrl: string | null;
  private isResizing: boolean = false;
  private resizeDirection: string = '';
  private resizeStartX: number = 0;
  private resizeStartY: number = 0;
  private initialWidth: number = 0;
  private initialHeight: number = 0;
  private initialLeft: number = 0;
  private initialTop: number = 0;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;

  constructor(private options: SDKOptions) {
    this.videos = options.videos;
    this.interactiveOptions = options.interactiveOptions;
    this.position = options.position || {
      vertical: 'bottom',
      horizontal: 'right',
      offset: { vertical: 20, horizontal: 20 }
    };
    this.style = {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonColor: '#f0f0f0',
      buttonTextColor: '#000000',
      borderRadius: 10,
      width: 350,
      height: 450,
      ...options.style
    };

    this.container = document.createElement('div');
    this.widget = document.createElement('div');
    this.videoContainer = document.createElement('div');
    this.video = document.createElement('video');
    this.videoOverlay = document.createElement('div');
    this.playPauseButton = document.createElement('button');
    this.minimizedWidget = document.createElement('div');
    this.optionsContainer = document.createElement('div');
    this.progressBar = document.createElement('progress');
    this.controlsContainer = document.createElement('div');

    this.optionSets = new Map(options.predefinedOptionSets || []);
    this.apiUrl = options.apiUrl || null;

    this.init();
    this.loadVideos();
  }

  /**
   * Loads videos from URLs and converts them to blob URLs.
   */
  private async loadVideos(): Promise<void> {
    for (const video of this.videos) {
      if (typeof video.url === 'string' && !video.url.startsWith('blob:')) {
        try {
          const response = await fetch(video.url);
          const blob = await response.blob();
          video.url = URL.createObjectURL(blob);
        } catch (error) {
          console.error(`Failed to load video ${video.id}:`, error);
        }
      }
    }
  }

  /**
   * Initializes the SDK by creating necessary elements and attaching event listeners.
   */
  private init(): void {
    this.createContainer();
    this.createMinimizedWidget();
    this.createExpandedWidget();
    this.attachEventListeners();
    this.applyPosition();
    this.applyStyle();
    this.addDragFunctionality();
  }

  /**
   * Creates the main container for the widget.
   */
  private createContainer(): void {
    this.container.style.position = 'fixed';
    this.container.style.zIndex = '9999';
    document.body.appendChild(this.container);
  }

  /**
   * Creates the minimized version of the widget.
   */
  private createMinimizedWidget(): void {
    this.minimizedWidget.style.width = '60px';
    this.minimizedWidget.style.height = '60px';
    this.minimizedWidget.style.borderRadius = '50%';
    this.minimizedWidget.style.backgroundImage = `url(${this.options.avatarUrl})`;
    this.minimizedWidget.style.backgroundSize = 'cover';
    this.minimizedWidget.style.cursor = 'pointer';
    this.minimizedWidget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    this.container.appendChild(this.minimizedWidget);
  }

  /**
   * Creates the expanded version of the widget.
   */
  private createExpandedWidget(): void {
    this.widget.style.display = 'none';
    this.widget.style.overflow = 'hidden';
    this.widget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    this.widget.style.position = 'relative';
    this.widget.style.borderRadius = '10px';
    
    this.createVideo();
    this.createControls();
    this.createInteractiveOptions();
    this.createCloseButton();
    this.createReplayButton();
    this.createResizeHandles();
    
    this.container.appendChild(this.widget);
  }

  /**
   * Creates the video element and its overlay.
   */
  private createVideo(): void {
    this.videoContainer.style.position = 'relative';
    this.videoContainer.style.width = '100%';
    this.videoContainer.style.height = '100%';

    this.video.style.width = '100%';
    this.video.style.height = '100%';
    this.video.style.objectFit = 'cover';

    this.videoOverlay.style.position = 'absolute';
    this.videoOverlay.style.top = '0';
    this.videoOverlay.style.left = '0';
    this.videoOverlay.style.width = '100%';
    this.videoOverlay.style.height = '100%';
    this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    this.videoOverlay.style.display = 'flex';
    this.videoOverlay.style.justifyContent = 'center';
    this.videoOverlay.style.alignItems = 'center';
    this.videoOverlay.style.opacity = '0';
    this.videoOverlay.style.transition = 'opacity 0.3s';

    this.playPauseButton.innerHTML = '&#9658;'; // Play icon
    this.playPauseButton.style.fontSize = '48px';
    this.playPauseButton.style.background = 'none';
    this.playPauseButton.style.border = 'none';
    this.playPauseButton.style.color = 'white';
    this.playPauseButton.style.cursor = 'pointer';

    this.videoOverlay.appendChild(this.playPauseButton);
    this.videoContainer.appendChild(this.video);
    this.videoContainer.appendChild(this.videoOverlay);

    this.widget.appendChild(this.videoContainer);

    this.addVideoEventListeners();

    if (this.videos.length > 0) {
      this.playVideo(this.videos[0].id);
    }
  }

  /**
   * Creates the controls for the video.
   */
  private createControls(): void {
    this.controlsContainer.style.position = 'absolute';
    this.controlsContainer.style.top = '0';
    this.controlsContainer.style.left = '0';
    this.controlsContainer.style.right = '0';
    this.controlsContainer.style.height = '4px';
    this.controlsContainer.style.background = 'rgba(255,255,255,0.3)';
  
    const progressIndicator = document.createElement('div');
    progressIndicator.style.width = '0%';
    progressIndicator.style.height = '100%';
    progressIndicator.style.backgroundColor = '#4CAF50';
    progressIndicator.style.transition = 'width 0.1s';
    this.controlsContainer.appendChild(progressIndicator);
  
    const timeDisplay = document.createElement('div');
    timeDisplay.style.position = 'absolute';
    timeDisplay.style.top = '10px';
    timeDisplay.style.right = '50px'; // Moved to the left to avoid overlap
    timeDisplay.style.color = 'white';
    timeDisplay.style.fontSize = '14px';
    timeDisplay.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
  
    this.video.addEventListener('timeupdate', () => {
      const progress = (this.video.currentTime / this.video.duration) * 100;
      progressIndicator.style.width = `${progress}%`;
      const current = this.formatTime(this.video.currentTime);
      const total = this.formatTime(this.video.duration);
      timeDisplay.textContent = `${current} / ${total}`;
    });
  
    this.videoContainer.appendChild(this.controlsContainer);
    this.videoContainer.appendChild(timeDisplay);
  }

  /**
   * Creates the close button for the widget.
   */
  private createCloseButton(): void {
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&#10005;'; // X icon
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.zIndex = '12';
    this.styleButton(closeButton);
    closeButton.addEventListener('click', this.closeWidget);
    this.videoContainer.appendChild(closeButton);
  }

  /**
   * Creates the replay button for the widget.
   */
  private createReplayButton(): void {
    const replayButton = document.createElement('button');
    replayButton.innerHTML = '&#8635;'; // Replay icon
    replayButton.style.position = 'absolute';
    replayButton.style.top = '50px'; // Positioned below the close button
    replayButton.style.right = '10px';
    replayButton.style.zIndex = '11';
    this.styleButton(replayButton);
    replayButton.addEventListener('click', this.replayVideo);
    this.videoContainer.appendChild(replayButton);
  }

  /**
   * Styles a button with common properties.
   * @param button - The button to style.
   */
  private styleButton(button: HTMLButtonElement): void {
    button.style.background = 'rgba(76, 175, 80, 0.7)'; // Semi-transparent green
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '50%';
    button.style.width = '30px';
    button.style.height = '30px';
    button.style.fontSize = '16px';
    button.style.cursor = 'pointer';
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.transition = 'background-color 0.3s';
    button.onmouseover = () => { button.style.backgroundColor = 'rgba(76, 175, 80, 1)'; };
    button.onmouseout = () => { button.style.backgroundColor = 'rgba(76, 175, 80, 0.7)'; };
  }

  /**
   * Creates the interactive options for the widget.
   */
  private createInteractiveOptions(): void {
    this.optionsContainer.style.position = 'absolute';
    this.optionsContainer.style.bottom = '20px';
    this.optionsContainer.style.left = '20px';
    this.optionsContainer.style.right = '20px';
    this.optionsContainer.style.display = 'flex';
    this.optionsContainer.style.justifyContent = 'space-between';
    this.optionsContainer.style.zIndex = '10';
    this.updateInteractiveOptions();
    this.videoContainer.appendChild(this.optionsContainer);
  }

  /**
   * Creates the resize handles for the widget.
   */
  private createResizeHandles(): void {
    const directions = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'];
    directions.forEach(direction => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-${direction}`;
      handle.style.position = 'absolute';
      handle.style.zIndex = '1000';

      switch(direction) {
        case 'n':
        case 's':
          handle.style.left = '0';
          handle.style.right = '0';
          handle.style.height = '10px';
          handle.style.cursor = 'ns-resize';
          break;
        case 'e':
        case 'w':
          handle.style.top = '0';
          handle.style.bottom = '0';
          handle.style.width = '10px';
          handle.style.cursor = 'ew-resize';
          break;
        case 'ne':
        case 'sw':
          handle.style.width = '10px';
          handle.style.height = '10px';
          handle.style.cursor = 'nesw-resize';
          break;
        case 'nw':
        case 'se':
          handle.style.width = '10px';
          handle.style.height = '10px';
          handle.style.cursor = 'nwse-resize';
          break;
      }

      if (direction.includes('n')) handle.style.top = '0';
      if (direction.includes('e')) handle.style.right = '0';
      if (direction.includes('s')) handle.style.bottom = '0';
      if (direction.includes('w')) handle.style.left = '0';

      handle.addEventListener('mousedown', (e) => this.startResize(e, direction));
      this.widget.appendChild(handle);
    });
  }

  /**
   * Adds drag functionality to the widget.
   */
  private addDragFunctionality(): void {
    const dragHandle = document.createElement('div');
    dragHandle.style.position = 'absolute';
    dragHandle.style.top = '0';
    dragHandle.style.left = '0';
    dragHandle.style.right = '0';
    dragHandle.style.height = '30px';
    dragHandle.style.cursor = 'move';
    dragHandle.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';

    dragHandle.addEventListener('mousedown', this.startDrag);
    this.widget.insertBefore(dragHandle, this.widget.firstChild);
  }

  /**
   * Attaches event listeners to the widget.
   */
  private attachEventListeners(): void {
    this.minimizedWidget.addEventListener('click', () => this.toggleWidget());
    document.addEventListener('mousemove', this.resize);
    document.addEventListener('mouseup', this.stopResize);
    document.addEventListener('mousemove', this.drag);
    document.addEventListener('mouseup', this.stopDrag);
  }

  /**
   * Adds event listeners to the video element.
   */
  private addVideoEventListeners(): void {
    this.videoContainer.addEventListener('mouseover', () => {
      this.videoOverlay.style.opacity = '1';
    });

    this.videoContainer.addEventListener('mouseout', () => {
      this.videoOverlay.style.opacity = '0';
    });

    this.playPauseButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePlayPause();
    });

    this.video.addEventListener('play', () => {
      this.playPauseButton.innerHTML = '&#10074;&#10074;'; // Pause icon
    });

    this.video.addEventListener('pause', () => {
      this.playPauseButton.innerHTML = '&#9658;'; // Play icon
    });

    this.video.addEventListener('timeupdate', () => {
      this.updateProgressBar();
    });

    this.progressBar.addEventListener('click', (e) => {
      const rect = this.progressBar.getBoundingClientRect();
      const pos = (e.pageX - rect.left) / this.progressBar.offsetWidth;
      this.video.currentTime = pos * this.video.duration;
    });
  }

  /**
   * Updates the progress bar based on the video's current time.
   */
  private updateProgressBar(): void {
    if (this.video.duration) {
      this.progressBar.value = (this.video.currentTime / this.video.duration) * 100;
    }
  }

  /**
   * Formats time in seconds to a mm:ss string.
   * @param time - The time in seconds.
   * @returns The formatted time string.
   */
  private formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Starts the resize operation.
   * @param e - The mouse event.
   * @param direction - The direction of the resize.
   */
  private startResize = (e: MouseEvent, direction: string): void => {
    e.preventDefault();
    this.isResizing = true;
    this.resizeDirection = direction;
    this.resizeStartX = e.clientX;
    this.resizeStartY = e.clientY;
    this.initialWidth = this.widget.offsetWidth;
    this.initialHeight = this.widget.offsetHeight;
    this.initialLeft = this.widget.offsetLeft;
    this.initialTop = this.widget.offsetTop;
  }

  /**
   * Handles the resize operation.
   * @param e - The mouse event.
   */
  private resize = (e: MouseEvent): void => {
    if (!this.isResizing) return;

    const deltaX = e.clientX - this.resizeStartX;
    const deltaY = e.clientY - this.resizeStartY;

    let newWidth = this.initialWidth;
    let newHeight = this.initialHeight;
    let newLeft = this.initialLeft;
    let newTop = this.initialTop;

    if (this.resizeDirection.includes('e')) newWidth += deltaX;
    if (this.resizeDirection.includes('s')) newHeight += deltaY;
    if (this.resizeDirection.includes('w')) {
      newWidth -= deltaX;
      newLeft += deltaX;
    }
    if (this.resizeDirection.includes('n')) {
      newHeight -= deltaY;
      newTop += deltaY;
    }

    // Enforce minimum size
    newWidth = Math.max(newWidth, 200);
    newHeight = Math.max(newHeight, 150);

    this.widget.style.width = `${newWidth}px`;
    this.widget.style.height = `${newHeight}px`;
    this.widget.style.left = `${newLeft}px`;
    this.widget.style.top = `${newTop}px`;

    this.handleResize();
  }

  /**
   * Stops the resize operation.
   */
  private stopResize = (): void => {
    this.isResizing = false;
  }

  /**
   * Handles the resize event.
   */
  private handleResize = (): void => {
    const newWidth = this.widget.offsetWidth;
    const newHeight = this.widget.offsetHeight;
    this.videoContainer.style.width = '100%';
    this.videoContainer.style.height = '100%';
  }

  /**
   * Starts the drag operation.
   * @param e - The mouse event.
   */
  private startDrag = (e: MouseEvent): void => {
    this.isDragging = true;
    this.dragStartX = e.clientX - this.widget.offsetLeft;
    this.dragStartY = e.clientY - this.widget.offsetTop;
  }

  /**
   * Handles the drag operation.
   * @param e - The mouse event.
   */
  private drag = (e: MouseEvent): void => {
    if (!this.isDragging) return;
    const newLeft = e.clientX - this.dragStartX;
    const newTop = e.clientY - this.dragStartY;
    this.widget.style.left = `${newLeft}px`;
    this.widget.style.top = `${newTop}px`;
  }

  /**
   * Stops the drag operation.
   */
  private stopDrag = (): void => {
    this.isDragging = false;
  }

  /**
   * Updates the interactive options in the widget.
   */
  private updateInteractiveOptions(): void {
    this.optionsContainer.innerHTML = '';
    this.interactiveOptions.forEach((option, index) => {
      const button = document.createElement('button');
      button.textContent = `${String.fromCharCode(65 + index)}. ${option.text}`;
      button.style.padding = '10px 20px';
      button.style.border = 'none';
      button.style.borderRadius = '20px';
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      button.style.color = 'white';
      button.style.cursor = 'pointer';
      button.style.fontSize = '14px';
      button.style.transition = 'background-color 0.3s';
      button.onmouseover = () => { button.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; };
      button.onmouseout = () => { button.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'; };
      button.onclick = () => this.handleOptionClick(option);
      this.optionsContainer.appendChild(button);
    });
  }

  /**
   * Handles the click event for an interactive option.
   * @param option - The interactive option that was clicked.
   */
  private handleOptionClick(option: InteractiveOption): void {
    switch(option.action) {
      case 'playVideo':
        this.playVideo(option.payload);
        break;
      case 'openUrl':
        window.open(option.payload, '_blank');
        break;
      case 'startChat':
        this.startIntercomChat(option.payload);
        break;
      case 'changeOptions':
        this.changeInteractiveOptions(option.payload);
        break;
    }
  }

  /**
   * Changes the interactive options based on the provided options ID.
   * @param optionsId - The ID of the new options to load.
   */
  private async changeInteractiveOptions(optionsId: string): Promise<void> {
    const newOptions = await this.fetchOptions(optionsId);
    this.interactiveOptions = newOptions;
    this.updateInteractiveOptions();
  }

  /**
   * Fetches interactive options from the server or predefined sets.
   * @param optionsId - The ID of the options to fetch.
   * @returns A promise that resolves to the fetched options.
   */
  private async fetchOptions(optionsId: string): Promise<InteractiveOption[]> {
    if (this.optionSets.has(optionsId)) {
      return this.optionSets.get(optionsId)!;
    }

    if (this.apiUrl) {
      try {
        const response = await fetch(`${this.apiUrl}/options/${optionsId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const options: InteractiveOption[] = await response.json();
        this.optionSets.set(optionsId, options);
        return options;
      } catch (error) {
        console.error('Failed to fetch options:', error);
        return [];
      }
    }

    console.warn(`No options found for ID: ${optionsId}`);
    return [];
  }

  /**
   * Plays the video with the specified ID.
   * @param videoId - The ID of the video to play.
   */
  private playVideo(videoId: string): void {
    const video = this.videos.find(v => v.id === videoId);
    if (video) {
      if (typeof video.url === 'string') {
        this.video.src = video.url;
      } else if (video.url instanceof Blob) {
        this.video.src = URL.createObjectURL(video.url);
      }
      this.video.play().catch(error => console.error('Error playing video:', error));
      this.currentVideoId = videoId;
    }
  }

  /**
   * Toggles play/pause state of the video.
   */
  private togglePlayPause(): void {
    if (this.video.paused) {
      this.video.play().catch(error => console.error('Error playing video:', error));
    } else {
      this.video.pause();
    }
  }

  /**
   * Replays the current video.
   */
  private replayVideo = (): void => {
    if (this.currentVideoId) {
      this.playVideo(this.currentVideoId);
    }
  }

  /**
   * Starts an Intercom chat with the provided message.
   * @param message - The message to start the chat with.
   */
  private startIntercomChat(message: string): void {
    this.hide();
    if (window.Intercom) {
      window.Intercom('show');
      if (message) {
        window.Intercom('startConversation', { message: message });
      }
    } else {
      console.error('Intercom is not available');
    }
  }

  /**
   * Toggles the widget between minimized and expanded states.
   */
  private toggleWidget(): void {
    if (this.isMinimized) {
      this.minimizedWidget.style.display = 'none';
      this.widget.style.display = 'block';
      this.widget.style.width = `${this.style.width}px`;
      this.widget.style.height = `${this.style.height}px`;
      if (this.currentVideoId) {
        this.playVideo(this.currentVideoId);
      }
    } else {
      this.minimizedWidget.style.display = 'block';
      this.widget.style.display = 'none';
      this.video.pause();
    }
    this.isMinimized = !this.isMinimized;
  }

  /**
   * Closes the widget and sets the closed state for the session.
   */
  private closeWidget = (): void => {
    this.hide();
    this.setClosedForSession();
  }

  /**
   * Sets the closed state for the session.
   */
  private setClosedForSession(): void {
    sessionStorage.setItem('interactiveVideoWidgetClosed', 'true');
  }

  /**
   * Applies the position settings to the widget.
   */
  private applyPosition(): void {
    this.container.style[this.position.vertical] = `${this.position.offset.vertical}px`;
    this.container.style[this.position.horizontal] = `${this.position.offset.horizontal}px`;
  }

  /**
   * Applies the style settings to the widget.
   */
  private applyStyle(): void {
    this.widget.style.backgroundColor = this.style.backgroundColor;
    this.widget.style.color = this.style.textColor;
    this.widget.style.borderRadius = `${this.style.borderRadius}px`;
    this.widget.style.width = `${this.style.width}px`;
    this.widget.style.height = `${this.style.height}px`;

    const buttons = this.widget.querySelectorAll('button');
    buttons.forEach(button => {
      button.style.backgroundColor = this.style.buttonColor;
      button.style.color = this.style.buttonTextColor;
    });
  }

  /**
   * Sets a new position for the widget.
   * @param newPosition - The new position settings.
   */
  public setPosition(newPosition: Partial<WidgetPosition>): void {
    this.position = { ...this.position, ...newPosition };
    this.applyPosition();
  }

  /**
   * Sets a new style for the widget.
   * @param newStyle - The new style settings.
   */
  public setStyle(newStyle: Partial<WidgetStyle>): void {
    this.style = { ...this.style, ...newStyle };
    this.applyStyle();
  }

  /**
   * Adds a new video to the widget.
   * @param video - The video to add.
   */
  public addVideo(video: Video): void {
    if (typeof video.url === 'string' && !video.url.startsWith('blob:')) {
      fetch(video.url)
        .then(response => response.blob())
        .then(blob => {
          video.url = URL.createObjectURL(blob);
          this.videos.push(video);
        })
        .catch(error => console.error(`Failed to load video ${video.id}:`, error));
    } else {
      this.videos.push(video);
    }
  }

  /**
   * Removes a video from the widget.
   * @param videoId - The ID of the video to remove.
   */
  public removeVideo(videoId: string): void {
    this.videos = this.videos.filter(v => v.id !== videoId);
    if (this.currentVideoId === videoId) {
      this.currentVideoId = null;
      if (this.videos.length > 0) {
        this.playVideo(this.videos[0].id);
      }
    }
  }

  /**
   * Adds a new interactive option to the widget.
   * @param option - The interactive option to add.
   */
  public addInteractiveOption(option: InteractiveOption): void {
    this.interactiveOptions.push(option);
    this.updateInteractiveOptions();
  }

  /**
   * Removes an interactive option from the widget.
   * @param optionId - The ID of the option to remove.
   */
  public removeInteractiveOption(optionId: string): void {
    this.interactiveOptions = this.interactiveOptions.filter(o => o.id !== optionId);
    this.updateInteractiveOptions();
  }

  /**
   * Adds a new option set to the widget.
   * @param id - The ID of the option set.
   * @param options - The options to add.
   */
  public addOptionSet(id: string, options: InteractiveOption[]): void {
    this.optionSets.set(id, options);
  }

  /**
   * Removes an option set from the widget.
   * @param id - The ID of the option set to remove.
   */
  public removeOptionSet(id: string): void {
    this.optionSets.delete(id);
  }

  /**
   * Sets the API URL for fetching options.
   * @param url - The API URL.
   */
  public setApiUrl(url: string): void {
    this.apiUrl = url;
  }

  /**
   * Shows the widget.
   */
  public show(): void {
    if (sessionStorage.getItem('interactiveVideoWidgetClosed') !== 'true') {
      this.container.style.display = 'block';
    }
  }

  /**
   * Hides the widget.
   */
  public hide(): void {
    this.container.style.display = 'none';
  }

  /**
   * Resets the closed state for the session.
   */
  public resetClosedState(): void {
    sessionStorage.removeItem('interactiveVideoWidgetClosed');
  }
}

export default InteractiveVideoSDK;