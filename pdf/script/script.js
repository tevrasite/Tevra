// DOM এলিমেন্টস
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    filesGrid: document.getElementById('filesGrid'),
    fileCount: document.getElementById('fileCount'),
    clearFilesBtn: document.getElementById('clearFiles'),
    convertBtn: document.getElementById('convertBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    progressSection: document.getElementById('progressSection'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    resultSection: document.getElementById('resultSection'),
    resultPreview: document.getElementById('resultPreview'),
    filesPreview: document.getElementById('filesPreview'),
    uploadTitle: document.getElementById('uploadTitle'),
    uploadSubtitle: document.getElementById('uploadSubtitle'),
    optionImgToPdf: document.getElementById('option-img-to-pdf'),
    optionPdfToImg: document.getElementById('option-pdf-to-img'),
    imgToPdfSettings: document.getElementById('imgToPdfSettings'),
    pdfToImgSettings: document.getElementById('pdfToImgSettings'),
    helpBtn: document.getElementById('helpBtn'),
    privacyBtn: document.getElementById('privacyBtn'),
    helpModal: document.getElementById('helpModal'),
    closeModal: document.querySelector('.close-modal')
};

// গ্লোবাল ভেরিয়েবল
let selectedFiles = [];
let currentConversionType = 'img-to-pdf';
let convertedResult = null;
let jsPDF = window.jspdf.jsPDF;

// অ্যাপ ইনিশিয়ালাইজেশন
function initApp() {
    console.log('অ্যাপ্লিকেশন শুরু হচ্ছে...');
    
    // ইভেন্ট লিসেনার যোগ
    setupEventListeners();
    
    // ডিফল্ট সেটিংস
    switchConversionType('img-to-pdf');
    
    console.log('অ্যাপ্লিকেশন প্রস্তুত!');
}

// ইভেন্ট লিসেনার সেটাপ
function setupEventListeners() {
    // কনভার্সন টাইপ পরিবর্তন
    elements.optionImgToPdf.addEventListener('click', () => switchConversionType('img-to-pdf'));
    elements.optionPdfToImg.addEventListener('click', () => switchConversionType('pdf-to-img'));
    
    // ফাইল আপলোড
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // ফাইল ম্যানেজমেন্ট
    elements.clearFilesBtn.addEventListener('click', clearAllFiles);
    
    // কনভার্সন ও ডাউনলোড
    elements.convertBtn.addEventListener('click', startConversion);
    elements.downloadBtn.addEventListener('click', downloadResult);
    elements.resetBtn.addEventListener('click', resetApp);
    
    // মোডাল
    elements.helpBtn.addEventListener('click', showHelpModal);
    elements.privacyBtn.addEventListener('click', showPrivacyInfo);
    elements.closeModal.addEventListener('click', () => {
        elements.helpModal.style.display = 'none';
    });
    
    // মোডাল বাইরে ক্লিক
    window.addEventListener('click', (e) => {
        if (e.target === elements.helpModal) {
            elements.helpModal.style.display = 'none';
        }
    });
}

// কনভার্সন টাইপ পরিবর্তন
function switchConversionType(type) {
    console.log(`কনভার্সন টাইপ পরিবর্তন: ${type}`);
    
    currentConversionType = type;
    
    // অপশন কার্ড আপডেট
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('active');
    });
    
    if (type === 'img-to-pdf') {
        elements.optionImgToPdf.classList.add('active');
        elements.uploadTitle.textContent = 'ইমেজ ফাইল নির্বাচন করুন';
        elements.uploadSubtitle.textContent = 'এখানে ক্লিক করুন বা ইমেজ ফাইল ড্র্যাগ করুন';
        elements.fileInput.setAttribute('accept', 'image/*');
        elements.fileInput.setAttribute('multiple', 'true');
        elements.imgToPdfSettings.style.display = 'flex';
        elements.pdfToImgSettings.style.display = 'none';
        
    } else if (type === 'pdf-to-img') {
        elements.optionPdfToImg.classList.add('active');
        elements.uploadTitle.textContent = 'পিডিএফ ফাইল নির্বাচন করুন';
        elements.uploadSubtitle.textContent = 'এখানে ক্লিক করুন বা পিডিএফ ফাইল ড্র্যাগ করুন';
        elements.fileInput.setAttribute('accept', '.pdf');
        elements.fileInput.removeAttribute('multiple');
        elements.imgToPdfSettings.style.display = 'none';
        elements.pdfToImgSettings.style.display = 'flex';
    }
    
    // নির্বাচিত ফাইল রিসেট
    clearAllFiles();
    
    showToast('কনভার্সন টাইপ পরিবর্তন করা হয়েছে', 'success');
}

// ড্র্যাগ ওভার হ্যান্ডলার
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.classList.add('dragover');
}

// ড্র্যাগ লিভ হ্যান্ডলার
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.classList.remove('dragover');
}

// ড্রপ হ্যান্ডলার
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

// ফাইল সিলেক্ট হ্যান্ডলার
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

// ফাইল প্রসেসিং
function processFiles(files) {
    console.log(`প্রসেসিং ফাইল: ${files.length}টি`);
    
    if (files.length === 0) return;
    
    // ফাইল লিমিট চেক
    let maxFiles = currentConversionType === 'img-to-pdf' ? 20 : 1;
    let maxSize = 20 * 1024 * 1024; // 20MB
    
    if (selectedFiles.length + files.length > maxFiles) {
        showToast(`সর্বোচ্চ ${maxFiles}টি ফাইল আপলোড করতে পারবেন`, 'error');
        return;
    }
    
    let validFiles = [];
    
    files.forEach((file, index) => {
        // ফাইল সাইজ চেক
        if (file.size > maxSize) {
            showToast(`"${file.name}" - ফাইল সাইজ খুব বড় (সর্বোচ্চ 20MB)`, 'error');
            return;
        }
        
        // ফাইল টাইপ চেক
        if (currentConversionType === 'img-to-pdf') {
            if (!file.type.startsWith('image/')) {
                showToast(`"${file.name}" - শুধুমাত্র ইমেজ ফাইল সাপোর্টেড`, 'error');
                return;
            }
        } else if (currentConversionType === 'pdf-to-img') {
            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                showToast(`"${file.name}" - শুধুমাত্র PDF ফাইল সাপোর্টেড`, 'error');
                return;
            }
        }
        
        validFiles.push(file);
    });
    
    if (validFiles.length === 0) return;
    
    // ফাইল পড়া শুরু
    let filesProcessed = 0;
    
    validFiles.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const fileData = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result,
                url: URL.createObjectURL(file)
            };
            
            selectedFiles.push(fileData);
            filesProcessed++;
            
            if (filesProcessed === validFiles.length) {
                updateFilePreview();
                elements.fileInput.value = '';
                showToast(`${validFiles.length}টি ফাইল সফলভাবে আপলোড হয়েছে`, 'success');
            }
        };
        
        reader.onerror = function() {
            showToast(`"${file.name}" পড়তে সমস্যা হয়েছে`, 'error');
        };
        
        if (currentConversionType === 'img-to-pdf') {
            reader.readAsDataURL(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
}

// ফাইল প্রিভিউ আপডেট
function updateFilePreview() {
    console.log('ফাইল প্রিভিউ আপডেট হচ্ছে...');
    
    elements.filesGrid.innerHTML = '';
    
    if (selectedFiles.length === 0) {
        elements.filesPreview.classList.remove('active');
        return;
    }
    
    elements.filesPreview.classList.add('active');
    
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.index = index;
        
        let previewContent = '';
        let fileIcon = '';
        
        if (file.type.startsWith('image/')) {
            previewContent = `<img src="${file.url}" alt="${file.name}" class="file-preview">`;
            fileIcon = 'fa-file-image';
        } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            previewContent = `
                <div style="width: 100%; height: 140px; background: linear-gradient(135deg, #e74c3c, #c0392b); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                    <i class="fas fa-file-pdf" style="font-size: 3.5rem; color: white;"></i>
                </div>
            `;
            fileIcon = 'fa-file-pdf';
        }
        
        fileItem.innerHTML = `
            ${previewContent}
            <div class="file-name">
                <i class="fas ${fileIcon}"></i> ${truncateFileName(file.name, 22)}
            </div>
            <div class="file-size">${formatFileSize(file.size)}</div>
            <button class="remove-file" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        elements.filesGrid.appendChild(fileItem);
    });
    
    // রিমুভ বাটন ইভেন্ট
    document.querySelectorAll('.remove-file').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const index = parseInt(this.dataset.index);
            removeFile(index);
        });
    });
    
    // ফাইল কাউন্ট
    elements.fileCount.textContent = `${selectedFiles.length}টি ফাইল`;
}

// ফাইল রিমুভ
function removeFile(index) {
    if (index >= 0 && index < selectedFiles.length) {
        const removedFile = selectedFiles.splice(index, 1)[0];
        URL.revokeObjectURL(removedFile.url);
        updateFilePreview();
        showToast('ফাইল মুছে ফেলা হয়েছে', 'info');
    }
}

// সব ফাইল ক্লিয়ার
function clearAllFiles() {
    selectedFiles.forEach(file => {
        URL.revokeObjectURL(file.url);
    });
    selectedFiles = [];
    updateFilePreview();
    showToast('সব ফাইল মুছে ফেলা হয়েছে', 'info');
}

// ফাইল নাম সংক্ষিপ্তকরণ
function truncateFileName(name, maxLength) {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
}

// ফাইল সাইজ ফরম্যাট
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// প্রগ্রেস আপডেট
function updateProgress(percent, text) {
    elements.progressFill.style.width = `${percent}%`;
    elements.progressText.textContent = text;
    
    if (percent === 100) {
        setTimeout(() => {
            elements.progressText.innerHTML = `<i class="fas fa-check-circle"></i> ${text}`;
        }, 500);
    }
}

// কনভার্সন শুরু
async function startConversion() {
    console.log('কনভার্সন শুরু...');
    
    if (selectedFiles.length === 0) {
        showToast('কনভার্ট করার জন্য ফাইল নির্বাচন করুন', 'error');
        return;
    }
    
    // UI সেটাপ
    elements.convertBtn.disabled = true;
    elements.convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> প্রসেসিং...';
    elements.progressSection.classList.add('active');
    elements.resultSection.classList.remove('active');
    elements.downloadBtn.style.display = 'none';
    
    try {
        if (currentConversionType === 'img-to-pdf') {
            await convertImagesToPdf();
        } else if (currentConversionType === 'pdf-to-img') {
            await convertPdfToImages();
        }
    } catch (error) {
        console.error('কনভার্সন এরর:', error);
        showToast('কনভার্সন ব্যর্থ হয়েছে: ' + error.message, 'error');
        resetConversionUI();
    }
}

// ইমেজ থেকে PDF
async function convertImagesToPdf() {
    console.log('ইমেজ থেকে PDF কনভার্ট শুরু...');
    
    try {
        updateProgress(10, 'ইমেজ প্রসেসিং...');
        
        const doc = new jsPDF();
        const pageSize = document.getElementById('pageSize').value;
        const orientation = document.getElementById('orientation').value;
        const quality = document.getElementById('pdfQuality').value;
        
        // কোয়ালিটি সেটিংস
        const qualitySettings = {
            high: { compression: 'NONE', dpi: 300 },
            medium: { compression: 'MEDIUM', dpi: 150 },
            low: { compression: 'HIGH', dpi: 72 }
        };
        
        const settings = qualitySettings[quality] || qualitySettings.medium;
        
        // পেজ সাইজ
        const pageSizes = {
            a4: { portrait: [210, 297], landscape: [297, 210] },
            letter: { portrait: [216, 279], landscape: [279, 216] }
        };
        
        const dimensions = pageSizes[pageSize][orientation];
        
        for (let i = 0; i < selectedFiles.length; i++) {
            const progress = 10 + (i / selectedFiles.length) * 80;
            updateProgress(progress, `ইমেজ ${i + 1}/${selectedFiles.length} প্রসেসিং...`);
            
            const file = selectedFiles[i];
            
            if (i > 0) {
                doc.addPage(dimensions, orientation.toUpperCase());
            } else {
                doc.deletePage(1);
                doc.addPage(dimensions, orientation.toUpperCase());
            }
            
            // ইমেজ লোড
            const img = await loadImage(file.data);
            
            // ইমেজ ডাইমেনশন ক্যালকুলেট
            const pageWidth = dimensions[0];
            const pageHeight = dimensions[1];
            const margin = 20;
            
            const contentWidth = pageWidth - (margin * 2);
            const contentHeight = pageHeight - (margin * 2);
            
            let imgWidth = img.width;
            let imgHeight = img.height;
            
            // ইমেজ রেশিও মেইনটেইন করে রিসাইজ
            const imgRatio = imgWidth / imgHeight;
            const contentRatio = contentWidth / contentHeight;
            
            if (imgRatio > contentRatio) {
                // ইমেজ চওড়া
                imgWidth = contentWidth;
                imgHeight = contentWidth / imgRatio;
            } else {
                // ইমেজ লম্বা
                imgHeight = contentHeight;
                imgWidth = contentHeight * imgRatio;
            }
            
            // ইমেজ কেন্দ্রে রাখা
            const x = margin + (contentWidth - imgWidth) / 2;
            const y = margin + (contentHeight - imgHeight) / 2;
            
            // PDF এ ইমেজ যোগ
            doc.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
            
            // পেজ নম্বর
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(
                `পৃষ্ঠা ${i + 1} / ${selectedFiles.length}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
            
            await delay(100); // UI আপডেটের জন্য
        }
        
        updateProgress(95, 'PDF জেনারেট করা হচ্ছে...');
        
        // PDF ব্লব তৈরি
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        convertedResult = {
            type: 'pdf',
            blob: pdfBlob,
            url: pdfUrl,
            name: generateFileName('converted', 'pdf'),
            size: pdfBlob.size
        };
        
        updateProgress(100, 'কনভার্সন সম্পূর্ণ!');
        
        // ফলাফল দেখানো
        setTimeout(() => showResult(), 1000);
        
    } catch (error) {
        throw new Error('ইমেজ থেকে PDF কনভার্ট করতে সমস্যা: ' + error.message);
    }
}

// PDF থেকে ইমেজ
async function convertPdfToImages() {
    console.log('PDF থেকে ইমেজ কনভার্ট শুরু...');
    
    try {
        updateProgress(10, 'PDF লোডিং...');
        
        const pdfFile = selectedFiles[0];
        const imageFormat = document.getElementById('imageFormat').value;
        const imageQuality = parseFloat(document.getElementById('imageQuality').value);
        const dpi = parseInt(document.getElementById('dpi').value);
        
        // PDF লোড
        const pdfData = new Uint8Array(pdfFile.data);
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        const numPages = pdf.numPages;
        
        updateProgress(20, 'PDF প্রসেসিং...');
        
        const images = [];
        const scale = dpi / 72;
        
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const progress = 20 + ((pageNum - 1) / numPages) * 70;
            updateProgress(progress, `পৃষ্ঠা ${pageNum}/${numPages} কনভার্টিং...`);
            
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale });
            
            // ক্যানভাস তৈরি
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            // রেন্ডার
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            // ইমেজ ডেটা
            const imageData = canvas.toDataURL(`image/${imageFormat}`, imageQuality);
            
            images.push({
                data: imageData,
                page: pageNum,
                format: imageFormat
            });
            
            await delay(100);
        }
        
        updateProgress(95, 'ইমেজ প্রস্তুত করা হচ্ছে...');
        
        if (images.length === 1) {
            // একক ইমেজ
            const blob = dataURLToBlob(images[0].data);
            const url = URL.createObjectURL(blob);
            
            convertedResult = {
                type: 'image',
                blob: blob,
                url: url,
                name: generateFileName('page-1', imageFormat),
                size: blob.size
            };
        } else {
            // একাধিক ইমেজ (ZIP)
            convertedResult = {
                type: 'zip',
                images: images,
                name: generateFileName('converted-pdf', 'zip')
            };
        }
        
        updateProgress(100, 'কনভার্সন সম্পূর্ণ!');
        
        // ফলাফল দেখানো
        setTimeout(() => showResult(), 1000);
        
    } catch (error) {
        throw new Error('PDF থেকে ইমেজ কনভার্ট করতে সমস্যা: ' + error.message);
    }
}

// ফলাফল দেখানো
function showResult() {
    console.log('ফলাফল দেখানো হচ্ছে...');
    
    elements.progressSection.classList.remove('active');
    elements.resultSection.classList.add('active');
    
    let resultHTML = '';
    
    if (currentConversionType === 'img-to-pdf') {
        resultHTML = `
            <div style="text-align: center;">
                <i class="fas fa-file-pdf" style="font-size: 4rem; color: #e74c3c; margin-bottom: 15px;"></i>
                <h4 style="color: #2c3e50; margin-bottom: 10px;">PDF তৈরি সম্পূর্ণ!</h4>
                <p style="color: #7f8c8d; margin-bottom: 20px;">${selectedFiles.length}টি ইমেজ থেকে PDF তৈরি হয়েছে</p>
                
                <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #eaeaea; max-width: 400px; margin: 0 auto;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-weight: 600; color: #2c3e50;">ফাইল নাম:</span>
                        <span style="color: #7f8c8d;">${convertedResult.name}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-weight: 600; color: #2c3e50;">ফাইল সাইজ:</span>
                        <span style="color: #7f8c8d;">${formatFileSize(convertedResult.size)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-weight: 600; color: #2c3e50;">পৃষ্ঠা সংখ্যা:</span>
                        <span style="color: #7f8c8d;">${selectedFiles.length}</span>
                    </div>
                </div>
                
                <div style="margin-top: 25px;">
                    <button id="previewPdf" class="btn-secondary" style="margin-right: 10px;">
                        <i class="fas fa-eye"></i> প্রিভিউ
                    </button>
                    <a href="${convertedResult.url}" download="${convertedResult.name}" class="btn-success">
                        <i class="fas fa-download"></i> ডাউনলোড
                    </a>
                </div>
            </div>
        `;
        
    } else if (currentConversionType === 'pdf-to-img') {
        if (convertedResult.type === 'image') {
            resultHTML = `
                <div style="text-align: center;">
                    <i class="fas fa-file-image" style="font-size: 4rem; color: #2ecc71; margin-bottom: 15px;"></i>
                    <h4 style="color: #2c3e50; margin-bottom: 10px;">ইমেজ কনভার্সন সম্পূর্ণ!</h4>
                    <p style="color: #7f8c8d; margin-bottom: 20px;">PDF থেকে ইমেজ তৈরি হয়েছে</p>
                    
                    <div style="max-width: 300px; margin: 0 auto 20px;">
                        <img src="${convertedResult.url}" alt="কনভার্টেড ইমেজ" style="max-width: 100%; border-radius: 10px; border: 2px solid #eaeaea;">
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #eaeaea; max-width: 400px; margin: 0 auto;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="font-weight: 600; color: #2c3e50;">ফাইল নাম:</span>
                            <span style="color: #7f8c8d;">${convertedResult.name}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 600; color: #2c3e50;">ফাইল সাইজ:</span>
                            <span style="color: #7f8c8d;">${formatFileSize(convertedResult.size)}</span>
                        </div>
                    </div>
                    
                    <div style="margin-top: 25px;">
                        <a href="${convertedResult.url}" download="${convertedResult.name}" class="btn-success">
                            <i class="fas fa-download"></i> ডাউনলোড
                        </a>
                    </div>
                </div>
            `;
        } else {
            resultHTML = `
                <div style="text-align: center;">
                    <i class="fas fa-file-archive" style="font-size: 4rem; color: #f39c12; margin-bottom: 15px;"></i>
                    <h4 style="color: #2c3e50; margin-bottom: 10px;">ইমেজ ZIP তৈরি সম্পূর্ণ!</h4>
                    <p style="color: #7f8c8d; margin-bottom: 20px;">PDF থেকে ${convertedResult.images.length}টি ইমেজ তৈরি হয়েছে</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #eaeaea; max-width: 400px; margin: 0 auto;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="font-weight: 600; color: #2c3e50;">ফাইল নাম:</span>
                            <span style="color: #7f8c8d;">${convertedResult.name}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="font-weight: 600; color: #2c3e50;">ইমেজ সংখ্যা:</span>
                            <span style="color: #7f8c8d;">${convertedResult.images.length}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 600; color: #2c3e50;">ফরম্যাট:</span>
                            <span style="color: #7f8c8d;">${convertedResult.images[0].format.toUpperCase()}</span>
                        </div>
                    </div>
                    
                    <div style="margin-top: 25px;">
                        <button id="downloadZip" class="btn-success">
                            <i class="fas fa-download"></i> ZIP ডাউনলোড
                        </button>
                    </div>
                    
                    <div style="margin-top: 20px; text-align: left;">
                        <h5 style="color: #2c3e50; margin-bottom: 10px;">আলাদা ইমেজ ডাউনলোড:</h5>
                        <div id="imageList" style="max-height: 150px; overflow-y: auto; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                            ${convertedResult.images.map((img, i) => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eaeaea;">
                                    <span>পৃষ্ঠা ${img.page}</span>
                                    <a href="${img.data}" download="page-${img.page}.${img.format}" class="btn-secondary" style="padding: 5px 15px; font-size: 0.9rem;">
                                        <i class="fas fa-download"></i> ডাউনলোড
                                    </a>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    elements.resultPreview.innerHTML = resultHTML;
    
    // ইভেন্ট লিসেনার যোগ
    if (document.getElementById('previewPdf')) {
        document.getElementById('previewPdf').addEventListener('click', () => {
            window.open(convertedResult.url, '_blank');
        });
    }
    
    if (document.getElementById('downloadZip')) {
        document.getElementById('downloadZip').addEventListener('click', downloadZip);
    }
    
    elements.downloadBtn.style.display = 'none';
    elements.convertBtn.disabled = false;
    elements.convertBtn.innerHTML = '<i class="fas fa-sync-alt"></i> কনভার্ট করুন';
    
    showToast('কনভার্সন সফলভাবে সম্পন্ন হয়েছে!', 'success');
}

// ZIP ডাউনলোড
async function downloadZip() {
    if (convertedResult.type !== 'zip') return;
    
    showToast('ZIP ফাইল তৈরি করা হচ্ছে...', 'info');
    
    const zip = new JSZip();
    
    convertedResult.images.forEach((img, index) => {
        const blob = dataURLToBlob(img.data);
        zip.file(`page-${img.page}.${img.format}`, blob);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, convertedResult.name);
    
    showToast('ZIP ফাইল ডাউনলোড শুরু হয়েছে', 'success');
}

// ডাউনলোড রেজাল্ট
function downloadResult() {
    if (!convertedResult) return;
    
    if (convertedResult.type === 'pdf' || convertedResult.type === 'image') {
        const link = document.createElement('a');
        link.href = convertedResult.url;
        link.download = convertedResult.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('ফাইল ডাউনলোড শুরু হয়েছে', 'success');
    }
}

// অ্যাপ রিসেট
function resetApp() {
    console.log('অ্যাপ রিসেট করা হচ্ছে...');
    
    // ফাইল ক্লিয়ার
    clearAllFiles();
    
    // UI রিসেট
    elements.progressSection.classList.remove('active');
    elements.resultSection.classList.remove('active');
    elements.downloadBtn.style.display = 'none';
    
    // কনভার্ট বাটন
    elements.convertBtn.disabled = false;
    elements.convertBtn.innerHTML = '<i class="fas fa-sync-alt"></i> কনভার্ট করুন';
    
    // রেজাল্ট ক্লিয়ার
    convertedResult = null;
    
    // ডিফল্ট সেটিংস
    switchConversionType('img-to-pdf');
    
    showToast('অ্যাপ রিসেট করা হয়েছে', 'info');
}

// UI রিসেট
function resetConversionUI() {
    elements.convertBtn.disabled = false;
    elements.convertBtn.innerHTML = '<i class="fas fa-sync-alt"></i> কনভার্ট করুন';
    elements.progressSection.classList.remove('active');
}

// হেল্প মোডাল
function showHelpModal() {
    elements.helpModal.style.display = 'block';
}

// প্রাইভেসি ইনফো
function showPrivacyInfo() {
    alert('গোপনীয়তা নোট:\n\n• সমস্ত প্রক্রিয়াকরণ আপনার ব্রাউজারে হয়\n• কোন ফাইল সার্ভারে যায় না\n• ব্রাউজার বন্ধ করলে সব ডেটা মুছে যাবে\n• ১০০% নিরাপদ এবং প্রাইভেট');
}

// হেল্পার ফাংশনস
function loadImage(dataURL) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataURL;
    });
}

function dataURLToBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
}

function generateFileName(prefix, extension) {
    const date = new Date();
    const timestamp = date.getFullYear() + 
                     String(date.getMonth() + 1).padStart(2, '0') + 
                     String(date.getDate()).padStart(2, '0') + 
                     String(date.getHours()).padStart(2, '0') + 
                     String(date.getMinutes()).padStart(2, '0');
    
    return `${prefix}-${timestamp}.${extension}`;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showToast(message, type) {
    // সহজ টোস্ট নোটিফিকেশন
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // স্টাইল
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;
    
    // অ্যানিমেশন
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // অটো রিমুভ
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 3000);
}

// DOM কন্টেন্ট লোড হলে অ্যাপ শুরু
document.addEventListener('DOMContentLoaded', initApp);