/*
 File: create_ppt.cjs
 Purpose: Presentation helper script.
 Main exports: Exports or main definitions
 */

// pptxgen: Helper or component used in this file.
const pptxgen = require("pptxgenjs");

let pres = new pptxgen();

// Common properties for titles and content
const titleProps = { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 36, color: "363636", bold: true };
// contentProps: Helper or component used in this file.
const contentProps = { x: 0.5, y: 1.8, w: 9, h: 3.5, fontSize: 24, color: "363636", bullet: true };

// Slide 1: Title Slide
let slide1 = pres.addSlide();
slide1.addText("Home Bakers Product Marketplace System", { x: 0.5, y: 1.5, w: 9, h: 1.5, fontSize: 44, color: "003366", bold: true, align: "center" });
slide1.addText("M.I.F Mifrah\nCourse / Institution\nMid Presentation", { x: 0.5, y: 3.5, w: 9, h: 1.5, fontSize: 24, color: "363636", align: "center" });

// Slide 2: Introduction
let slide2 = pres.addSlide();
slide2.addText("Introduction", titleProps);
slide2.addText([
  { text: "What is this project? A simple online marketplace for home bakers." },
  { text: "Real-life problem: Home bakers currently sell through social media, which is hard to manage." },
  { text: "Why an online system is needed: It provides a proper platform to track and manage everything." }
], contentProps);

// Slide 3: Problem Statement
let slide3 = pres.addSlide();
slide3.addText("Problem Statement", titleProps);
slide3.addText([
  { text: "No proper platform for home bakers." },
  { text: "Orders handled manually through messages/calls." },
  { text: "No proper tracking system." },
  { text: "Payment confusion and missing records." },
  { text: "Difficulty in managing customers and deliveries." }
], contentProps);

// Slide 4: Proposed Solution
let slide4 = pres.addSlide();
slide4.addText("Proposed Solution", titleProps);
slide4.addText([
  { text: "A simple online marketplace system." },
  { text: "Bakers can easily upload products." },
  { text: "Customers can browse and order easily." },
  { text: "Orders and payments managed in one system." },
  { text: "Delivery handled through delivery partners." }
], contentProps);

// Slide 5: Main Features (Simple)
let slide5 = pres.addSlide();
slide5.addText("Main Features", titleProps);
slide5.addText([
  { text: "User login and registration." },
  { text: "Product browsing and search." },
  { text: "Add to cart and place order." },
  { text: "Order tracking system." },
  { text: "Admin manages users and orders." },
  { text: "Delivery partner system." }
], contentProps);

// Slide 6: How the System Works
let slide6 = pres.addSlide();
slide6.addText("How the System Works", titleProps);
slide6.addText([
  { text: "Customer → Browse Products" },
  { text: "→ Add to Cart" },
  { text: "→ Place Order" },
  { text: "→ Payment" },
  { text: "→ Admin Assigns Delivery Partner" },
  { text: "→ Delivery" },
  { text: "→ Customer Receives Order" }
], { ...contentProps, fontSize: 22 }); // slightly smaller font for flow

// Slide 7: Conclusion
let slide7 = pres.addSlide();
slide7.addText("Conclusion", titleProps);
slide7.addText([
  { text: "Project progress so far is on track." },
  { text: "Benefits of the system for home bakers and customers." },
  { text: "Future improvements like mobile app, online payments, and live tracking." }
], contentProps);

// Save the Presentation
pres.writeFile({ fileName: "Home_Bakers_Marketplace.pptx" }).then(() => {
    console.log("created");
}).catch(err => {
    console.error(err);
});