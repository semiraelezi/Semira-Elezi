document.addEventListener("DOMContentLoaded", () => {
    // Adjust lighting
    document.querySelector("#ambient-light").setAttribute("intensity", "0.3");
    document.querySelector("#overhead-light").setAttribute("intensity", "1.2");
   
    


    // Position windows
    document.querySelector("#windows-1").setAttribute("position", "5 0 0");
    document.querySelector("#windows-2").setAttribute("position", "-5 0 0");  // New window position
   
    


    // Row 1 
    const desksRow1 = document.querySelector("#desks-row-1");
    desksRow1.innerHTML = `
        <a-entity gltf-model="#desk-model" position="-2 -2 -2" scale="1 1 1"></a-entity>
        <a-entity gltf-model="#chair-model" position="-1.6 -2 -2.5" scale="0.2 0.2 0.2"></a-entity>
        <a-entity gltf-model="#chair-model" position="-2.2 -2 -2.5" scale="0.2 0.2 0.2"></a-entity>
  
        <a-entity gltf-model="#desk-model" position="2 -2 -2" scale="1 1 1"></a-entity>
        <a-entity gltf-model="#chair-model" position="2.4 -2 -2.5" scale="0.2 0.2 0.2"></a-entity>
        <a-entity gltf-model="#chair-model" position="1.8 -2 -2.5" scale="0.2 0.2 0.2"></a-entity>
    `;
  





    
    // Row 2 
    const desksRow2 = document.querySelector("#desks-row-2");
    desksRow2.innerHTML = `
        <a-entity gltf-model="#desk-model" position="-2 -2 2" scale="1 1 1"></a-entity>
        <a-entity gltf-model="#chair-model" position="-1.6 -2 1.5" scale="0.2 0.2 0.2"></a-entity>
        <a-entity gltf-model="#chair-model" position="-2.2 -2 1.5" scale="0.2 0.2 0.2"></a-entity>
  
        <a-entity gltf-model="#desk-model" position="2 -2 2" scale="1 1 1"></a-entity>
        <a-entity gltf-model="#chair-model" position="2.4 -2 1.5" scale="0.2 0.2 0.2"></a-entity>
        <a-entity gltf-model="#chair-model" position="1.8 -2 1.5" scale="0.2 0.2 0.2"></a-entity>
    `;
});
