// DOM এলিমেন্ট নির্বাচন
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const filesGrid = document.getElementById('filesGrid');
const fileCount = document.getElementById('fileCount');
const clearFilesBtn = document.getElementById('clearFiles');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultSection = document.getElementById('resultSection');
const resultPreview = document.getElementById('resultPreview');
const uploadTitle = document.getElementById('uploadTitle');
const uploadSubtitle = document.getElementById('uploadSubtitle');

// কনভার্সন অপশন নির্বাচন
const optionImgToPdf = document.getElementById('option-img-to-pdf');
const optionPdfToImg = document.getElementById('option-pdf-to-img');
const optionMergePdf = document.getElementById('option-merge-pdf');

// সেটিংস গ্রুপ
const imgToPdfSettings = document.getElementById('imgToPdfSettings');
const pdfToImgSettings = document.getElementById('pdfToImgSettings');

// গ্লোবাল ভেরিয়েবল
let selectedFiles = [];
let currentConversionType = 'img-to-pdf';
let convertedResult = null;

// ইভেন্ট লিসেনার যোগ করুন
document.addEventListener('DOMContentLoaded', initApp);

// অ্যাপ্লিকেশন ইনিশিয়ালাইজেশন
function initApp() {
    // অপশন কার্ড ক্লিক ইভেন্ট
    optionImgToPdf.addEventListener('click', () => switchConversionType('img-to-pdf'));
    optionPdfToImg.addEventListener('click', () => switchConversionType('pdf-to-img'));
    optionMergePdf.addEventListener('click', () => switchConversionType('merge-pdf'));
    
    // ফাইল আপলোড ইভেন্ট
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    
    // বাটন ইভেন্ট
    clearFilesBtn.addEventListener('click', clearAllFiles);
    convertBtn.addEventListener('click', startConversion);
    downloadBtn.addEventListener('click', downloadResult);
    resetBtn.addEventListener('click', resetApp);
    
    // ডিফল্ট কনভার্সন টাইপ সেট করুন
    switchConversionType('img-to-pdf');
}

// কনভার্সন টাইপ পরিবর্তন
function switchConversionType(type) {
    currentConversionType = type;
    
    // অপশন কার্ড একটিভ স্টাইল
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('active');
    });
    
    if (type === 'img-to-pdf') {
        optionImgToPdf.classList.add('active');
        uploadTitle.textContent = 'ইমেজ ফাইল নির্বাচন করুন';
        uploadSubtitle.textContent = 'এখানে ক্লিক করুন বা ইমেজ ফাইলগুলো ড্র্যাগ করুন';
        fileInput.setAttribute('accept', 'image/*');
        
        // সেটিংস দেখান/লুকান
        imgToPdfSettings.style.display = 'flex';
        pdfToImgSettings.style.display = 'none';
        
        // ফাইল লিমিট
        fileInput.setAttribute('multiple', 'true');
        
    } else if (type === 'pdf-to-img') {
        optionPdfToImg.classList.add('active');
        uploadTitle.textContent = 'পিডিএফ ফাইল নির্বাচন করুন';
        uploadSubtitle.textContent = 'এখানে ক্লিক করুন বা পিডিএফ ফাইল ড্র্যাগ করুন';
        fileInput.setAttribute('accept', '.pdf');
        
        // সেটিংস দেখান/লুকান
        imgToPdfSettings.style.display = 'none';
        pdfToImgSettings.style.display = 'flex';
        
        // ফাইল লিমিট
        fileInput.removeAttribute('multiple');
        
    } else if (type === 'merge-pdf') {
        optionMergePdf.classList.add('active');
        uploadTitle.textContent = 'পিডিএফ ফাইলসমূহ নির্বাচন করুন';
        uploadSubtitle.textContent = 'এখানে ক্লিক করুন বা পিডিএফ ফাইলগুলো ড্র্যাগ করুন';
        fileInput.setAttribute('accept', '.pdf');
        
        // সেটিংস দেখান/লুকান
        imgToPdfSettings.style.display = 'flex';
        pdfToImgSettings.style.display = 'none';
        
        // ফাইল লিমিট
        fileInput.setAttribute('multiple', 'true');
    }
    
    // নির্বাচিত ফাইল রিসেট করুন
    selectedFiles = [];
    updateFilePreview();
}

// ড্র্যাগ ওভার ইভেন্ট হ্যান্ডলার
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

// ড্র্যাগ লিভ ইভেন্ট হ্যান্ডলার
function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

// ড্রপ ইভেন্ট হ্যান্ডলার
function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

// ফাইল সিলেক্ট ইভেন্ট হ্যান্ডলার
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

// ফাইল প্রসেসিং
function processFiles(files) {
    // ফাইল লিমিট চেক করুন
    let maxFiles = 10;
    let maxSize = 10 * 1024 * 1024; // 10MB
    
    if (currentConversionType === 'pdf-to-img') {
        maxFiles = 1;
        maxSize = 50 * 1024 * 1024; // 50MB for PDF
    }
    
    // ফাইল সংখ্যা চেক করুন
    if (selectedFiles.length + files.length > maxFiles) {
        alert(`সর্বোচ্চ ${maxFiles}টি ফাইল আপলোড করতে পারবেন।`);
        return;
    }
    
    // প্রতিটি ফাইল প্রসেস করুন
    files.forEach(file => {
        // ফাইল সাইজ চেক করুন
        if (file.size > maxSize) {
            alert(`"${file.name}" ফাইলের সাইজ খুব বড়। সর্বোচ্চ ${formatFileSize(maxSize)} পর্যন্ত ফাইল আপলোড করতে পারবেন।`);
            return;
        }
        
        // ফাইল টাইপ চেক করুন
        if (currentConversionType === 'img-to-pdf' || currentConversionType === 'merge-pdf') {
            const validTypes = currentConversionType === 'img-to-pdf' 
                ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
                : ['application/pdf'];
                
            if (!validTypes.includes(file.type)) {
                alert(`"${file.name}" ফাইল ফরম্যাট সাপোর্টেড নয়।`);
                return;
            }
        }
        
        // ফাইল প্রিভিউ তৈরি করুন
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const fileData = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result,
                url: e.target.result
            };
            
            selectedFiles.push(fileData);
            updateFilePreview();
        };
        
        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
    
    // ফাইল ইনপুট রিসেট করুন
    fileInput.value = '';
}

// ফাইল প্রিভিউ আপডেট করুন
function updateFilePreview() {
    filesGrid.innerHTML = '';
    
    if (selectedFiles.length === 0) {
        filesGrid.innerHTML = `
            <div class="no-files">
                <i class="fas fa-folder-open" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 15px;"></i>
                <p style="color: #7f8c8d;">কোন ফাইল নির্বাচন করা হয়নি</p>
            </div>
        `;
        fileCount.textContent = '০টি ফাইল';
        return;
    }
    
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item fade-in';
        
        // ফাইল প্রিভিউ স্টার
        let previewContent = '';
        if (file.type.startsWith('image/')) {
            previewContent = `<img src="${file.url}" alt="${file.name}" class="file-preview">`;
        } else if (file.type === 'application/pdf') {
            previewContent = `
                <div class="pdf-preview" style="width: 100%; height: 120px; background: linear-gradient(135deg, #e74c3c, #c0392b); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                    <i class="fas fa-file-pdf" style="font-size: 3rem; color: white;"></i>
                </div>
            `;
        }
        
        fileItem.innerHTML = `
            ${previewContent}
            <div class="file-name">${truncateFileName(file.name, 20)}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
            <button class="remove-file" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        filesGrid.appendChild(fileItem);
    });
    
    // রিমুভ বাটনে ইভেন্ট লিসেনার যোগ করুন
    document.querySelectorAll('.remove-file').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const index = parseInt(this.getAttribute('data-index'));
            removeFile(index);
        });
    });
    
    // ফাইল সংখ্যা আপডেট করুন
    fileCount.textContent = `${selectedFiles.length}টি ফাইল`;
}

// ফাইল নাম সংক্ষিপ্ত করুন
function truncateFileName(name, maxLength) {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
}

// ফাইল সাইজ ফরম্যাট করুন
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ফাইল রিমুভ করুন
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFilePreview();
}

// সব ফাইল ক্লিয়ার করুন
function clearAllFiles() {
    selectedFiles = [];
    updateFilePreview();
}

// প্রগ্রেস বার আপডেট করুন
function updateProgress(percent, text) {
    progressFill.style.width = `${percent}%`;
    progressText.textContent = text;
    
    if (percent === 100) {
        setTimeout(() => {
            progressText.innerHTML = `<i class="fas fa-check-circle"></i> ${text}`;
        }, 500);
    }
}

// কনভার্সন শুরু করুন
function startConversion() {
    // ভ্যালিডেশন চেক করুন
    if (selectedFiles.length === 0) {
        alert('কনভার্ট করার জন্য কমপক্ষে একটি ফাইল নির্বাচন করুন।');
        return;
    }
    
    // প্রগ্রেস সেকশন দেখান
    progressSection.style.display = 'block';
    resultSection.style.display = 'none';
    downloadBtn.style.display = 'none';
    
    // কনভার্ট বাটন ডিজেবল করুন
    convertBtn.disabled = true;
    convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> প্রসেসিং...';
    
    // কনভার্সন টাইপ অনুযায়ী ফাংশন কল করুন
    if (currentConversionType === 'img-to-pdf') {
        convertImagesToPdf();
    } else if (currentConversionType === 'pdf-to-img') {
        convertPdfToImages();
    } else if (currentConversionType === 'merge-pdf') {
        mergePdfs();
    }
}

// ইমেজ থেকে PDF কনভার্ট করুন
async function convertImagesToPdf() {
    try {
        updateProgress(10, 'ইমেজ প্রসেসিং...');
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // পেজ সাইজ ও ওরিয়েন্টেশন সেট করুন
        const pageSize = document.getElementById('pageSize').value;
        const orientation = document.getElementById('orientation').value;
        const margin = parseInt(document.getElementById('margin').value);
        
        // পেজ সাইজ ম্যাপিং
        const pageSizes = {
            'a4': [210, 297],
            'letter': [216, 279],
            'legal': [216, 356]
        };
        
        const dimensions = pageSizes[pageSize] || pageSizes.a4;
        
        // প্রতিটি ইমেজের জন্য
        for (let i = 0; i < selectedFiles.length; i++) {
            updateProgress(10 + (i / selectedFiles.length) * 80, `${i+1}/${selectedFiles.length} ইমেজ প্রসেসিং...`);
            
            const file = selectedFiles[i];
            
            // নতুন পেজ যোগ করুন (প্রথম ইমেজ ছাড়া)
            if (i > 0) {
                doc.addPage();
            }
            
            // ইমেজ লোড করুন
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = file.data;
            });
            
            // ইমেজ ডাইমেনশন ক্যালকুলেট করুন
            const pageWidth = orientation === 'landscape' ? dimensions[1] : dimensions[0];
            const pageHeight = orientation === 'landscape' ? dimensions[0] : dimensions[1];
            
            const contentWidth = pageWidth - (margin * 2);
            const contentHeight = pageHeight - (margin * 2);
            
            // ইমেজ রেশিও মেইন্টেইন করে রিসাইজ করুন
            const imgRatio = img.width / img.height;
            let imgWidth = contentWidth;
            let imgHeight = contentWidth / imgRatio;
            
            if (imgHeight > contentHeight) {
                imgHeight = contentHeight;
                imgWidth = contentHeight * imgRatio;
            }
            
            // ইমেজ কেন্দ্রে রাখুন
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;
            
            // পিডিএফে ইমেজ যোগ করুন
            doc.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
            
            // পেজ নম্বর যোগ করুন
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(
                `পৃষ্ঠা ${i + 1} / ${selectedFiles.length}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
            
            // ছোট ডিলে দিন UI আপডেটের জন্য
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        updateProgress(95, 'পিডিএফ জেনারেট করা হচ্ছে...');
        
        // পিডিএফ ব্লব তৈরি করুন
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        convertedResult = {
            type: 'pdf',
            blob: pdfBlob,
            url: pdfUrl,
            name: `converted-${Date.now()}.pdf`
        };
        
        updateProgress(100, 'কনভার্সন সম্পূর্ণ!');
        
        // রেজাল্ট দেখান
        showResult();
        
    } catch (error) {
        console.error('Error converting images to PDF:', error);
        alert('কনভার্সন প্রক্রিয়ায় সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
        resetConversionUI();
    }
}

// PDF থেকে ইমেজ কনভার্ট করুন
async function convertPdfToImages() {
    try {
        updateProgress(10, 'পিডিএফ লোডিং...');
        
        const pdfFile = selectedFiles[0];
        
        // পিডিএফ.js দিয়ে পিডিএফ লোড করুন
        const pdfData = new Uint8Array(pdfFile.data);
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        const numPages = pdf.numPages;
        
        updateProgress(20, 'পিডিএফ পৃষ্ঠা প্রসেসিং...');
        
        const imageFormat = document.getElementById('imageFormat').value;
        const imageQuality = parseFloat(document.getElementById('imageQuality').value);
        const dpi = parseInt(document.getElementById('dpi').value);
        
        const scale = dpi / 72; // 72 DPI is default
        
        const images = [];
        
        // প্রতিটি পেজের জন্য
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            updateProgress(20 + (pageNum / numPages) * 70, `পৃষ্ঠা ${pageNum}/${numPages} প্রসেসিং...`);
            
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale });
            
            // ক্যানভাস তৈরি করুন
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // ক্যানভাসে পেজ রেন্ডার করুন
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            // ইমেজ ডেটা URL তৈরি করুন
            const imageData = canvas.toDataURL(`image/${imageFormat}`, imageQuality);
            
            images.push({
                data: imageData,
                page: pageNum
            });
            
            // ছোট ডিলে দিন UI আপডেটের জন্য
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        updateProgress(95, 'ইমেজ তৈরি করা হচ্ছে...');
        
        // যদি একাধিক ইমেজ হয়, তাহলে ZIP ফাইল তৈরি করুন
        if (images.length > 1) {
            convertedResult = {
                type: 'zip',
                images: images,
                name: `converted-pdf-${Date.now()}.zip`
            };
        } else {
            // শুধু একটি ইমেজ হলে
            convertedResult = {
                type: 'image',
                blob: dataURLToBlob(images[0].data),
                url: images[0].data,
                name: `converted-page-1.${imageFormat}`
            };
        }
        
        updateProgress(100, 'কনভার্সন সম্পূর্ণ!');
        
        // রেজাল্ট দেখান
        showResult();
        
    } catch (error) {
        console.error('Error converting PDF to images:', error);
        alert('পিডিএফ কনভার্ট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
        resetConversionUI();
    }
}

// একাধিক PDF মার্জ করুন
async function mergePdfs() {
    try {
        if (selectedFiles.length < 2) {
            alert('মার্জ করার জন্য কমপক্ষে ২টি পিডিএফ ফাইল নির্বাচন করুন।');
            resetConversionUI();
            return;
        }
        
        updateProgress(10, 'পিডিএফ ফাইল প্রসেসিং...');
        
        // এই ফাংশনটি সম্পূর্ণ করতে পিডিএফ লাইব্রেরি প্রয়োজন
        // যেহেতু আমরা শুধু ক্লায়েন্ট সাইড কোড লিখছি, একটি সহজ ইমপ্লিমেন্টেশন দেখাচ্ছি
        alert('PDF মার্জ ফিচারটি সম্পূর্ণভাবে ইমপ্লিমেন্ট করার জন্য অতিরিক্ত লাইব্রেরি প্রয়োজন।\n\nআপনি অনলাইন PDF মার্জ টুল ব্যবহার করতে পারেন অথবা আমরা শীঘ্রই এই ফিচারটি যোগ করব।');
        
        resetConversionUI();
        
    } catch (error) {
        console.error('Error merging PDFs:', error);
        alert('পিডিএফ মার্জ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
        resetConversionUI();
    }
}

// রেজাল্ট দেখান
function showResult() {
    // প্রগ্রেস বার হাইড করুন
    setTimeout(() => {
        progressSection.style.display = 'none';
        
        // রেজাল্ট সেকশন দেখান
        resultSection.style.display = 'block';
        resultPreview.innerHTML = '';
        
        if (currentConversionType === 'img-to-pdf') {
            // PDF প্রিভিউ
            resultPreview.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <i class="fas fa-file-pdf" style="font-size: 4rem; color: #e74c3c; margin-bottom: 15px;"></i>
                    <h4 style="color: #2c3e50; margin-bottom: 10px;">PDF তৈরি সম্পূর্ণ!</h4>
                    <p style="color: #7f8c8d;">${selectedFiles.length}টি ইমেজ থেকে PDF তৈরি হয়েছে।</p>
                </div>
                <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #ddd; max-width: 300px; margin: 0 auto;">
                    <p style="margin-bottom: 10px;"><strong>ফাইল নাম:</strong> ${convertedResult.name}</p>
                    <p style="margin-bottom: 10px;"><strong>ফাইল সাইজ:</strong> ${formatFileSize(convertedResult.blob.size)}</p>
                    <p><strong>পৃষ্ঠা সংখ্যা:</strong> ${selectedFiles.length}</p>
                </div>
            `;
            
        } else if (currentConversionType === 'pdf-to-img') {
            // ইমেজ প্রিভিউ
            if (convertedResult.type === 'image') {
                resultPreview.innerHTML = `
                    <div style="margin-bottom: 20px;">
                        <i class="fas fa-file-image" style="font-size: 4rem; color