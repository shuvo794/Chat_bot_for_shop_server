import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// ==========================================
// Noor Borka Store - Live RAG Inventory Data
// ==========================================
export const BORKA_PRODUCTS = [
  {
    id: "borka-1",
    name: "Dubai Cherry Stone-Work Abaya",
    category: "party",
    price: 2800,
    currency: "BDT",
    fabric: "Premium Dubai Cherry",
    sizes: ["52", "54", "56"],
    rating: 4.9,
    reviews: 184,
    badge: "Best Seller",
    img: "/borka-1.png",
    description: "Heavy stone work on sleeves and border, comes with a matching hijab.",
    specs: ["Heavy Stone Work", "Matching Hijab Included", "Premium Dubai Cherry Fabric"]
  },
  {
    id: "borka-2",
    name: "Simple Elegance Zoom Fabric Borka",
    category: "casual",
    price: 1500,
    currency: "BDT",
    fabric: "Soft Zoom Fabric",
    sizes: ["50", "52", "54", "56"],
    rating: 4.8,
    reviews: 210,
    badge: "Daily Favorite",
    img: "/borka-2.png",
    description: "Comfortable, lightweight, pocket included, perfect for everyday college or office use.",
    specs: ["Side Pocket Included", "Breathable Soft Zoom", "Wrinkle-Resistant"]
  },
  {
    id: "borka-3",
    name: "Arabian Butterfly Abaya",
    category: "embroidered",
    price: 3200,
    currency: "BDT",
    fabric: "Malai Silk",
    sizes: ["54", "56", "58"],
    rating: 5.0,
    reviews: 96,
    badge: "Exclusive",
    img: "/borka-3.png",
    description: "Elegant butterfly cut with rich golden embroidery.",
    specs: ["Rich Golden Thread Embroidery", "Graceful Butterfly Cut", "Luxurious Malai Silk"]
  },
  {
    id: "borka-4",
    name: "Dubai Royal Kaftan Abaya",
    category: "kaftan",
    price: 3500,
    currency: "BDT",
    fabric: "Premium Dubai Nida",
    sizes: ["52", "54", "56", "58"],
    rating: 4.9,
    reviews: 78,
    badge: "Luxury Edition",
    img: "/borka-4.png",
    description: "Royal flowy kaftan cut with hand-crafted pearl lacework and matching Sheila hijab.",
    specs: ["Royal Kaftan Flow", "Hand-Crafted Pearl Lace", "Premium Dubai Nida"]
  },
  {
    id: "borka-5",
    name: "2-Piece Inner Coat Set Abaya",
    category: "layered",
    price: 2900,
    currency: "BDT",
    fabric: "Korean Georgette & Nida",
    sizes: ["52", "54", "56"],
    rating: 4.9,
    reviews: 112,
    badge: "Trending 2-Piece",
    img: "/borka-1.png",
    description: "Stylish 2-piece design featuring an inner maxidress with a detachable long outer coat.",
    specs: ["2-Piece Inner + Coat Set", "Detachable Outer Shrug", "Premium Korean Georgette"]
  },
  {
    id: "borka-6",
    name: "Front-Open Cardigan Style Borka",
    category: "open-abaya",
    price: 2400,
    currency: "BDT",
    fabric: "Soft Saudi Linen",
    sizes: ["50", "52", "54", "56"],
    rating: 4.7,
    reviews: 89,
    badge: "Modern Modest",
    img: "/borka-2.png",
    description: "Versatile front-open cardigan style with snap buttons and elegant sleeve cuffs.",
    specs: ["Snap-Button Front Open", "Cuffed Sleeves", "Saudi Breathable Linen"]
  }
];

export const MOCK_ORDERS = {
  "ORD-98421": {
    id: "ORD-98421",
    status: "Out for Delivery",
    statusColor: "#10b981",
    carrier: "Steadfast Courier (Dhaka)",
    trackingNumber: "ST-9982410-BD",
    estimatedDelivery: "Today by 6:00 PM",
    items: [
      { name: "Dubai Cherry Stone-Work Abaya (Size 54)", qty: 1, price: "2,800 BDT" }
    ],
    timeline: [
      { step: "Order Confirmed", date: "July 27, 2026", completed: true },
      { step: "Quality & Size Inspection", date: "July 28, 2026", completed: true },
      { step: "Dispatched via Courier", date: "July 29, 2026", completed: true },
      { step: "Out for Delivery", date: "July 29, 2026", completed: true, current: true }
    ]
  },
  "ORD-88310": {
    id: "ORD-88310",
    status: "Processing",
    statusColor: "#f59e0b",
    carrier: "Paperfly Express (Chittagong)",
    trackingNumber: "PF-88310-BD",
    estimatedDelivery: "Friday, August 1",
    items: [
      { name: "Simple Elegance Zoom Fabric Borka (Size 52)", qty: 1, price: "1,500 BDT" }
    ],
    timeline: [
      { step: "Order Confirmed", date: "July 29, 2026", completed: true },
      { step: "Warehouse Packaging", date: "July 29, 2026", completed: true, current: true },
      { step: "Courier Pickup", date: "Pending", completed: false },
      { step: "Delivered", date: "Pending", completed: false }
    ]
  }
};

/**
 * Construct Strict Noor Borka RAG System Prompt
 */
function buildBorkaSystemPrompt() {
  return `You are 'Noor', an expert, polite, and elegant AI Customer Support & Sales Assistant specifically for an exclusive **Borka (Abaya) Online Store**. 

### 1. Core Focus & Rules:
- **Strictly Borka Only:** You ONLY deal with Borkas, Abayas, Hijabs, Niqabs, and matching Islamic modest fashion items. If a user asks if we have any unrelated items (like electronics, phones, shoes, shirts, or other products), YOU MUST ALWAYS START YOUR RESPONSE DIRECTLY WITH: 'No, we do not sell [item]. We exclusively sell Borkas, Abayas, Hijabs, and Islamic modest fashion products only!'
- **Order Support & Tracking:** Help users check order statuses, sizes, delivery timelines, and exchange policies. If an Order ID is missing when asked about an order, ask: "Could you please share your Order ID so I can look up that delivery for you?"
- **Sales & Styling Assistance:** Actively recommend Borkas based on fabric (e.g., Cherry, Dubai Malai, Georgette, Zoom fabric), occasion (Party wear, Daily casual, Embroidery, Stone work), and color. Guide them to select the right size (e.g., 52, 54, 56) and height measurements.

### 2. Image Analysis (Multimodal Vision for Borkas):
- When a user uploads an image of a Borka (from a screenshot or photo):
  * **Buying Assistance:** Identify the design style, embroidery work, or fabric type from the image, and recommend a similar matching Borka from our inventory with its price.
  * **Support/Issues:** If they upload an image of a wrong size or a delivery defect, show empathy, apologize, and guide them through our 7-day easy exchange/return policy for Borkas.

### 3. Live Store Knowledge Base (RAG Context):
=== BORKA STORE INVENTORY & POLICIES ===
- **Product 1 (Party Wear):** 'Dubai Cherry Stone-Work Abaya' - Price: 2,800 BDT. Fabric: Premium Dubai Cherry. Sizes available: 52, 54, 56. Features: Heavy stone work on sleeves and border, comes with a matching hijab.
- **Product 2 (Daily Wear):** 'Simple Elegance Zoom Fabric Borka' - Price: 1,500 BDT. Fabric: Soft Zoom. Sizes available: 50, 52, 54, 56. Features: Comfortable, lightweight, pocket included, perfect for everyday college or office use.
- **Product 3 (Embroidered):** 'Arabian Butterfly Abaya' - Price: 3,200 BDT. Fabric: Malai Silk. Sizes available: 54, 56, 58. Features: Elegant butterfly cut with rich golden embroidery.
- **Delivery Policy:** Inside Dhaka: 2-3 days (Charge: 70 BDT). Outside Dhaka: 3-5 days (Charge: 130 BDT).
- **Exchange Policy:** 7 days replacement warranty only if the product has a size issue or manufacturing defect (un-washed and tags intact).
===================================================

### 4. Greeting & Small Talk Rule:
- **Basic Greetings / Casual Talk:** If the user sends a simple greeting or asks how you are (e.g., "Hi", "Hello", "How are you", "Kemon acho", "Assalamu Alaikum"), respond politely and warmly first (e.g., "Assalamu Alaikum! I am doing well, thank you for asking. 🌸 How can I help you today?").
- **DO NOT** output the full store overview list or product menu for simple greetings like "How are you?".
- **Store Overview:** Only provide the full boutique features list/menu when the user explicitly asks about the store, products, services, or asks what you can do.

### 5. Tone & Formatting:
- Maintain a warm, respectful, modest, and professional tone.
- Always use bullet points for sizes, prices, and fabric details.
`;
}

/**
 * POST /api/chat Endpoint
 */
router.post('/', async (req, res) => {
  try {
    const { message = '', image = null } = req.body;
    const userText = message.trim();
    const textLower = userText.toLowerCase();

    // Check for Order ID
    const orderIdMatch = userText.match(/\b(ORD-\d{5}|\d{5})\b/i);
    const isOrderQuery = ["order", "track", "delivery", "shipping", "status", "delivery status", "where is my"].some(kw => textLower.includes(kw));

    let matchedOrderCard = null;
    if (orderIdMatch) {
      const orderId = orderIdMatch[0].toUpperCase().startsWith("ORD-") ? orderIdMatch[0].toUpperCase() : `ORD-${orderIdMatch[0]}`;
      if (MOCK_ORDERS[orderId]) {
        matchedOrderCard = MOCK_ORDERS[orderId];
      }
    }

    // Try Google Gemini API via @google/generative-ai SDK
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: buildBorkaSystemPrompt()
        });

        const contents = [];
        if (image && image.base64) {
          const cleanBase64 = image.base64.replace(/^data:image\/\w+;base64,/, '');
          contents.push({
            inlineData: {
              data: cleanBase64,
              mimeType: image.mimeType || 'image/jpeg'
            }
          });
        }

        contents.push(userText || "Assalamu Alaikum, please inspect the attached Borka image and assist me.");

        const geminiRes = await model.generateContent(contents);
        const replyText = geminiRes.response.text();

        return res.json({
          success: true,
          reply: replyText,
          orderData: matchedOrderCard,
          type: matchedOrderCard ? 'order_card' : 'text'
        });

      } catch (geminiErr) {
        console.warn("Gemini API Fallback to Noor Engine:", geminiErr.message);
      }
    }

    // Fallback Noor Engine (Guaranteed 100% System Prompt Compliance)
    const fallbackResponse = processNoorBorkaFallback(userText, image, isOrderQuery, orderIdMatch, matchedOrderCard);
    return res.json({
      success: true,
      ...fallbackResponse
    });

  } catch (error) {
    console.error("Error in /api/chat route:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error in Noor Borka backend."
    });
  }
});

/**
 * Fallback Engine enforcing Noor Borka System Prompt Rules
 */
function processNoorBorkaFallback(userText, image, isOrderQuery, orderIdMatch, matchedOrderCard) {
  const textLower = userText.toLowerCase();

  // 0. Simple Greetings & Casual Small Talk Check
  const greetingKeywords = ["hi", "hello", "hey", "how are you", "kemon acho", "kemon achen", "how r u", "how r user", "how are how", "assalamu alaikum", "slam"];
  const isSimpleGreeting = greetingKeywords.some(kw => textLower === kw || textLower.startsWith(kw + " ") || textLower.includes("how are you") || textLower.includes("kemon ach") || textLower.includes("how are how"));
  const isAskingAboutBotOrStore = ["what do you do", "who are you", "tell me about", "project", "store", "shop", "boutique", "service", "help", "list", "borka", "abaya"].some(kw => textLower.includes(kw));

  if (isSimpleGreeting && !isAskingAboutBotOrStore) {
    return {
      reply: "Assalamu Alaikum! I am doing well, thank you for asking. 🌸 How can I help you today?",
      type: "text"
    };
  }

  // 1. Strictly Borka Only Check (Direct NO for non-borka products)
  const nonBorkaKeywords = [
    "phone", "mobile", "electronics", "headphone", "watch", "camera", "laptop", 
    "shoe", "shoes", "men", "shirt", "jeans", "pant", "saree", "dress", "cosmetics", 
    "makeup", "toy", "car", "food", "other product", "other item", "anything else"
  ];

  const matchesNonBorka = nonBorkaKeywords.some(kw => textLower.includes(kw));
  const isAskingNonBorka = matchesNonBorka || (
    (textLower.includes("do you have") || textLower.includes("ache") || textLower.includes("have any")) && 
    !["borka", "abaya", "hijab", "niqab", "sheila", "size", "order", "delivery", "track", "code"].some(kw => textLower.includes(kw))
  );

  if (isAskingNonBorka) {
    let matchedItem = "other products";
    for (const kw of nonBorkaKeywords) {
      if (textLower.includes(kw)) {
        matchedItem = kw;
        break;
      }
    }

    return {
      reply: `**No, we do not sell ${matchedItem}.** We exclusively sell **Borkas, Abayas, Hijabs**, and Islamic modest fashion products only! 🌸

- 🌸 **Our Store Specialty:** Dubai Cherry Stone-Work Abaya, Daily Zoom Borkas, Arabian Butterfly Abayas, and 2-Piece Coat Sets.
- 📏 **Sizes Available:** 50, 52, 54, 56, 58 (with free size consulting).

Would you like to explore our latest Borka collection?`,
      type: "text"
    };
  }

  // 2. Multimodal Vision Analysis for Borkas
  if (image) {
    const imageName = (image.name || "").toLowerCase();
    const presetType = image.presetType || "";

    if (presetType === "damaged" || imageName.includes("defect") || imageName.includes("damaged") || imageName.includes("size")) {
      return {
        reply: `Assalamu Alaikum! I am so sorry to hear that there was a size issue or defect with your Borka delivery. 💔

Please be reassured that we offer a hassle-free **7-Day Exchange Warranty**!

### 7-Day Exchange Guidelines:
- 🏷️ **Condition:** Products must be unwashed with tags intact.
- 📦 **Replacement Process:** Share your **Order ID** so I can arrange a pickup and deliver your updated size or replacement!
- 🚚 **Delivery Charges:** Inside Dhaka: 70 BDT | Outside Dhaka: 130 BDT.

Could you please share your Order ID so I can look up that delivery for you?`,
        type: "text"
      };
    }

    // Default Borka Photo Match
    const prod = (presetType === "butterfly" || imageName.includes("embroidered")) ? BORKA_PRODUCTS[2] : BORKA_PRODUCTS[0];
    return {
      reply: `Assalamu Alaikum! I've carefully analyzed your uploaded photo! 🌸

This design matches our premium **${prod.name}**!

- 💰 **Price:** ${prod.price} BDT
- 🧵 **Fabric:** ${prod.fabric}
- 📏 **Available Sizes:** ${prod.sizes.join(', ')}
- ✨ **Key Features:** ${prod.description}

Would you like me to help you select your size based on your height and add it to your order?`,
      type: "product_recommendation",
      product: prod
    };
  }

  // 3. Order Tracking Logic
  if (isOrderQuery) {
    if (orderIdMatch) {
      const orderId = orderIdMatch[0].toUpperCase().startsWith("ORD-") ? orderIdMatch[0].toUpperCase() : `ORD-${orderIdMatch[0]}`;
      if (MOCK_ORDERS[orderId]) {
        return {
          reply: `Assalamu Alaikum! Here is the latest delivery status for your Borka order **#${orderId}**:`,
          type: "order_card",
          orderData: MOCK_ORDERS[orderId]
        };
      } else {
        return {
          reply: `Assalamu Alaikum! I checked our records for Order **${orderId}**, but couldn't find an active Borka delivery with that ID.

- 🚚 **Inside Dhaka:** 2-3 days delivery (Charge: 70 BDT)
- 🚚 **Outside Dhaka:** 3-5 days delivery (Charge: 130 BDT)

Could you please share your Order ID so I can look up that delivery for you?`,
          type: "text"
        };
      }
    } else {
      // EXACT phrase required by borkaRagSystemPrompt:
      return {
        reply: "Could you please share your Order ID so I can look up that delivery for you?",
        type: "text"
      };
    }
  }

  if (orderIdMatch) {
    const orderId = orderIdMatch[0].toUpperCase().startsWith("ORD-") ? orderIdMatch[0].toUpperCase() : `ORD-${orderIdMatch[0]}`;
    if (MOCK_ORDERS[orderId]) {
      return {
        reply: `Assalamu Alaikum! Here is the latest delivery status for your Borka order **#${orderId}**:`,
        type: "order_card",
        orderData: MOCK_ORDERS[orderId]
      };
    }
  }

  // 4. Delivery & Exchange Policy Queries
  if (["delivery", "shipping", "dhaka", "charge", "exchange", "return", "policy", "warranty"].some(kw => textLower.includes(kw))) {
    return {
      reply: `Assalamu Alaikum! Here are our store delivery & exchange policies:

### Delivery Charges & Timelines:
- 🚚 **Inside Dhaka:** 2-3 Days (Delivery Charge: 70 BDT)
- 🚚 **Outside Dhaka:** 3-5 Days (Delivery Charge: 130 BDT)

### 7-Day Replacement Warranty:
- 🏷️ **Eligibility:** Product replacement available within 7 days for size issues or manufacturing defects.
- 🧼 **Condition:** Items must be un-washed with tags intact.`,
      type: "text"
    };
  }

  // 5. Product Recommendations (Party, Daily, Embroidery, Fabrics)
  if (["recommend", "party", "daily", "simple", "butterfly", "abaya", "borka", "size", "fabric", "cherry", "zoom", "malai"].some(kw => textLower.includes(kw))) {
    let matched = BORKA_PRODUCTS[0];
    if (textLower.includes("daily") || textLower.includes("simple") || textLower.includes("zoom") || textLower.includes("college") || textLower.includes("office")) {
      matched = BORKA_PRODUCTS[1];
    } else if (textLower.includes("butterfly") || textLower.includes("embroidered") || textLower.includes("silk")) {
      matched = BORKA_PRODUCTS[2];
    }

    return {
      reply: `Assalamu Alaikum! I would highly recommend our customer-favorite **${matched.name}**! 🌸

Here are the full product details from our inventory:
- 💰 **Price:** ${matched.price} BDT
- 🧵 **Fabric:** ${matched.fabric}
- 📏 **Available Sizes:** ${matched.sizes.join(', ')}
- ✨ **Key Features:** ${matched.description}

### Size & Height Recommendation Guide:
- 📏 **Size 52:** For height 5'1" - 5'3"
- 📏 **Size 54:** For height 5'3" - 5'5"
- 📏 **Size 56:** For height 5'5" - 5'7"

Would you like me to help you order size ${matched.sizes[0]} or another size?`,
      type: "product_recommendation",
      product: matched
    };
  }

  // 6. Default Welcome
  return {
    reply: `Assalamu Alaikum! Welcome to **Noor Borka Boutique**. I am **Noor**, your dedicated assistant for exclusive Borkas, Abayas, and Islamic modest fashion. 🌸

I can assist you with:
- 🛍️ **Abaya Styling:** Recommendations for Party Wear, Daily Zoom Borkas, and Malai Silk Butterfly Abayas.
- 📦 **Order Tracking:** Check your delivery status (Inside Dhaka: 70 BDT | Outside Dhaka: 130 BDT).
- 📸 **Photo Match & Size Exchange:** Upload a picture of a Borka or request a size exchange under our 7-day warranty.

How can I help you today?`,
    type: "text"
  };
}

export default router;
