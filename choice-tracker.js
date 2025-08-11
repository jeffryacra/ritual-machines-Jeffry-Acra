console.log('=== CHOICE-TRACKER.JS LOADED ===');
console.log('Current URL:', window.location.href);
console.log('Document ready state:', document.readyState);

// Choice tracking and result calculation system
class ChoiceTracker {
    constructor() {
        this.choices = this.getChoicesFromURL();
    }

    // Get choices from URL parameters
    getChoicesFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            podSize: urlParams.get('podSize') || 'medium',
            color: urlParams.get('color') || 'blue',
            humanCount: parseInt(urlParams.get('humanCount')) || 10
        };
    }

    // Calculate results based on choices
    calculateResults() {
        const { podSize, color, humanCount } = this.choices;
        
        // Machine specifications (annual kg output)
        const MACHINES = {
            small: { name: "Size 1", annualKg: 182 },
            medium: { name: "Size 2", annualKg: 243 },
            large: { name: "Size 3", annualKg: 311 }
        };

        // Constants
        const FULL_DAY_PER_PERSON_KG = 128;
        const PER_MEAL_PER_YEAR_KG = FULL_DAY_PER_PERSON_KG / 3; // ≈ 42.6667

        // Group tops for sizing
        const GROUP_TOPS = [15, 25, 35, 45, 50];

        // Calculate people per machine (exact, no rounding)
        const machine = MACHINES[podSize];
        const ppm = machine.annualKg / PER_MEAL_PER_YEAR_KG;

        // Determine which group the human count falls into
        let groupTop = 15; // default
        for (const top of GROUP_TOPS) {
            if (humanCount <= top) {
                groupTop = top;
                break;
            }
        }

        // Calculate machines needed (size down - under-provision)
        const machinesNeeded = Math.floor(groupTop / ppm);

        // Calculate actual annual output
        const actualAnnualKg = machinesNeeded * machine.annualKg;

        // Color bonuses (affect efficiency and vibes, not core sizing)
        const colorBonus = {
            red: { efficiency: 1.2, vibes: 1.3, water: 0.9 },
            blue: { efficiency: 1.1, vibes: 1.1, water: 1.1 }
        };

        const bonus = colorBonus[color];

        // Calculate monthly greens (actual output with color efficiency)
        const monthlyGreens = Math.round((actualAnnualKg * bonus.efficiency) / 12);

        // Calculate water savings (based on traditional farming comparison)
        const waterSavingsPerKg = 15; // liters saved per kg vs traditional farming
        const annualWaterSaved = Math.round(actualAnnualKg * waterSavingsPerKg * bonus.water);

        // Calculate vibes (community impact)
        const baseVibesPerMachine = 5;
        const weeklyVibes = Math.round(machinesNeeded * baseVibesPerMachine * bonus.vibes);
        
        return {
            greens: monthlyGreens,
            water: annualWaterSaved,
            vibes: weeklyVibes,
            machinesNeeded: machinesNeeded,
            groupTop: groupTop,
            podSize: podSize,
            color: color,
            humanCount: humanCount,
            actualAnnualKg: actualAnnualKg
        };
    }

    // Get pod description based on size
    getPodDescription() {
        const descriptions = {
            small: "Sneaky Salad Mode",
            medium: "Mid-Tier Miracle", 
            large: "Sky Godzilla Grower"
        };
        return descriptions[this.choices.podSize] || "Mid-Tier Miracle";
    }

    // Get color description
    getColorDescription() {
        const descriptions = {
            red: "Passionate Red",
            blue: "Calm Blue"
        };
        return descriptions[this.choices.color] || "Calm Blue";
    }

    // Get human count description
    getHumanDescription() {
        const count = this.choices.humanCount;
        if (count <= 15) return "Intimate Gathering";
        if (count <= 25) return "Medium Cult";
        if (count <= 35) return "Growing Community";
        if (count <= 45) return "Block Party";
        return "Whole Neighborhood";
    }

    // Update the results display
    updateResults() {
        const results = this.calculateResults();
        
        // Update summary text
        const summaryElement = document.querySelector('.pod-summary');
        if (summaryElement) {
            const machineText = results.machinesNeeded === 1 ? 'machine' : 'machines';
            const sizingNote = results.humanCount <= results.groupTop ? 
                `Sized for up to ${results.groupTop} people (your group of ${results.humanCount})` :
                `Sized for ${results.groupTop} people (your group of ${results.humanCount})`;
            
            summaryElement.innerHTML = `
                Your <strong>${this.getPodDescription()}</strong> in <strong>${this.getColorDescription()}</strong> 
                will feed <strong>${this.getHumanDescription()}</strong> (${results.humanCount} people).<br><br>
                <strong>${results.machinesNeeded} ${machineText}</strong> deployed for ${sizingNote}.<br><br>
                It'll grow approx. <strong>${results.greens} kg of greens/month</strong> 
                (${Math.round(results.actualAnnualKg)} kg/year),<br>
                save <strong>${results.water} liters of water annually</strong>, 
                and emit <strong>${results.vibes} good vibes per week</strong>.
            `;
        }

        // Update title with pod info
        const titleElement = document.querySelector('.pod-deployed-title');
        if (titleElement) {
            titleElement.innerHTML = `Your <span style="color: ${results.color === 'red' ? '#d32f2f' : '#1976d2'}">${this.getPodDescription()}</span> Has Been Deployed.`;
        }

        // Update images based on pod size and color
        this.updateImages(results);
    }

    // Update images based on choices
    updateImages(results) {
        const podImages = document.querySelectorAll('.pod-view-img');
        
        // Get the correct plan and elevation images based on the same logic as GLB files
        const planImageName = this.getPlanImageName(results);
        const elevationImageName = this.getElevationImageName(results);
        const renderImageName = this.getRenderImageName(results);
        
        // Define image mappings - all images are now dynamic
        const images = [
            planImageName, // Plan view - dynamic based on scenario
            elevationImageName, // Elevation - dynamic based on scenario
            renderImageName // Render - dynamic based on color choice
        ];

        // Update each image
        podImages.forEach((img, index) => {
            if (images[index]) {
                img.src = images[index];
            }
        });

        // Load 3D model based on choices
        this.load3DModel(results);
    }

    // Determine which plan image to load based on choices (same logic as GLB)
    getPlanImageName(results) {
        const { podSize, machinesNeeded, groupTop } = results;
        
        // Map pod sizes to numbers
        const sizeMap = { small: 1, medium: 2, large: 3 };
        const sizeNumber = sizeMap[podSize];
        
        // Determine scenario number based on machines needed and group size
        let scenarioNumber = 1; // default
        
        if (sizeNumber === 1) { // Small pod
            if (machinesNeeded === 3) scenarioNumber = 1;
            else if (machinesNeeded === 5) scenarioNumber = 2;
            else if (machinesNeeded === 8) scenarioNumber = 3;
            else if (machinesNeeded === 10) scenarioNumber = 4;
            else if (machinesNeeded === 11) scenarioNumber = 5;
        } else if (sizeNumber === 2) { // Medium pod
            if (machinesNeeded === 2) scenarioNumber = 1;
            else if (machinesNeeded === 4) scenarioNumber = 2;
            else if (machinesNeeded === 6) scenarioNumber = 3;
            else if (machinesNeeded === 7) scenarioNumber = 4;
            else if (machinesNeeded === 8) scenarioNumber = 5;
        } else if (sizeNumber === 3) { // Large pod
            if (machinesNeeded === 2) scenarioNumber = 1;
            else if (machinesNeeded === 3) scenarioNumber = 2;
            else if (machinesNeeded === 4) scenarioNumber = 3;
            else if (machinesNeeded === 6) scenarioNumber = 4;
        }
        
        return `images/p${sizeNumber}.${scenarioNumber}.png`;
    }

    // Determine which elevation image to load based on choices (same logic as GLB)
    getElevationImageName(results) {
        const { podSize, machinesNeeded, groupTop } = results;
        
        // Map pod sizes to numbers
        const sizeMap = { small: 1, medium: 2, large: 3 };
        const sizeNumber = sizeMap[podSize];
        
        // Determine scenario number based on machines needed and group size
        let scenarioNumber = 1; // default
        
        if (sizeNumber === 1) { // Small pod
            if (machinesNeeded === 3) scenarioNumber = 1;
            else if (machinesNeeded === 5) scenarioNumber = 2;
            else if (machinesNeeded === 8) scenarioNumber = 3;
            else if (machinesNeeded === 10) scenarioNumber = 4;
            else if (machinesNeeded === 11) scenarioNumber = 5;
        } else if (sizeNumber === 2) { // Medium pod
            if (machinesNeeded === 2) scenarioNumber = 1;
            else if (machinesNeeded === 4) scenarioNumber = 2;
            else if (machinesNeeded === 6) scenarioNumber = 3;
            else if (machinesNeeded === 7) scenarioNumber = 4;
            else if (machinesNeeded === 8) scenarioNumber = 5;
        } else if (sizeNumber === 3) { // Large pod
            if (machinesNeeded === 2) scenarioNumber = 1;
            else if (machinesNeeded === 3) scenarioNumber = 2;
            else if (machinesNeeded === 4) scenarioNumber = 3;
            else if (machinesNeeded === 6) scenarioNumber = 4;
        }
        
        return `images/e${sizeNumber}.${scenarioNumber}.png`;
    }

    // Determine which render image to load based on color choice
    getRenderImageName(results) {
        const { color } = results;
        
        // Map color choices to render image files
        if (color === 'red') {
            return 'images/red.png';
        } else if (color === 'blue') {
            return 'images/blue.png';
        } else {
            // Fallback to default render image
            return 'images/image (12).png';
        }
    }

    // Determine which GLB file to load based on choices
    getGLBFileName(results) {
        const { podSize, machinesNeeded, groupTop } = results;
        
        // Map pod sizes to numbers
        const sizeMap = { small: 1, medium: 2, large: 3 };
        const sizeNumber = sizeMap[podSize];
        
        // Determine scenario number based on machines needed and group size
        let scenarioNumber = 1; // default
        
        if (sizeNumber === 1) { // Small pod
            if (machinesNeeded === 3) scenarioNumber = 1;
            else if (machinesNeeded === 5) scenarioNumber = 2;
            else if (machinesNeeded === 8) scenarioNumber = 3;
            else if (machinesNeeded === 10) scenarioNumber = 4;
            else if (machinesNeeded === 11) scenarioNumber = 5;
        } else if (sizeNumber === 2) { // Medium pod
            if (machinesNeeded === 2) scenarioNumber = 1;
            else if (machinesNeeded === 4) scenarioNumber = 2;
            else if (machinesNeeded === 6) scenarioNumber = 3;
            else if (machinesNeeded === 7) scenarioNumber = 4;
            else if (machinesNeeded === 8) scenarioNumber = 5;
        } else if (sizeNumber === 3) { // Large pod
            if (machinesNeeded === 2) scenarioNumber = 1;
            else if (machinesNeeded === 3) scenarioNumber = 2;
            else if (machinesNeeded === 4) scenarioNumber = 3;
            else if (machinesNeeded === 6) scenarioNumber = 4;
        }
        
        return `${sizeNumber}.${scenarioNumber}.glb`;
    }

    // Load and display 3D model
    load3DModel(results) {
        const container = document.getElementById('model-viewer');
        if (!container) {
            console.error('Model viewer container not found');
            return;
        }

        // Check if Three.js is loaded
        if (typeof THREE === 'undefined') {
            console.error('THREE is undefined');
            container.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #d32f2f; font-size: 1.1rem;">Three.js not loaded. Please refresh the page.</div>`;
            return;
        }

        if (typeof GLTFLoader === 'undefined') {
            console.error('GLTFLoader is undefined');
            container.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #d32f2f; font-size: 1.1rem;">GLTFLoader not loaded. Please refresh the page.</div>`;
            return;
        }

        if (typeof OrbitControls === 'undefined') {
            console.error('OrbitControls is undefined');
            container.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #d32f2f; font-size: 1.1rem;">OrbitControls not loaded. Please refresh the page.</div>`;
            return;
        }

        console.log('All Three.js modules loaded successfully');
        console.log('THREE:', typeof THREE);
        console.log('GLTFLoader:', typeof GLTFLoader);
        console.log('OrbitControls:', typeof OrbitControls);

        // Clear previous content
        container.innerHTML = '';

        try {
            // Create Three.js scene
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf8f9fa);

            // Create camera
            const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            camera.position.set(10, 10, 10);

            // Create renderer
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.appendChild(renderer.domElement);

            // Add lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
            directionalLight.position.set(15, 15, 10);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            // Add a second light for better visibility
            const pointLight = new THREE.PointLight(0xffffff, 0.5);
            pointLight.position.set(-10, 10, -10);
            scene.add(pointLight);

            // Add controls
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;

            // Load GLB model
            const loader = new GLTFLoader();
            const glbFileName = this.getGLBFileName(results);
            
            console.log('Loading GLB file:', glbFileName);
            console.log('Container dimensions:', container.clientWidth, 'x', container.clientHeight);
            
            loader.load(
                glbFileName,
                function (gltf) {
                    console.log('GLB file loaded successfully:', gltf);
                    console.log('GLTF scene:', gltf.scene);
                    const model = gltf.scene;
                    
                    // Clear the loading message
                    container.innerHTML = '';
                    container.appendChild(renderer.domElement);
                    
                    // Center and scale the model
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    
                    console.log('Model bounding box:', box);
                    console.log('Model center:', center);
                    console.log('Model size:', size);
                    
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 5 / maxDim; // Increased scale for better visibility
                    model.scale.setScalar(scale);
                    
                                         // Center the model at origin
                     model.position.set(0, 0, 0);
                     
                     console.log('Model scaled and positioned:', model.position, 'scale:', scale);
                     
                     // Enable shadows
                     model.traverse((child) => {
                         if (child.isMesh) {
                             child.castShadow = true;
                             child.receiveShadow = true;
                             console.log('Mesh found:', child.name || 'unnamed');
                         }
                     });
                     
                     scene.add(model);
                     console.log('Model added to scene. Scene children count:', scene.children.length);
                     
                     // Position camera to look at the model
                     const modelCenter = new THREE.Vector3(0, 0, 0);
                     camera.lookAt(modelCenter);
                     
                     // Adjust camera distance based on model size
                     const distance = Math.max(size.x, size.y, size.z) * 2;
                     camera.position.set(distance, distance, distance);
                     camera.lookAt(modelCenter);
                     
                     console.log('Camera positioned at:', camera.position, 'looking at:', modelCenter);
                },
                function (xhr) {
                    // Loading progress
                    const progress = (xhr.loaded / xhr.total) * 100;
                    console.log('Loading progress:', progress + '%');
                    container.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #256029; font-size: 1.1rem;">Loading 3D Model... ${Math.round(progress)}%</div>`;
                },
                function (error) {
                    // Error handling
                    console.error('Error loading GLB file:', error);
                    container.innerHTML = `
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 1rem;">
                            <div style="font-size: 3rem; margin-bottom: 16px;">🏗️</div>
                            <div style="text-align: center; line-height: 1.4;">
                                <strong>3D Model Preview</strong><br>
                                <small>Your custom pod configuration</small><br><br>
                                <small>Model: ${glbFileName}</small><br>
                                <small>Machines: ${results.machinesNeeded}</small><br>
                                <small>Group Size: ${results.groupTop} people</small>
                            </div>
                        </div>
                    `;
                }
            );

            // Animation loop
            let frameCount = 0;
            function animate() {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
                
                frameCount++;
                if (frameCount % 60 === 0) { // Log every 60 frames (about once per second)
                    console.log('Animation frame:', frameCount, 'Scene children:', scene.children.length);
                }
            }
            console.log('Starting animation loop');
            animate();

            // Handle window resize
            window.addEventListener('resize', function() {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            });

        } catch (error) {
            console.error('Error setting up 3D scene:', error);
            container.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 1rem;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">🏗️</div>
                    <div style="text-align: center; line-height: 1.4;">
                        <strong>3D Model Preview</strong><br>
                        <small>Your custom pod configuration</small><br><br>
                        <small>Model: ${this.getGLBFileName(results)}</small><br>
                        <small>Machines: ${results.machinesNeeded}</small><br>
                        <small>Group Size: ${results.groupTop} people</small>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded and modules are ready
function initializeTracker() {
    console.log('initializeTracker called');
    console.log('THREE available:', typeof THREE !== 'undefined');
    console.log('GLTFLoader available:', typeof GLTFLoader !== 'undefined');
    console.log('OrbitControls available:', typeof OrbitControls !== 'undefined');
    
    if (typeof THREE !== 'undefined' && typeof GLTFLoader !== 'undefined' && typeof OrbitControls !== 'undefined') {
        console.log('All modules available, creating ChoiceTracker');
        const tracker = new ChoiceTracker();
        tracker.updateResults();
    } else {
        console.log('Modules not ready, retrying in 100ms');
        // Wait a bit more for modules to load
        setTimeout(initializeTracker, 100);
    }
}

// Try multiple initialization approaches
function tryInitialize() {
    console.log('tryInitialize called, document ready state:', document.readyState);
    
    if (document.readyState === 'loading') {
        console.log('Document still loading, waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOMContentLoaded event fired');
            setTimeout(initializeTracker, 100);
        });
    } else {
        console.log('Document already loaded, initializing immediately');
        setTimeout(initializeTracker, 100);
    }
}

// Start initialization
tryInitialize();

console.log('=== END OF CHOICE-TRACKER.JS ==='); 