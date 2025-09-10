let net;
let isModelLoaded = false;

// Load PoseNet model
async function loadModel() {
    try {
        net = await posenet.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            inputResolution: { width: 640, height: 480 },
            multiplier: 0.75
        });
        isModelLoaded = true;
        console.log('PoseNet model loaded successfully');
    } catch (error) {
        console.error('Error loading PoseNet model:', error);
        showError('Failed to load AI model. Please refresh the page and try again.');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadModel();
    setupEventHandlers();
});

function setupEventHandlers() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');

    uploadArea.addEventListener('click', function() {
        imageInput.click();
    });

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

    imageInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0]);
        }
    });
}

async function handleImageUpload(file) {
    if (!isModelLoaded) {
        showError('AI model is still loading. Please wait a moment and try again.');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file.');
        return;
    }

    showLoading();

    try {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = async function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            try {
                const poses = await net.estimateSinglePose(canvas, {
                    flipHorizontal: false
                });

                if (poses && poses.keypoints) {
                    const analysis = analyzeVitruvianPose(poses.keypoints, img.width, img.height);
                    displayResults(analysis);
                } else {
                    throw new Error('No pose detected in the image');
                }
            } catch (error) {
                console.error('Pose estimation error:', error);
                showError('Could not detect a human pose in this image. Please try with a clearer full-body image.');
            }
        };

        img.onerror = function() {
            showError('Could not load the selected image. Please try a different file.');
        };

        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewImage').src = e.target.result;
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

    } catch (error) {
        console.error('Error processing image:', error);
        showError('Error processing the image. Please try again.');
    }
}

function analyzeVitruvianPose(keypoints, imageWidth, imageHeight) {
    const bodyPoints = extractBodyPoints(keypoints);
    const proportions = calculateProportions(bodyPoints);
    const geometry = analyzeGeometry(bodyPoints);
    const vitruvianScore = calculateVitruvianScore(proportions, geometry);
    
    // Draw the pose visualization
    drawPoseVisualization(keypoints, bodyPoints, imageWidth, imageHeight);
    
    return {
        vitruvian_score: vitruvianScore,
        proportions: proportions,
        geometry: geometry,
        analysis: generateSimpleAnalysis(vitruvianScore, proportions, geometry),
        keypoints: keypoints
    };
}

function extractBodyPoints(keypoints) {
    const points = {};
    const keyMapping = {
        'nose': 0, 'leftEye': 1, 'rightEye': 2,
        'leftEar': 3, 'rightEar': 4,
        'leftShoulder': 5, 'rightShoulder': 6,
        'leftElbow': 7, 'rightElbow': 8,
        'leftWrist': 9, 'rightWrist': 10,
        'leftHip': 11, 'rightHip': 12,
        'leftKnee': 13, 'rightKnee': 14,
        'leftAnkle': 15, 'rightAnkle': 16
    };

    for (const [name, index] of Object.entries(keyMapping)) {
        if (keypoints[index] && keypoints[index].score > 0.3) {
            points[name] = {
                x: keypoints[index].position.x,
                y: keypoints[index].position.y,
                confidence: keypoints[index].score
            };
        }
    }

    return points;
}

function calculateProportions(points) {
    const shoulderCenter = {
        x: (points.leftShoulder?.x + points.rightShoulder?.x) / 2,
        y: (points.leftShoulder?.y + points.rightShoulder?.y) / 2
    };

    const headLength = distance(points.nose, shoulderCenter);

    const ankleCenter = {
        x: (points.leftAnkle?.x + points.rightAnkle?.x) / 2,
        y: (points.leftAnkle?.y + points.rightAnkle?.y) / 2
    };

    const totalHeight = Math.abs(points.nose?.y - ankleCenter.y);
    const armSpan = distance(points.leftWrist, points.rightWrist);

    const hipCenter = {
        x: (points.leftHip?.x + points.rightHip?.x) / 2,
        y: (points.leftHip?.y + points.rightHip?.y) / 2
    };

    const torsoLength = distance(shoulderCenter, hipCenter);
    const legLength = distance(hipCenter, ankleCenter);

    return {
        head_to_total_ratio: totalHeight > 0 ? headLength / totalHeight : 0,
        arm_span_to_height_ratio: totalHeight > 0 ? armSpan / totalHeight : 0,
        torso_to_total_ratio: totalHeight > 0 ? torsoLength / totalHeight : 0,
        leg_to_total_ratio: totalHeight > 0 ? legLength / totalHeight : 0,
        measurements: {
            head_length: headLength,
            total_height: totalHeight,
            arm_span: armSpan,
            torso_length: torsoLength,
            leg_length: legLength
        }
    };
}

function analyzeGeometry(points) {
    const allPoints = Object.values(points).filter(p => p && p.x && p.y);
    const centerX = allPoints.reduce((sum, p) => sum + p.x, 0) / allPoints.length;
    const centerY = allPoints.reduce((sum, p) => sum + p.y, 0) / allPoints.length;

    const xCoords = allPoints.map(p => p.x);
    const yCoords = allPoints.map(p => p.y);
    const width = Math.max(...xCoords) - Math.min(...xCoords);
    const height = Math.max(...yCoords) - Math.min(...yCoords);

    const squareRatio = Math.min(width, height) / Math.max(width, height);

    const leftPoints = ['leftShoulder', 'leftElbow', 'leftWrist', 'leftHip', 'leftKnee', 'leftAnkle'];
    const rightPoints = ['rightShoulder', 'rightElbow', 'rightWrist', 'rightHip', 'rightKnee', 'rightAnkle'];
    
    let symmetrySum = 0;
    let validPairs = 0;

    for (let i = 0; i < leftPoints.length; i++) {
        const leftPoint = points[leftPoints[i]];
        const rightPoint = points[rightPoints[i]];
        
        if (leftPoint && rightPoint) {
            const leftDist = Math.abs(leftPoint.x - centerX);
            const rightDist = Math.abs(rightPoint.x - centerX);
            const totalDist = leftDist + rightDist;
            
            if (totalDist > 0) {
                symmetrySum += 1 - Math.abs(leftDist - rightDist) / totalDist;
                validPairs++;
            }
        }
    }

    const symmetryScore = validPairs > 0 ? symmetrySum / validPairs : 0;

    return {
        square_ratio: squareRatio,
        symmetry_score: Math.max(0, symmetryScore),
        bounding_box: { width: width, height: height },
        center_point: { x: centerX, y: centerY }
    };
}

function calculateVitruvianScore(proportions, geometry) {
    const idealHeadRatio = 1/8;
    const idealArmSpanRatio = 1.0;
    const idealTorsoRatio = 0.3;
    const idealLegRatio = 0.5;

    const headScore = Math.max(0, 100 - Math.abs(proportions.head_to_total_ratio - idealHeadRatio) * 800);
    const armSpanScore = Math.max(0, 100 - Math.abs(proportions.arm_span_to_height_ratio - idealArmSpanRatio) * 100);
    const torsoScore = Math.max(0, 100 - Math.abs(proportions.torso_to_total_ratio - idealTorsoRatio) * 300);
    const legScore = Math.max(0, 100 - Math.abs(proportions.leg_to_total_ratio - idealLegRatio) * 200);

    const squareScore = geometry.square_ratio * 100;
    const symmetryScore = geometry.symmetry_score * 100;

    const totalScore = (
        headScore * 0.15 +
        armSpanScore * 0.25 +
        torsoScore * 0.15 +
        legScore * 0.15 +
        squareScore * 0.15 +
        symmetryScore * 0.15
    );

    return Math.min(100, Math.max(0, totalScore));
}

function generateSimpleAnalysis(score, proportions, geometry) {
    let analysis = "";

    if (score >= 85) {
        analysis = "🎨 Extraordinary Renaissance perfection!";
    } else if (score >= 70) {
        analysis = "✨ Excellent classical proportions!";
    } else if (score >= 55) {
        analysis = "👍 Good proportional harmony!";
    } else if (score >= 40) {
        analysis = "📏 Fair geometric alignment.";
    } else {
        analysis = "🌱 Unique proportional character.";
    }

    return analysis;
}

function distance(p1, p2) {
    if (!p1 || !p2) return 0;
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function drawPoseVisualization(keypoints, bodyPoints, originalWidth, originalHeight) {
    // Use setTimeout to ensure the image is displayed first
    setTimeout(() => {
        const canvas = document.getElementById('poseCanvas');
        const img = document.getElementById('previewImage');
        
        if (!canvas || !img) {
            console.error('Canvas or image not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const displayedWidth = img.offsetWidth;
        const displayedHeight = img.offsetHeight;
        
        console.log('Drawing pose visualization:', displayedWidth, displayedHeight);
        
        // Set canvas size to match displayed image
        canvas.width = displayedWidth;
        canvas.height = displayedHeight;
        canvas.style.width = displayedWidth + 'px';
        canvas.style.height = displayedHeight + 'px';

        // Calculate scale factors
        const scaleX = displayedWidth / originalWidth;
        const scaleY = displayedHeight / originalHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Test draw - draw a visible red circle to confirm canvas works
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(50, 50, 20, 0, 2 * Math.PI);
        ctx.fill();
        
        console.log('Drawing skeleton with keypoints:', keypoints.length);

        // Draw pose skeleton
        drawSkeleton(ctx, keypoints, scaleX, scaleY);
        
        // Draw measurement lines
        drawMeasurementLines(ctx, bodyPoints, scaleX, scaleY);
    }, 500); // Wait 500ms for image to render
}

function drawSkeleton(ctx, keypoints, scaleX, scaleY) {
    console.log('drawSkeleton called with', keypoints.length, 'keypoints');
    
    // Draw keypoints first - make them very visible
    keypoints.forEach((keypoint, i) => {
        if (keypoint.score > 0.2) { // Lower threshold
            const x = keypoint.position.x * scaleX;
            const y = keypoint.position.y * scaleY;
            
            console.log(`Drawing keypoint ${i} at (${x}, ${y})`);
            
            // Large, bright colored circles
            ctx.fillStyle = '#ff0000'; // Bright red for visibility
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI); // Larger circles
            ctx.fill();
            
            // Bright white border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    });

    // Draw connections with bright colors
    const adjacentKeyPoints = [
        [5, 6], [5, 7], [7, 9], [6, 8], [8, 10], // Arms
        [5, 11], [6, 12], [11, 12], // Torso
        [11, 13], [13, 15], [12, 14], [14, 16] // Legs
    ];

    ctx.strokeStyle = '#00ff00'; // Bright green lines
    ctx.lineWidth = 4; // Thicker lines
    ctx.setLineDash([]); // Solid lines

    adjacentKeyPoints.forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];
        
        if (kp1 && kp2 && kp1.score > 0.2 && kp2.score > 0.2) {
            ctx.beginPath();
            ctx.moveTo(kp1.position.x * scaleX, kp1.position.y * scaleY);
            ctx.lineTo(kp2.position.x * scaleX, kp2.position.y * scaleY);
            ctx.stroke();
            console.log(`Drew line from keypoint ${i} to ${j}`);
        }
    });
}

function drawMeasurementLines(ctx, bodyPoints, scaleX, scaleY) {
    console.log('drawMeasurementLines called');
    
    // Draw bright blue measurement lines that are very visible
    ctx.strokeStyle = '#0000ff'; // Bright blue
    ctx.lineWidth = 5; // Very thick
    ctx.setLineDash([10, 5]); // Dashed pattern

    // Arm span measurement - most visible
    if (bodyPoints.leftWrist && bodyPoints.rightWrist) {
        ctx.beginPath();
        ctx.moveTo(bodyPoints.leftWrist.x * scaleX, bodyPoints.leftWrist.y * scaleY);
        ctx.lineTo(bodyPoints.rightWrist.x * scaleX, bodyPoints.rightWrist.y * scaleY);
        ctx.stroke();
        console.log('Drew arm span line');
        
        // Add big text label
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.lineWidth = 2;
        const midX = ((bodyPoints.leftWrist.x + bodyPoints.rightWrist.x) / 2) * scaleX;
        const midY = ((bodyPoints.leftWrist.y + bodyPoints.rightWrist.y) / 2) * scaleY;
        ctx.strokeText('ARM SPAN', midX, midY - 20);
        ctx.fillText('ARM SPAN', midX, midY - 20);
    }

    // Reset line dash
    ctx.setLineDash([]);
}

function displayResults(data) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('analysisSection').style.display = 'block';

    // Update score
    const score = Math.round(data.vitruvian_score);
    document.getElementById('scoreValue').textContent = score;

    // Update score level and description
    let level, description;
    if (score >= 85) {
        level = 'Renaissance Master';
        description = 'Extraordinary proportional harmony';
    } else if (score >= 70) {
        level = 'Classical Beauty';
        description = 'Excellent geometric balance';
    } else if (score >= 55) {
        level = 'Harmonious Form';
        description = 'Good proportional alignment';
    } else if (score >= 40) {
        level = 'Developing Grace';
        description = 'Promising proportional foundation';
    } else {
        level = 'Artistic Beginning';
        description = 'Starting your proportional journey';
    }

    document.getElementById('scoreLevel').textContent = level;
    document.getElementById('scoreDescription').textContent = description;

    // Update metrics
    updateMetricDisplay('headRatio', data.proportions.head_to_total_ratio, 0.125, 'Head proportion');
    updateMetricDisplay('armSpan', data.proportions.arm_span_to_height_ratio, 1.0, 'Arm span ratio');
    updateMetricDisplay('symmetry', data.geometry.symmetry_score, 1.0, 'Symmetry score');
    updateMetricDisplay('squareFit', data.geometry.square_ratio, 1.0, 'Square fit ratio');

    // Update analysis text
    document.getElementById('analysisText').textContent = data.analysis;
}

function updateMetricDisplay(metricId, value, ideal, label) {
    const deviation = Math.abs(value - ideal) / ideal;
    let status, statusClass;

    if (deviation < 0.1) {
        status = 'Excellent';
        statusClass = 'excellent';
    } else if (deviation < 0.2) {
        status = 'Good';
        statusClass = 'good';
    } else if (deviation < 0.4) {
        status = 'Fair';
        statusClass = 'fair';
    } else {
        status = 'Unique';
        statusClass = 'needs-work';
    }

    document.getElementById(metricId + 'Value').textContent = value.toFixed(3);
    const statusElement = document.getElementById(metricId + 'Status');
    statusElement.textContent = status;
    statusElement.className = 'metric-status ' + statusClass;
}

function showLoading() {
    document.querySelector('.upload-section').style.display = 'none';
    document.getElementById('analysisSection').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    hideError();
}

function resetAnalysis() {
    document.getElementById('imageInput').value = '';
    document.querySelector('.upload-section').style.display = 'block';
    document.getElementById('analysisSection').style.display = 'none';
    document.getElementById('loading').style.display = 'none';
    hideError();
    
    // Reset analysis text
    document.getElementById('analysisText').textContent = '';
    
    // Clear pose canvas
    const canvas = document.getElementById('poseCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('analysisSection').style.display = 'none';
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}