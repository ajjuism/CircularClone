// Show the UI
figma.showUI(__html__, { width: 400, height: 670 });

const figmaUIApi: UIAPI = figma.ui;

figmaUIApi.onmessage = async (msg) => {
    console.log("Received message from UI:", msg);

    if (msg.type === 'create-pattern') {
        const nodes: SceneNode[] = [];
        const selection = figma.currentPage.selection[0];

        if (!selection) {
            figma.notify("Please select an item in Figma.");
            return;
        }

        // Check if the selection is a FRAME or a SHAPE
        if (selection && (selection.type === 'FRAME' || isShape(selection))) {
            const centerX = figma.viewport.center.x;
            const centerY = figma.viewport.center.y;
            const segments = msg.segments;
            const rotationAngle = msg.rotation / segments; // Calculate rotation angle based on segments and total rotation
            const initialRotation = msg.initialRotation || 0; // Default to 0 if not provided

            for (let i = 0; i < segments; i++) {
              const clone = selection.clone() as FrameNode | RectangleNode | EllipseNode | PolygonNode | StarNode | VectorNode | BooleanOperationNode;
              const symmetryPoints = getSymmetryPointsWithRadius(0, 0, rotationAngle * i, centerX - selection.x, centerY - selection.y, msg.radius || 100);
              clone.x += symmetryPoints[0]; // Adjust the x position relative to the original selection
              clone.y += symmetryPoints[1]; // Adjust the y position relative to the original selection
              clone.rotation = initialRotation;
              nodes.push(clone);
              figma.currentPage.appendChild(clone);
          }

            figma.currentPage.selection = nodes;
            figma.viewport.scrollAndZoomIntoView(nodes);
        }
    }
};

function isShape(node: SceneNode): boolean {
    const shapeTypes: NodeType[] = ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR', 'BOOLEAN_OPERATION'];
    return shapeTypes.indexOf(node.type) !== -1;
}

function getSymmetryPointsWithRadius(x: number, y: number, angle: number, centerX: number, centerY: number, radius: number): [number, number] {
    const distanceFromCenter = radius;
    const newX = centerX + distanceFromCenter * Math.cos((angle * Math.PI) / 180);
    const newY = centerY + distanceFromCenter * Math.sin((angle * Math.PI) / 180);
    return [newX, newY];
}
