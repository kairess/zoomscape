let dropArea = document.getElementById('drop-area');
let gallery = document.getElementById('gallery');
let uploadButton = document.getElementById('upload-button');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropArea.classList.add('highlight');
}

function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    ([...files]).forEach(uploadFile);
}

function uploadFile(file) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function() {
        let img = document.createElement('img');
        img.src = reader.result;
        img.classList.add('thumb');
        let caption = document.createElement('input');
        caption.type = 'text';
        caption.placeholder = 'Enter caption';
        caption.classList.add('caption-input');
        let wrapper = document.createElement('div');
        wrapper.appendChild(img);
        wrapper.appendChild(caption);
        gallery.appendChild(wrapper);
    }
}

uploadButton.addEventListener('click', createSlideshow);

function createSlideshow() {
    let formData = new FormData();
    let images = gallery.getElementsByTagName('img');
    let captions = gallery.getElementsByClassName('caption-input');

    for (let i = 0; i < images.length; i++) {
        let file = dataURLtoFile(images[i].src, `image${i}.jpg`);
        formData.append('files[]', file);
        formData.append('captions[]', captions[i].value);
    }

    fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.project_id) {
            alert(`Slideshow created successfully! Project ID: ${data.project_id}`);
            window.location.href = `/project/${data.project_id}`;
        } else {
            alert('Error creating slideshow. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error creating slideshow. Please try again.');
    });
}

function dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
}