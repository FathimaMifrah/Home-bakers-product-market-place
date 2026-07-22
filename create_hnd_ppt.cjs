/*
 File: create_hnd_ppt.cjs
 Purpose: Presentation helper script.
 Main exports: Exports or main definitions
 */

// pptxgen: Helper or component used in this file.
const pptxgen = require("pptxgenjs");

let pres = new pptxgen();

// Layout and theme definitions
pres.layout = 'LAYOUT_16x9';

// Define styling properties
const titleProps = { 
    x: 0.5, y: 0.5, w: 9, h: 1, 
    fontSize: 32, 
    color: "2C3E50", // Dark slate for professional academic look
    bold: true,
    fontFace: "Arial"
};

// contentProps: Helper or component used in this file.
const contentProps = { 
    x: 0.5, y: 1.8, w: 9, h: 4, 
    fontSize: 22, 
    color: "34495E", 
    bullet: { code: "25CF", color: "FFB6C1" }, // Light pink bullets
    fontFace: "Arial",
    lineSpacing: 32
};

// bgProps: Helper or component used in this file.
const bgProps = { color: "FFFFFF" }; // White background

// Slide 1: Title Slide
let slide1 = pres.addSlide();
slide1.background = bgProps;

// Decorative top bar for academic look
slide1.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.15, fill: { color: "FFB6C1" } }); // Light Pink
slide1.addShape(pres.ShapeType.rect, { x: 0, y: 0.15, w: "100%", h: 0.1, fill: { color: "F5F5DC" } }); // Beige

slide1.addText("University / Institute Name", { x: 0.5, y: 1.0, w: 9, h: 0.5, fontSize: 20, color: "7F8C8D", align: "center", fontFace: "Arial" });
slide1.addText("Higher National Diploma in IT\nModule: Web Systems Development", { x: 0.5, y: 1.5, w: 9, h: 0.8, fontSize: 18, color: "7F8C8D", align: "center", fontFace: "Arial" });

slide1.addText("Home Bakers Product Marketplace System", { x: 0.5, y: 2.5, w: 9, h: 1.5, fontSize: 40, color: "2C3E50", bold: true, align: "center", fontFace: "Arial" });

slide1.addText("Student Name: [Your Name]\nStudent ID: [Your ID]\nSupervisor: [Supervisor Name]\nAcademic Year: 2025/2026", { x: 0.5, y: 4.2, w: 9, h: 1.2, fontSize: 18, color: "34495E", align: "center", fontFace: "Arial", lineSpacing: 24 });


// Slide 2: Introduction
let slide2 = pres.addSlide();
slide2.background = bgProps;
slide2.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.1, fill: { color: "FFB6C1" } });
slide2.addText("Introduction", titleProps);
slide2.addText([
  { text: "What is this project?" },
  { text: "A web-based marketplace dedicated to home bakers.", options: { bullet: false, indentLevel: 1, fontSize: 20, color: "555555" } },
  { text: "What users can do:" },
  { text: "Bakers: Upload and sell products.", options: { bullet: false, indentLevel: 1, fontSize: 20, color: "555555" } },
  { text: "Customers: Browse, order, and pay.", options: { bullet: false, indentLevel: 1, fontSize: 20, color: "555555" } },
  { text: "Delivery Partners: Manage and track deliveries.", options: { bullet: false, indentLevel: 1, fontSize: 20, color: "555555" } },
  { text: "Why this system is needed in real life:" },
  { text: "Provides a structured, easy-to-use platform replacing unorganized social media selling.", options: { bullet: false, indentLevel: 1, fontSize: 20, color: "555555" } }
], contentProps);


// Slide 3: Problem Statement
let slide3 = pres.addSlide();
slide3.background = bgProps;
slide3.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.1, fill: { color: "F5F5DC" } }); // Beige
slide3.addText("Problem Statement", titleProps);
slide3.addText([
  { text: "Current manual system relies heavily on social media, WhatsApp, and calls." },
  { text: "No proper order tracking system." },
  { text: "Payment confusion and missing records." },
  { text: "No proper inventory management for bakers." },
  { text: "No delivery tracking system." },
  { text: "Difficulty finding trusted bakers in one centralized place." }
], contentProps);


// Slide 4: Proposed Solution
let slide4 = pres.addSlide();
slide4.background = bgProps;
slide4.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.1, fill: { color: "FFB6C1" } });
slide4.addText("Proposed Solution", titleProps);
slide4.addText([
  { text: "Centralized online marketplace system." },
  { text: "Bakers can upload and manage their products easily." },
  { text: "Customers can browse and place orders online seamlessly." },
  { text: "System automatically manages orders and payments." },
  { text: "Delivery partners efficiently handle the delivery process." }
], contentProps);


// Slide 5: Main Features
let slide5 = pres.addSlide();
slide5.background = bgProps;
slide5.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.1, fill: { color: "F5F5DC" } });
slide5.addText("Main Features", titleProps);
slide5.addText([
  { text: "User registration and login securely." },
  { text: "Product browsing and search functionality." },
  { text: "Add to cart and place order capabilities." },
  { text: "Inventory management for bakers." },
  { text: "Order and payment tracking." },
  { text: "Delivery tracking system." },
  { text: "Ratings and feedback system." }
], contentProps);


// Slide 6: System Workflow
let slide6 = pres.addSlide();
slide6.background = bgProps;
slide6.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.1, fill: { color: "FFB6C1" } });
slide6.addText("System Workflow", titleProps);
slide6.addText([
  { text: "Step-by-step flow:" },
  { text: "Baker → Upload Products" },
  { text: "Customer → Browse → Place Order" },
  { text: "System → Payment" },
  { text: "Admin → Assign Delivery" },
  { text: "Delivery Partner → Delivery" },
  { text: "Customer → Receives Order → Leaves Feedback" }
], { ...contentProps, fontSize: 20 });


// Slide 7: Conclusion & Future Enhancements
let slide7 = pres.addSlide();
slide7.background = bgProps;
slide7.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.1, fill: { color: "F5F5DC" } });
slide7.addText("Conclusion & Future Enhancements", titleProps);
slide7.addText([
  { text: "Benefits of the system:" },
  { text: "Improves efficiency for home bakers.", options: { bullet: false, indentLevel: 1, fontSize: 20, color: "555555" } },
  { text: "Provides a better customer experience.", options: { bullet: false, indentLevel: 1, fontSize: 20, color: "555555" } },
  { text: "Future improvements:" },
  { text: "Mobile app implementation.", options: { bullet: false, indentLevel: 1, fontSize: 20, color: "555555" } },
  { text: "Live delivery tracking.", options: { bullet: false, indentLevel: 1, fontSize: 20, color: "555555" } },
  { text: "Online payment gateway integration.", options: { bullet: false, indentLevel: 1, fontSize: 20, color: "555555" } },
  { text: "AI recommendations for customers.", options: { bullet: false, indentLevel: 1, fontSize: 20, color: "555555" } }
], contentProps);


// Save the Presentation
pres.writeFile({ fileName: "Home_Bakers_HND_Presentation.pptx" }).then(() => {
    console.log("created");
}).catch(err => {
    console.error(err);
});