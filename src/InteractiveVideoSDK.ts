import { Video, InteractiveOption, WidgetPosition, WidgetStyle, SDKOptions, OptionSet } from './types';

class InteractiveVideoSDK {
  private container: HTMLElement;
  private widget: HTMLElement;
  private video: HTMLVideoElement;
  private minimizedWidget: HTMLElement;
  private optionsContainer: HTMLElement;
  private isMinimized: boolean = true;
  private position: WidgetPosition;
  private style: WidgetStyle;
  private videos: Video[];
  private interactiveOptions: InteractiveOption[];
  private currentVideoId: string | null = null;
  private optionSets: Map<string, InteractiveOption[]>;
  private apiUrl: string | null;
  private isResizing: boolean = false;
  private resizeStartX: number = 0;
  private resizeStartY: number = 0;
  private initialWidth: number = 0;
  private initialHeight: number = 0;

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
      width: 300,
      height: 400,
      ...options.style
    };

    this.container = document.createElement('div');
    this.widget = document.createElement('div');
    this.video = document.createElement('video');
    this.minimizedWidget = document.createElement('div');
    this.optionsContainer = document.createElement('div');

    this.optionSets = new Map(options.predefinedOptionSets || []);
    this.apiUrl = options.apiUrl || null;

    this.init();
    this.loadVideos();
  }

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

  private init(): void {
    this.createContainer();
    this.createMinimizedWidget();
    this.createExpandedWidget();
    this.attachEventListeners();
    this.applyPosition();
    this.applyStyle();
  }

  private createContainer(): void {
    this.container.style.position = 'fixed';
    this.container.style.zIndex = '9999';
    document.body.appendChild(this.container);
  }

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

  private createExpandedWidget(): void {
    this.widget.style.display = 'none';
    this.widget.style.overflow = 'hidden';
    this.widget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    this.widget.style.position = 'relative';
    
    this.createVideo();
    this.createInteractiveOptions();
    this.createResizeHandle();
    
    this.container.appendChild(this.widget);
  }

  private createVideo(): void {
    this.video.style.width = '100%';
    this.video.style.height = 'calc(100% - 40px)';
    this.video.style.objectFit = 'cover';
    if (this.videos.length > 0) {
      this.playVideo(this.videos[0].id);
    }
    this.widget.appendChild(this.video);
  }

  private createInteractiveOptions(): void {
    this.optionsContainer.style.position = 'absolute';
    this.optionsContainer.style.bottom = '0';
    this.optionsContainer.style.left = '0';
    this.optionsContainer.style.width = '100%';
    this.optionsContainer.style.height = '40px';
    this.optionsContainer.style.display = 'flex';
    this.optionsContainer.style.justifyContent = 'space-around';
    this.optionsContainer.style.alignItems = 'center';
    this.optionsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.updateInteractiveOptions();
    this.widget.appendChild(this.optionsContainer);
  }

  private createResizeHandle(): void {
    const resizeHandle = document.createElement('div');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.right = '0';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.width = '20px';
    resizeHandle.style.height = '20px';
    resizeHandle.style.cursor = 'se-resize';
    resizeHandle.style.background = 'rgba(0, 0, 0, 0.3)';
    resizeHandle.addEventListener('mousedown', this.startResize);
    this.widget.appendChild(resizeHandle);
  }

  private attachEventListeners(): void {
    this.minimizedWidget.addEventListener('click', () => this.toggleWidget());
    window.addEventListener('mousemove', this.resize);
    window.addEventListener('mouseup', this.stopResize);
  }

  private startResize = (e: MouseEvent): void => {
    e.preventDefault();
    this.isResizing = true;
    this.resizeStartX = e.clientX;
    this.resizeStartY = e.clientY;
    this.initialWidth = this.widget.offsetWidth;
    this.initialHeight = this.widget.offsetHeight;
  }

  private resize = (e: MouseEvent): void => {
    if (!this.isResizing) return;
    const deltaX = e.clientX - this.resizeStartX;
    const deltaY = e.clientY - this.resizeStartY;
    const newWidth = Math.max(200, this.initialWidth + deltaX);
    const newHeight = Math.max(150, this.initialHeight + deltaY);
    this.widget.style.width = `${newWidth}px`;
    this.widget.style.height = `${newHeight}px`;
    this.handleResize();
  }

  private stopResize = (): void => {
    this.isResizing = false;
  }

  private handleResize = (): void => {
    const newWidth = this.widget.offsetWidth;
    const newHeight = this.widget.offsetHeight;
    this.video.style.width = '100%';
    this.video.style.height = `${newHeight - 40}px`;
    this.optionsContainer.style.height = '40px';
  }

  private updateInteractiveOptions(): void {
    this.optionsContainer.innerHTML = '';
    this.interactiveOptions.forEach(option => {
      const button = document.createElement('button');
      button.textContent = option.text;
      button.style.padding = '5px 10px';
      button.style.border = 'none';
      button.style.borderRadius = '5px';
      button.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      button.style.cursor = 'pointer';
      button.onclick = () => this.handleOptionClick(option);
      this.optionsContainer.appendChild(button);
    });
  }

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

  private async changeInteractiveOptions(optionsId: string): Promise<void> {
    const newOptions = await this.fetchOptions(optionsId);
    this.interactiveOptions = newOptions;
    this.updateInteractiveOptions();
  }

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

  private applyPosition(): void {
    this.container.style[this.position.vertical] = `${this.position.offset.vertical}px`;
    this.container.style[this.position.horizontal] = `${this.position.offset.horizontal}px`;
  }

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

  public setPosition(newPosition: Partial<WidgetPosition>): void {
    this.position = { ...this.position, ...newPosition };
    this.applyPosition();
  }

  public setStyle(newStyle: Partial<WidgetStyle>): void {
    this.style = { ...this.style, ...newStyle };
    this.applyStyle();
  }

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

  public removeVideo(videoId: string): void {
    this.videos = this.videos.filter(v => v.id !== videoId);
    if (this.currentVideoId === videoId) {
      this.currentVideoId = null;
      if (this.videos.length > 0) {
        this.playVideo(this.videos[0].id);
      }
    }
  }

  public addInteractiveOption(option: InteractiveOption): void {
    this.interactiveOptions.push(option);
    this.updateInteractiveOptions();
  }

  public removeInteractiveOption(optionId: string): void {
    this.interactiveOptions = this.interactiveOptions.filter(o => o.id !== optionId);
    this.updateInteractiveOptions();
  }

  public addOptionSet(id: string, options: InteractiveOption[]): void {
    this.optionSets.set(id, options);
  }

  public removeOptionSet(id: string): void {
    this.optionSets.delete(id);
  }

  public setApiUrl(url: string): void {
    this.apiUrl = url;
  }

  public show(): void {
    this.container.style.display = 'block';
  }

  public hide(): void {
    this.container.style.display = 'none';
  }
}

export default InteractiveVideoSDK;