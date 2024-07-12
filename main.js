import './style.css'

let images = [
  // { url: '/266-1920x1080.jpg', caption: '자연의 아름다움' },
  // { url: '/277-1920x1080.jpg', caption: '도시의 불빛' },
  // { url: '/370-1920x1080.jpg', caption: '고요한 바다' },
  // { url: '/484-1920x1080.jpg', caption: '산의 정상' },

  // { url: 'https://picsum.photos/1920/1080?random=1', caption: '자연의 아름다움' },
  // { url: 'https://picsum.photos/1920/1080?random=2', caption: '도시의 불빛' },
  // { url: 'https://picsum.photos/1920/1080?random=3', caption: '고요한 바다' },
  // { url: 'https://picsum.photos/1920/1080?random=4', caption: '산의 정상' },
  // { url: 'https://picsum.photos/1920/1080?random=5', caption: '숲속의 오솔길' },
];

let currentImageIndex = -1;
let preloadedImages = {};

const imageElement = document.getElementById('main-image');
const captionElement = document.getElementById('caption');
const app = document.getElementById('app');

// 프로젝트
const baseUrl = 'http://localhost:8765/';
let projectId = null;

async function loadProject() {
    // const urlParams = new URLSearchParams(window.location.search);
    // projectId = urlParams.get('id');

    const pathSegments = window.location.pathname.split('/');
    projectId = pathSegments[pathSegments.length - 1];
    
    if (projectId) {
        const response = await fetch(`${baseUrl}/api/project/${projectId}`);
        if (response.ok) {
            images = await response.json();
            console.log(images);
            preloadNextImage(currentImageIndex);
            setImageAndCaption();
        } else {
            console.error('Failed to load project');
        }
    }
}

loadProject();

function preloadNextImage(index) {
  const nextIndex = (index + 1) % images.length;
  const nextImage = images[nextIndex];
  
  if (!preloadedImages[nextIndex]) {
    const img = new Image();
    img.src = nextImage.url;
    img.onload = () => {
      preloadedImages[nextIndex] = img;
    };
  }
}

function getNextImage() {
  currentImageIndex = (currentImageIndex + 1) % images.length;
  return images[currentImageIndex];
}

function resetImageStyle() {
  imageElement.style.transition = 'opacity 0.5s ease';
  imageElement.style.transform = 'translate(-50%, -50%) scale(1)';
  // 강제로 레이아웃 재계산을 유도
  void imageElement.offsetWidth;
}

function setImageAndCaption() {
  const { url, caption } = getNextImage();

  imageElement.classList.add('fade-out');

  setTimeout(() => {
    resetImageStyle();

    if (preloadedImages[currentImageIndex]) {
      imageElement.src = preloadedImages[currentImageIndex].src;
    } else {
      imageElement.src = url;
    }
    captionElement.textContent = caption;

    imageElement.classList.remove('fade-out');
    imageElement.classList.add('fade-in');

    // 줌 효과 적용
    setTimeout(() => {
      const scale = Math.random() < 0.5 ? 1.1 : 0.9;
      imageElement.style.transition = 'opacity 0.5s ease, transform 20s ease-in-out';
      imageElement.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }, 50);

    // 다음 이미지 미리 로드
    preloadNextImage(currentImageIndex);

  }, 500);
}

app.addEventListener('click', setImageAndCaption);

// 초기 이미지 설정 및 다음 이미지 미리 로드
// preloadNextImage(currentImageIndex);
// setImageAndCaption();