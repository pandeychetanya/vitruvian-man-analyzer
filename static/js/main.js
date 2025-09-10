document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const analysisSection = document.getElementById('analysisSection');
    const loading = document.getElementById('loading');
    const previewImage = document.getElementById('previewImage');

    // Upload area click handler
    uploadArea.addEventListener('click', function() {
        imageInput.click();
    });

    // Drag and drop handlers
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageUpload(files[0]);
        }
    });

    // File input change handler
    imageInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0]);
        }
    });

    function handleImageUpload(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        // Show loading
        document.querySelector('.upload-section').style.display = 'none';
        loading.style.display = 'block';

        // Preview image
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Upload and analyze
        const formData = new FormData();
        formData.append('image', file);

        fetch('/api/analyze', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            displayResults(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Analysis failed: ' + error.message);
            resetAnalysis();
        });
    }

    function displayResults(data) {
        // Hide loading, show results
        loading.style.display = 'none';
        analysisSection.style.display = 'block';

        // Update score
        const score = Math.round(data.vitruvian_score);
        document.getElementById('scoreValue').textContent = score;
        
        // Update score level
        let level = 'Poor';
        if (score >= 80) level = 'Excellent';
        else if (score >= 60) level = 'Good';
        else if (score >= 40) level = 'Fair';
        
        document.getElementById('scoreLevel').textContent = level;

        // Update metrics with animations
        setTimeout(() => {
            updateMetric('headRatio', data.proportions.head_to_total_ratio, 0.125);
            updateMetric('armSpan', data.proportions.arm_span_to_height_ratio, 1.0);
            updateMetric('symmetry', data.geometry.symmetry_score, 1.0);
            updateMetric('squareFit', data.geometry.square_ratio, 1.0);
        }, 300);

        // Update analysis text
        document.getElementById('analysisText').textContent = data.analysis;
    }

    function updateMetric(elementId, value, ideal) {
        const fillElement = document.getElementById(elementId);
        const textElement = document.getElementById(elementId + 'Text');
        
        // Calculate percentage for display (0-100%)
        let percentage = Math.min(100, (value / Math.max(ideal, 1)) * 100);
        if (ideal === 1.0) {
            percentage = value * 100; // For ratios already 0-1
        }
        
        // Animate the fill
        fillElement.style.width = percentage + '%';
        
        // Update text
        textElement.textContent = value.toFixed(3);
        
        // Color coding based on how close to ideal
        const deviation = Math.abs(value - ideal);
        let color = '#28a745'; // Green for good
        if (deviation > ideal * 0.2) color = '#ffc107'; // Yellow for okay
        if (deviation > ideal * 0.4) color = '#dc3545'; // Red for poor
        
        fillElement.style.background = color;
    }

    window.resetAnalysis = function() {
        // Reset form and show upload section
        imageInput.value = '';
        document.querySelector('.upload-section').style.display = 'block';
        analysisSection.style.display = 'none';
        loading.style.display = 'none';
        
        // Reset metrics
        const metrics = ['headRatio', 'armSpan', 'symmetry', 'squareFit'];
        metrics.forEach(metric => {
            document.getElementById(metric).style.width = '0%';
            document.getElementById(metric + 'Text').textContent = '--';
        });
        
        // Reset score
        document.getElementById('scoreValue').textContent = '--';
        document.getElementById('scoreLevel').textContent = 'Analyzing...';
        document.getElementById('analysisText').textContent = '';
    };
});