import html2canvas from "html2canvas";

export async function exportAsPNG(element: HTMLDivElement | null, setIsCapturing: (c: boolean) => void) {
  if (!element) return;
  
  let clone: HTMLDivElement | null = null;
  try {
    setIsCapturing(true);
    // Give state updates time to flush
    await new Promise(r => setTimeout(r, 150));

    // 1. Clone the element
    clone = element.cloneNode(true) as HTMLDivElement;
    
    // 2. Add an export class so we can style it as desktop in CSS
    clone.classList.add("desktop-export-clone");
    
    // 3. Position off-screen and attach to body
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0px";
    clone.style.zIndex = "-9999";
    
    // 4. Force default desktop width depending on the aspect ratio/type
    const originalWidth = element.style.width;
    const originalHeight = element.style.height;
    
    if (originalWidth) {
      clone.style.width = originalWidth;
    } else {
      clone.style.width = "1000px"; // default landscape width for export
    }
    
    if (originalHeight) {
      clone.style.height = originalHeight;
    } else {
      clone.style.height = "auto";
    }

    document.body.appendChild(clone);

    // Give browser a moment to layout the clone
    await new Promise(r => setTimeout(r, 150));

    // 5. Run html2canvas on the clone
    const canvas = await html2canvas(clone, {
      backgroundColor: "#0d1117", // dark theme background
      scale: 2, // High resolution
      logging: false,
      useCORS: true
    });

    // 6. Download the image
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "git-contribution-meme.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    console.error("Failed to capture image", e);
  } finally {
    if (clone && document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
    setIsCapturing(false);
  }
}
