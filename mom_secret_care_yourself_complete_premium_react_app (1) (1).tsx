import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, Heart, Star, User, Settings, ArrowRight, Trash2, Edit, Plus, 
  Check, X, Shield, Truck, Share2, Upload, Search, Filter, ChevronRight, 
  ArrowLeft, Image as ImageIcon, BarChart3, Package, List, MessageSquare, 
  Percent, Eye, FileText, Smartphone, Lock, ChevronLeft, Copy, Share, Mic, MicOff,
  Sparkles, Send, Volume2, Wand2, Brain, HelpCircle, RefreshCw, Ticket
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, collection, query, addDoc, getDocs } from 'firebase/firestore';

let db = null;
let auth = null;
let isFirebaseActive = false;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mom-secret-care-yourself';

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseActive = true;
  }
} catch (e) {
  console.warn("Firebase not configured or initialized, running in offline mode.", e);
}

// Traditional hand-drawn cartoon-style vector illustrations
const PotMortarCartoonSVG = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 mx-auto drop-shadow-md text-amber-700" fill="currentColor">
    <rect x="42" y="10" width="16" height="50" rx="8" transform="rotate(15 50 35)" fill="#b45309" />
    <path d="M20 50 C20 80, 80 80, 80 50 L75 45 L25 45 Z" fill="#78350f" />
    <ellipse cx="50" cy="45" rx="25" ry="6" fill="#451a03" />
    <path d="M22 42 Q10 30 25 35 Q30 20 35 38" fill="#10b981" />
    <path d="M78 42 Q90 30 75 35 Q70 20 65 38" fill="#34d399" />
    <circle cx="25" cy="30" r="4" fill="#fbbf24" />
    <circle cx="75" cy="28" r="4" fill="#fbbf24" />
  </svg>
);

const MotherDaughterLoveCartoonSVG = () => (
  <svg viewBox="0 0 100 100" className="w-14 h-14 mx-auto drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M30 80 C30 55, 50 45, 60 55 C70 65, 80 50, 70 35 C60 20, 45 25, 40 40" stroke="#78350f" fill="#fef3c7" strokeLinecap="round" />
    <path d="M45 85 C45 70, 58 65, 65 72 C72 79, 78 70, 72 60" stroke="#78350f" fill="#fde68a" strokeLinecap="round" />
    <path d="M50 15 C45 25, 55 25, 50 15 Z" fill="#f59e0b" opacity="0.8" />
    <path d="M40 20 C35 28, 45 28, 40 20 Z" fill="#ef4444" opacity="0.8" />
    <path d="M60 20 C55 28, 65 28, 60 20 Z" fill="#ef4444" opacity="0.8" />
    <path d="M22 35 C20 30, 25 28, 27 32 C29 28, 34 30, 32 35 L27 40 Z" fill="#f43f5e" stroke="none" />
    <path d="M78 45 C76 40, 81 38, 83 42 C85 38, 90 40, 88 45 L83 50 Z" fill="#f43f5e" stroke="none" />
  </svg>
);

const DEFAULT_CATEGORIES = [
  { id: 'skincare', name: 'Skincare', description: "Ubtans, face packs, and organic creams inspired by grandma's glow secrets." },
  { id: 'haircare', name: 'Haircare', description: "Nourishing herbal oils, shampoos, and masks for lustrous, healthy hair." },
  { id: 'stationery', name: 'Stationery', description: "Traditional diaries, envelopes, and craft items celebrating Indian art." },
  { id: 'jewelry', name: 'Jewelry', description: "Handcrafted traditional and temple-style ornaments with timeless grace." },
  { id: 'other', name: 'Other Wellness', description: "Handmade natural soaps, aromatherapy oils, and holistic items." }
];

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    name: "Grandma's Golden Saffron Face Ubtan",
    category: 'skincare',
    price: 399,
    description: "A traditional recipe passed down through generations. Crafted with pure Kashmiri saffron, sandalwood extracts, organic turmeric, and chickpea flour to gently exfoliate, brighten, and restore your skin's natural glow.",
    specifications: "Weight: 100g, Skin Type: All, Ingredients: Saffron, Sandalwood, Turmeric, Chickpea flour, Almond powder, Rose water.",
    rating: 4.9,
    reviewsCount: 142,
    images: [
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=600"
    ],
    stock: 25,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    id: 'prod-2',
    name: "Mother's Loving Sandalwood & Neem Soap",
    category: 'other',
    price: 180,
    description: "A cooling and purifying bathing bar handmade with cold-pressed oils, pure sandalwood paste, and organic fresh neem leaves to protect and cleanse sensitive skin.",
    specifications: "Weight: 120g, Cruelty-free, SLS & Paraben-free, Key herb: Sandalwood oil, Neem leaf extract.",
    rating: 4.8,
    reviewsCount: 96,
    images: [
      "https://images.unsplash.com/photo-1607006342411-101038e68448?auto=format&fit=crop&q=80&w=600"
    ],
    stock: 40,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    id: 'prod-3',
    name: "Traditional Bhringraj & Rosemary Hair Oil",
    category: 'haircare',
    price: 450,
    description: "Slow-infused with cold-pressed sesame oil, fresh bhringraj leaves, rosemary extracts, and amla. Stimulates deep root growth, prevents premature graying, and locks in glossy moisture.",
    specifications: "Volume: 200ml, Suitable for: All hair types, Application: Massage into scalp and leave overnight.",
    rating: 4.9,
    reviewsCount: 210,
    images: [
      "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=600"
    ],
    stock: 18,
    isBestSeller: true,
    isNewArrival: false
  }
];

const SEED_REVIEWS = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userName: "Meenakshi Sundaram",
    rating: 5,
    comment: "This face pack reminds me exactly of what my grandmother used to make with fresh wild turmeric. It leaves such a warm golden glow and the fragrance of real sandalwood is divine!",
    status: 'approved',
    date: '2026-05-12',
    image: null
  }
];

const INDIAN_STATES = [
  "Tamil Nadu", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", 
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi", "Puducherry"
];

const base64ToArrayBuffer = (base64) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const pcmToWav = (pcm16, sampleRate) => {
  const buffer = new ArrayBuffer(44 + pcm16.length * 2);
  const view = new DataView(buffer);
  
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcm16.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // raw PCM channel code
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, pcm16.length * 2, true);

  for (let i = 0; i < pcm16.length; i++) {
    view.setInt16(44 + i * 2, pcm16[i], true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
};

const injectCustomStyles = () => {
  if (typeof document === 'undefined') return;
  const styleId = "mscy-custom-font-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Montserrat:wght@300;400;500;600;700&display=swap');
      .font-traditional { font-family: 'Cinzel', serif; }
      .font-sans-premium { font-family: 'Montserrat', sans-serif; }
      .mandala-bg {
        background-image: radial-gradient(circle at 100% 100%, #fdf6e2 0%, transparent 80%),
                          radial-gradient(circle at 0% 0%, #fff9eb 0%, transparent 80%);
      }
    `;
    document.head.appendChild(style);
  }
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  // User Authentication & Master Keys
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  const [adminCreds, setAdminCredentials] = useState(() => {
    const saved = localStorage.getItem('mscy_admin_creds');
    return saved ? JSON.parse(saved) : { username: 'admin', password: 'mscyadmin2026' };
  });

  const [newUsernameInput, setNewUsernameInput] = useState(adminCreds.username);
  const [newPasswordInput, setNewPasswordInput] = useState(adminCreds.password);

  // Dynamic Bank Settings & QR Codes
  const [bankDetails, setBankDetails] = useState(() => {
    const saved = localStorage.getItem('mscy_bank_details');
    return saved ? JSON.parse(saved) : {
      holder: 'MOM SECRET CARE YOURSELF',
      bankName: 'State Bank of India',
      accountNumber: '394857204958',
      ifscCode: 'SBIN0001234',
      upiId: '9789552833@okbizaxis',
      qrCodeUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=300' // Editable QR URL
    };
  });

  // State elements for bank detail fields in the Admin dashboard editor
  const [bankHolderInput, setBankHolderInput] = useState(bankDetails.holder);
  const [bankNameInput, setBankNameInput] = useState(bankDetails.bankName);
  const [bankAccountInput, setBankAccountInput] = useState(bankDetails.accountNumber);
  const [bankIfscInput, setBankIfscInput] = useState(bankDetails.ifscCode);
  const [bankUpiInput, setBankUpiInput] = useState(bankDetails.upiId);
  const [bankQrUrlInput, setBankQrUrlInput] = useState(bankDetails.qrCodeUrl);

  // Dynamic Coupon Code Management
  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('mscy_coupons');
    return saved ? JSON.parse(saved) : [
      { id: 'c-1', code: 'NANI10', type: 'percent', value: 10, description: "10% Off Grandma's Blend" },
      { id: 'c-2', code: 'MOM50', type: 'flat', value: 50, description: "Flat ₹50 Off Mother's Care" }
    ];
  });
  
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState('percent');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // Applied Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState('');

  // Dynamic AI Art Blend Library (Saved generated Imagen sketches to delete one-by-one)
  const [customBlends, setCustomBlends] = useState(() => {
    const saved = localStorage.getItem('mscy_custom_blends');
    return saved ? JSON.parse(saved) : [
      { id: 'blend-1', prompt: "Golden Saffron Face Ubtan botanical design", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=250" }
    ];
  });

  // Gemini AI Sanctum States
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('mscy_gemini_key') || '';
  });
  const [showKeySetup, setShowKeySetup] = useState(false);
  
  // Nani's AI Consultation Chat History
  const [naniChat, setNaniChat] = useState(() => {
    const saved = localStorage.getItem('mscy_nani_chat');
    return saved ? JSON.parse(saved) : [
      { 
        role: 'model', 
        parts: [{ text: "Aashirwad beta! (Blessings, my dear!) ❤️ I am your digital Grandma (Nani). Tell me, are you suffering from skin dryness, dark spots, hair fall, or are you just looking for the golden glow secrets passed down by our ancestors? Ask me anything!" }] 
      }
    ];
  });
  const [naniInput, setNaniInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  // Nani's AI Text-To-Speech States
  const [ttsText, setTtsText] = useState("Aashirwad bacha! Always apply cold-pressed oil with rosemary to your hair roots before sleep.");
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Sulafat'); // Warm, motherly voice
  
  // Custom Saffron Blender (Imagen AI Label Art) States
  const [customPrompt, setCustomPrompt] = useState("Botanical watercolor of organic saffron strands and fresh sandalwood powder inside a rustic clay pot, golden glowing aura, traditional Indian art design, high detail");
  const [blendLoading, setBlendLoading] = useState(false);
  const [blendedImageUrl, setBlendedImageUrl] = useState('');

  // Core Store States
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('mscy_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('mscy_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('mscy_reviews');
    return saved ? JSON.parse(saved) : SEED_REVIEWS;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('mscy_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  
  // Social Sharing & Multi-Image Gallery states
  const [activeShareProduct, setActiveShareProduct] = useState(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  
  // Reviews Slider State
  const [reviewSliderIndex, setReviewSliderIndex] = useState(0);

  // Real-time "Flash Review" Notification Popups
  const [flashingReview, setFlashingReview] = useState(null);

  // Voice Recognition UI / Command Feedback State
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceFeedbackText, setVoiceFeedbackText] = useState('');

  // Feedback Notifications
  const [notification, setNotification] = useState(null);

  // Form input references
  const [checkoutDetails, setCheckoutDetails] = useState({
    name: 'Aravind Krishnan',
    phone: '9789552833',
    email: 'momsecretcareyourself@gmail.com',
    address: '14, West Chittirai Street, Near Meenakshi Amman Temple',
    city: 'Madurai',
    state: 'Tamil Nadu',
    district: 'Madurai',
    pincode: '625001',
    paymentMethod: 'upi',
    upiApp: 'gpay',
    screenshot: null
  });

  const handleAdminAddCategory = (e) => {
    e.preventDefault();
    const name = e.target.catname.value.trim();
    const desc = e.target.catdesc.value.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    if (categories.some(c => c.id === id)) {
      showToast("Category code already exists!", "error");
      return;
    }

    const updated = [...categories, { id, name, description: desc }];
    setCategories(updated);
    localStorage.setItem('mscy_categories', JSON.stringify(updated));
    showToast(`Category "${name}" registered successfully!`);
    e.target.reset();
  };

  const handleAdminDeleteCategory = (catId) => {
    if (catId === 'other') {
      showToast("Cannot delete the default 'Other Wellness' category!", "error");
      return;
    }
    if (confirm("Are you sure you want to delete this category? Products within this category will be automatically moved to 'Other Wellness'.")) {
      const updatedCategories = categories.filter(c => c.id !== catId);
      setCategories(updatedCategories);
      localStorage.setItem('mscy_categories', JSON.stringify(updatedCategories));

      // Move products in deleted category to 'other'
      const updatedProducts = products.map(p => {
        if (p.category === catId) {
          return { ...p, category: 'other' };
        }
        return p;
      });
      setProducts(updatedProducts);
      localStorage.setItem('mscy_products', JSON.stringify(updatedProducts));
      
      showToast("Category deleted. Products moved to 'Other Wellness'.");
    }
  };

  const handleAdminAddCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode.trim() || newCouponValue <= 0) {
      showToast("Invalid coupon details!", "error");
      return;
    }
    const code = newCouponCode.trim().toUpperCase();
    if (coupons.some(c => c.code === code)) {
      showToast("Coupon code already exists!", "error");
      return;
    }

    const newCoupon = {
      id: `coupon-${Date.now()}`,
      code,
      type: newCouponType,
      value: Number(newCouponValue),
      description: newCouponDesc.trim() || `${newCouponValue}% Off Coupon`
    };

    const updated = [...coupons, newCoupon];
    setCoupons(updated);
    localStorage.setItem('mscy_coupons', JSON.stringify(updated));
    showToast(`Coupon code "${code}" added successfully!`);
    
    // Clear coupon form fields
    setNewCouponCode('');
    setNewCouponValue(10);
    setNewCouponDesc('');
  };

  const handleAdminDeleteCoupon = (couponId) => {
    if (confirm("Delete this coupon? Customers will no longer be able to use it.")) {
      const updated = coupons.filter(c => c.id !== couponId);
      setCoupons(updated);
      localStorage.setItem('mscy_coupons', JSON.stringify(updated));
      showToast("Coupon deleted!");
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const queryCode = couponCodeInput.trim().toUpperCase();
    if (!queryCode) return;

    const matched = coupons.find(c => c.code === queryCode);
    if (matched) {
      setAppliedCoupon(matched);
      setCouponFeedback(`Coupon "${matched.code}" applied! (${matched.description})`);
      showToast("Coupon discount applied successfully!");
    } else {
      setAppliedCoupon(null);
      setCouponFeedback("Invalid coupon code. Please try another blessings keyword!");
      showToast("Invalid coupon!", "error");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponFeedback('');
    showToast("Coupon removed.");
  };

  const handleDeleteCustomBlend = (blendId) => {
    if (confirm("Are you sure you want to delete this custom blend artwork formula from your dynamic library?")) {
      const updated = customBlends.filter(b => b.id !== blendId);
      setCustomBlends(updated);
      localStorage.setItem('mscy_custom_blends', JSON.stringify(updated));
      showToast("AI Blend recipe deleted successfully.");
    }
  };

  const handleClearAddressFields = () => {
    setCheckoutDetails(prev => ({
      ...prev,
      address: '',
      city: '',
      district: '',
      pincode: '',
      state: 'Tamil Nadu'
    }));
    showToast("Address fields cleared!", "info");
  };

  // Inject Styles
  useEffect(() => {
    injectCustomStyles();
  }, []);

  // Periodic Flashing Review logic
  useEffect(() => {
    const interval = setInterval(() => {
      const approvedReviews = reviews.filter(r => r.status === 'approved');
      if (approvedReviews.length > 0) {
        const randomIndex = Math.floor(Math.random() * approvedReviews.length);
        const reviewToFlash = approvedReviews[randomIndex];
        const associatedProd = products.find(p => p.id === reviewToFlash.productId);
        
        setFlashingReview({
          ...reviewToFlash,
          productName: associatedProd ? associatedProd.name : "Ayurvedic Blend"
        });

        setTimeout(() => {
          setFlashingReview(null);
        }, 5500);
      }
    }, 18000);

    return () => clearInterval(interval);
  }, [reviews, products]);

  const saveToLocal = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Cart operations
  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        showToast(`Updated quantity of ${product.name} in your cart!`);
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      showToast(`${product.name} added to cart!`);
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast("Removed item from cart", 'info');
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const isWishlisted = prev.some(item => item.id === product.id);
      if (isWishlisted) {
        showToast("Removed from Wishlist");
        return prev.filter(item => item.id !== product.id);
      } else {
        showToast("Added to Wishlist!");
        return [...prev, product];
      }
    });
  };

  const handleStartVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Speech recognition is not supported in this browser version.", "error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; 
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsVoiceListening(true);
    setVoiceFeedbackText("Listening... Speak now!");

    recognition.start();

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      setVoiceFeedbackText(`Heard: "${command}"`);
      processVoiceCommand(command);
    };

    recognition.onerror = () => {
      setIsVoiceListening(false);
      setVoiceFeedbackText("Voice search failed. Please try again.");
    };

    recognition.onend = () => {
      setIsVoiceListening(false);
    };
  };

  const processVoiceCommand = (cmd) => {
    if (cmd.includes("soap") || cmd.includes("சோப்பு") || cmd.includes("soaps")) {
      setSelectedCategoryFilter('other');
      setCurrentPage('shop');
      speakFeedbackText("Showing handmade organic soaps");
      showToast("Filtering soaps...");
    } else if (cmd.includes("skincare") || cmd.includes("முக") || cmd.includes("skin")) {
      setSelectedCategoryFilter('skincare');
      setCurrentPage('shop');
      speakFeedbackText("Opening traditional skincare recipes");
      showToast("Displaying skincare...");
    } else if (cmd.includes("haircare") || cmd.includes("தலை") || cmd.includes("முடி") || cmd.includes("hair")) {
      setSelectedCategoryFilter('haircare');
      setCurrentPage('shop');
      speakFeedbackText("Showing slow-infused haircare oils");
      showToast("Displaying haircare...");
    } else if (cmd.includes("cart") || cmd.includes("கூடை") || cmd.includes("basket") || cmd.includes("open")) {
      setIsCartDrawerOpen(true);
      speakFeedbackText("Opening your basket list");
      showToast("Basket drawer opened.");
    } else if (cmd.includes("nani") || cmd.includes("grandma") || cmd.includes("ask") || cmd.includes("chat")) {
      setCurrentPage('ai-nani');
      speakFeedbackText("Opening wise grandmother sanctuary corner");
      showToast("Opening Nani's AI sanctuary!");
    } else {
      setVoiceFeedbackText(`Unrecognized: "${cmd}". Speak "Ask Nani" or "Show soaps".`);
    }
  };

  const speakFeedbackText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  // 1. Chat with Nani (Gemini-3-flash-preview)
  const sendChatMessageToNani = async (e) => {
    if (e) e.preventDefault();
    if (!naniInput.trim()) return;

    const userMessage = naniInput.trim();
    const updatedHistory = [...naniChat, { role: 'user', parts: [{ text: userMessage }] }];
    setNaniChat(updatedHistory);
    setNaniInput('');
    setChatLoading(true);

    const systemPrompt = `You are 'Nani' (Grandmother), a loving, warm, and highly knowledgeable Indian grandmother and traditional Ayurvedic expert. 
    You always speak with absolute affection, addressing the user as 'beta', 'bacha', 'my dear child', or 'dear'. 
    You recommend simple home remedies using traditional kitchen spices and plants (like turmeric, saffron, neem, honey, sandalwood, rosewater, coconut oil, rosemary).
    Keep your tone incredibly kind, wise, and slightly conversational. Emphasize natural, chemical-free living. Speak as if you are preparing warm masala chai for them.`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: updatedHistory,
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        setNaniChat(prev => [...prev, { role: 'model', parts: [{ text: generatedText }] }]);
      } else {
        throw new Error("No text response received");
      }
    } catch (err) {
      console.error(err);
      setNaniChat(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: "Arre beta, there was a tiny network obstacle in grandmother's magical pipeline. Make sure you set up your correct Gemini API Key! But don't worry, always put some pure aloe vera juice on your face for glowing skin, okay? ❤️" }] 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const loadInTTSAndPlay = (text) => {
    setTtsText(text);
    showToast("Loaded Grandmother's advice into narrator!", 'info');
  };

  // 2. Play Audio via Gemini 2.5 TTS (gemini-2.5-flash-preview-tts)
  const generateNarratorSpeech = async () => {
    if (!ttsText.trim()) return;
    setTtsLoading(true);
    setTtsAudioUrl('');

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${geminiApiKey}`;

    const payload = {
      contents: [{
        parts: [{ text: `Say with extreme grandmotherly warmth, love, and care: ${ttsText}` }]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice }
          }
        }
      },
      model: "gemini-2.5-flash-preview-tts"
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`TTS API failed: ${response.status}`);

      const result = await response.json();
      const part = result?.candidates?.[0]?.content?.parts?.[0];
      const audioData = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType;

      if (audioData && mimeType && mimeType.startsWith("audio/")) {
        const sampleRateMatch = mimeType.match(/rate=(\d+)/);
        const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;
        
        const pcmData = base64ToArrayBuffer(audioData);
        const pcm16 = new Int16Array(pcmData);
        const wavBlob = pcmToWav(pcm16, sampleRate);
        const audioUrl = URL.createObjectURL(wavBlob);
        
        setTtsAudioUrl(audioUrl);
        showToast("Speech generated successfully! Ready to play.");
        
        setTimeout(() => {
          const audio = new Audio(audioUrl);
          audio.play();
        }, 100);
      } else {
        throw new Error("WAV audio extraction failed from response");
      }
    } catch (err) {
      console.error(err);
      showToast("Check your Gemini API Key first bacha!", "error");
    } finally {
      setTtsLoading(false);
    }
  };

  // 3. Generate Blend Art Label via Imagen-4.0
  const generateCustomBlendLabel = async () => {
    if (!customPrompt.trim()) return;
    setBlendLoading(true);
    setBlendedImageUrl('');

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${geminiApiKey}`;

    const payload = {
      instances: { prompt: customPrompt },
      parameters: { sampleCount: 1 }
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Imagen prediction failed: ${response.status}`);

      const result = await response.json();
      const base64EncodedImage = result.predictions?.[0]?.bytesBase64Encoded;

      if (base64EncodedImage) {
        const imageSource = `data:image/png;base64,${base64EncodedImage}`;
        setBlendedImageUrl(imageSource);
        
        // Add automatically to the dynamic gallery
        const newBlend = {
          id: `blend-${Date.now()}`,
          prompt: customPrompt,
          image: imageSource
        };
        const nextBlends = [newBlend, ...customBlends];
        setCustomBlends(nextBlends);
        localStorage.setItem('mscy_custom_blends', JSON.stringify(nextBlends));

        showToast("Watercolor illustration created beautifully and saved!");
      } else {
        throw new Error("No illustration found in base64");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to sketch label art. Verify Gemini API key!", "error");
    } finally {
      setBlendLoading(false);
    }
  };

  const handleSaveApiKey = (key) => {
    setGeminiApiKey(key);
    localStorage.setItem('mscy_gemini_key', key);
    showToast("Gemini API key integrated successfully!", "success");
    setShowKeySetup(false);
  };

  const shippingCharge = useMemo(() => {
    if (checkoutDetails.state.trim().toLowerCase() === 'tamil nadu') {
      return 0;
    }
    return 40;
  }, [checkoutDetails.state]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  // Dynamic Coupon Calculations
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percent') {
      return Math.round((cartSubtotal * appliedCoupon.value) / 100);
    } else {
      return Math.min(appliedCoupon.value, cartSubtotal);
    }
  }, [appliedCoupon, cartSubtotal]);

  const cartGrandTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - couponDiscount + shippingCharge);
  }, [cartSubtotal, couponDiscount, shippingCharge]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategoryFilter !== 'all') {
      result = result.filter(p => p.category === selectedCategoryFilter);
    }
    if (searchQuery.trim() !== '') {
      const queryStr = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(queryStr) || 
        p.description.toLowerCase().includes(queryStr)
      );
    }
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'new') {
      result.sort((a, b) => (b.isNewArrival ? 1 : -1) - (a.isNewArrival ? 1 : -1));
    } else {
      result.sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [products, selectedCategoryFilter, searchQuery, sortBy]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const verifyAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === adminCreds.password) {
      setAdminUser(true);
      setShowAdminLogin(false);
      setCurrentPage('admin');
      showToast("Admin access granted! Welcome back.", 'success');
    } else {
      showToast("Incorrect Admin Password!", 'error');
    }
  };

  const handleUpdateAdminCredentials = (e) => {
    e.preventDefault();
    if (!newUsernameInput.trim() || !newPasswordInput.trim()) {
      showToast("Username or Password cannot be blank!", "error");
      return;
    }
    const updated = { username: newUsernameInput.trim(), password: newPasswordInput.trim() };
    setAdminCredentials(updated);
    localStorage.setItem('mscy_admin_creds', JSON.stringify(updated));
    showToast("Admin credentials updated successfully!");
  };

  const handleUpdateBankDetails = (e) => {
    e.preventDefault();
    const updatedDetails = {
      holder: bankHolderInput.trim(),
      bankName: bankNameInput.trim(),
      accountNumber: bankAccountInput.trim(),
      ifscCode: bankIfscInput.trim(),
      upiId: bankUpiInput.trim(),
      qrCodeUrl: bankQrUrlInput.trim()
    };
    setBankDetails(updatedDetails);
    localStorage.setItem('mscy_bank_details', JSON.stringify(updatedDetails));
    showToast("Bank Account credentials and QR code updated successfully!");
  };

  const handleAdminAddProduct = async (newProd) => {
    const updatedProducts = [newProd, ...products];
    setProducts(updatedProducts);
    saveToLocal('mscy_products', updatedProducts);
    showToast("Product published successfully!");
  };

  const handleAdminDeleteProduct = async (prodId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const updated = products.filter(p => p.id !== prodId);
      setProducts(updated);
      saveToLocal('mscy_products', updated);
      showToast("Product deleted!");
    }
  };

  const handleReviewAction = async (reviewId, action) => {
    const status = action === 'approve' ? 'approved' : 'rejected';
    const updated = reviews.map(rev => rev.id === reviewId ? { ...rev, status } : rev);
    setReviews(updated);
    saveToLocal('mscy_reviews', updated);
    showToast(`Review ${status}!`);
  };

  const handleOrderAction = async (orderId, newStatus) => {
    const updated = orders.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord);
    setOrders(updated);
    saveToLocal('mscy_orders', updated);
    showToast(`Order status updated to: ${newStatus}`);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast("Your cart is empty", "error");
      return;
    }
    if (!checkoutDetails.screenshot) {
      showToast("Please attach payment screenshot receipt!", "error");
      return;
    }
    
    const randomIdSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `MSCY-2026-${randomIdSuffix}`;
    
    const newOrder = {
      id: orderId,
      customerName: checkoutDetails.name,
      customerPhone: checkoutDetails.phone,
      customerEmail: checkoutDetails.email,
      shippingAddress: `${checkoutDetails.address}, ${checkoutDetails.city}, ${checkoutDetails.state} - ${checkoutDetails.pincode}`,
      state: checkoutDetails.state,
      district: checkoutDetails.district,
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      subtotal: cartSubtotal,
      couponApplied: appliedCoupon ? appliedCoupon.code : null,
      discountAmt: couponDiscount,
      shippingCharge,
      grandTotal: cartGrandTotal,
      paymentMethod: checkoutDetails.paymentMethod,
      screenshot: checkoutDetails.screenshot,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };

    const nextOrders = [newOrder, ...orders];
    setOrders(nextOrders);
    saveToLocal('mscy_orders', nextOrders);

    // Adjust product stocks
    const updatedProducts = products.map(p => {
      const match = cart.find(item => item.product.id === p.id);
      if (match) {
        return { ...p, stock: Math.max(0, p.stock - match.quantity) };
      }
      return p;
    });
    setProducts(updatedProducts);
    saveToLocal('mscy_products', updatedProducts);

    // Clear cart and dynamic coupon
    setCart([]);
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponFeedback('');
    
    showToast("Order placed successfully! Verified by WhatsApp and Email.", 'success');
    setCurrentPage('dashboard');
  };

  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewImage, setNewReviewImage] = useState(null);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) {
      showToast("Please type your feedback comment.", "error");
      return;
    }

    const reviewId = `rev-${Date.now()}`;
    const freshReview = {
      id: reviewId,
      productId: selectedProduct.id,
      userName: checkoutDetails.name || "Ayurvedic Lover",
      rating: newReviewRating,
      comment: newReviewText,
      status: 'pending', 
      date: new Date().toISOString().split('T')[0],
      image: newReviewImage
    };

    const updatedReviews = [freshReview, ...reviews];
    setReviews(updatedReviews);
    saveToLocal('mscy_reviews', updatedReviews);

    showToast("Review submitted! Waiting for Admin verification.", "success");
    setNewReviewText('');
    setNewReviewRating(5);
    setNewReviewImage(null);
  };

  const approvedReviews = useMemo(() => reviews.filter(r => r.status === 'approved'), [reviews]);
  
  const handlePrevReview = () => {
    setReviewSliderIndex(prev => (prev === 0 ? approvedReviews.length - 1 : prev - 1));
  };

  const handleNextReview = () => {
    setReviewSliderIndex(prev => (prev === approvedReviews.length - 1 ? 0 : prev + 1));
  };

  const handleOpenShareModal = (e, product) => {
    e.stopPropagation();
    setActiveShareProduct(product);
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50 font-sans-premium text-stone-800 selection:bg-amber-100 mandala-bg">
      
      {/* Dynamic Toast Alerts */}
      {notification && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl transition-all duration-300 border ${
          notification.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
          notification.type === 'info' ? 'bg-blue-50 text-blue-800 border-blue-200' :
          'bg-stone-900 text-amber-100 border-amber-900/40'
        }`}>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold text-sm">{notification.message}</span>
        </div>
      )}

      {/* Flashing Verified Customer Testimonial Widget */}
      {flashingReview && (
        <div className="fixed bottom-24 left-4 z-50 w-80 h-36 bg-white/95 border border-amber-900/20 p-4 rounded-2xl shadow-xl flex gap-3 animate-bounce overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-amber-600/20 text-rose-950 font-bold flex items-center justify-center shrink-0 text-xs">
            {flashingReview.userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-[11px] leading-relaxed flex flex-col justify-between h-full w-full">
            <div>
              <span className="font-bold text-rose-950 block">{flashingReview.userName} reviewed:</span>
              <span className="text-stone-500 font-semibold line-clamp-1">{flashingReview.productName}</span>
              <p className="italic text-stone-700 line-clamp-2 mt-0.5">"{flashingReview.comment}"</p>
            </div>
            <div className="flex text-amber-500 gap-0.5 mt-1 pb-1">
              {[...Array(flashingReview.rating)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
            </div>
          </div>
        </div>
      )}

      {/* Header bar */}
      <header className="sticky top-0 z-40 bg-rose-950/95 backdrop-blur-md border-b border-amber-800/30 text-amber-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center shadow-lg border border-amber-200/50">
                <span className="font-traditional text-xl font-bold text-stone-950">M</span>
              </div>
              <div>
                <h1 className="font-traditional text-lg sm:text-xl font-bold tracking-wider text-amber-300">Mom Secret</h1>
                <p className="text-xs font-light text-amber-100/80 uppercase tracking-widest leading-none">Care Yourself</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
              <button onClick={() => setCurrentPage('home')} className={`hover:text-amber-300 transition ${currentPage === 'home' ? 'text-amber-300 border-b-2 border-amber-300' : ''}`}>Home</button>
              <button onClick={() => { setSelectedCategoryFilter('all'); setCurrentPage('shop'); }} className={`hover:text-amber-300 transition ${currentPage === 'shop' ? 'text-amber-300 border-b-2 border-amber-300' : ''}`}>Shop</button>
              <button onClick={() => setCurrentPage('ai-nani')} className={`hover:text-amber-300 transition flex items-center gap-1.5 ${currentPage === 'ai-nani' ? 'text-amber-300 border-b-2 border-amber-300' : ''}`}>
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Ask Nani AI
              </button>
              <button onClick={() => setCurrentPage('dashboard')} className={`hover:text-amber-300 transition ${currentPage === 'dashboard' ? 'text-amber-300 border-b-2 border-amber-300' : ''}`}>Dashboard</button>
              {adminUser && (
                <button onClick={() => setCurrentPage('admin')} className="text-amber-300 font-bold border border-amber-300/40 px-3 py-1 rounded hover:bg-amber-950 transition">Admin Panel</button>
              )}
            </nav>

            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentPage('shop')} className="hover:text-amber-300 transition p-1">
                <Search className="w-5 h-5" />
              </button>
              
              <button onClick={() => { setCurrentPage('dashboard'); showToast("Switched to Dashboard - Wishlist View", 'info'); }} className="hover:text-amber-300 transition relative p-1">
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 text-xxs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button onClick={() => setIsCartDrawerOpen(true)} className="hover:text-amber-300 transition relative p-1">
                <ShoppingBag className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 text-xxs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                )}
              </button>

              <button 
                onClick={() => adminUser ? setCurrentPage('admin') : setShowAdminLogin(true)} 
                className="hover:text-amber-300 transition border border-amber-500/20 p-2 rounded-full"
                title="Admin Login"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Setup API Key Modal */}
      {showKeySetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-amber-50 max-w-md w-full rounded-2xl shadow-2xl p-6 border border-amber-900/40">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-traditional text-lg font-bold text-rose-950 flex items-center gap-2">
                <Brain className="w-5 h-5 text-amber-600" /> Integrate Gemini API Key
              </h3>
              <button onClick={() => setShowKeySetup(false)} className="text-stone-400 hover:text-stone-800"><X className="w-6 h-6" /></button>
            </div>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              We leverage the native <strong>gemini-3-flash-preview</strong>, <strong>gemini-2.5-flash-preview-tts</strong>, and <strong>imagen-4.0-generate-001</strong> models to give you real-time consultation and wellness imagery. Paste your personal Gemini API key below:
            </p>
            <div className="space-y-4">
              <input 
                type="password" 
                defaultValue={geminiApiKey}
                id="gemini-key-field"
                placeholder="AIzaSy..." 
                className="w-full bg-white border border-stone-300 px-4 py-3 rounded-lg text-sm focus:ring-1 focus:ring-amber-500 font-mono"
              />
              <div className="flex gap-2 text-xs">
                <button 
                  onClick={() => setShowKeySetup(false)} 
                  className="w-1/2 border border-stone-300 py-2.5 rounded-lg text-stone-700 font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleSaveApiKey(document.getElementById('gemini-key-field').value)} 
                  className="w-1/2 bg-rose-900 text-amber-50 py-2.5 rounded-lg font-bold hover:bg-rose-950 transition"
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Passkey Verification Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-amber-50 max-w-sm w-full rounded-2xl shadow-2xl p-6 border border-amber-800/40">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-traditional text-lg font-bold text-rose-950">Authorized Access Only</h3>
              <button onClick={() => setShowAdminLogin(false)} className="text-stone-400 hover:text-stone-800"><X className="w-6 h-6" /></button>
            </div>
            <p className="text-xs text-stone-600 mb-4 font-sans-premium">Please enter your password below to proceed. <strong className="block text-[10px] text-amber-800 mt-1 font-mono">Hint: mscyadmin2026</strong></p>
            <form onSubmit={verifyAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">Passkey</label>
                <input 
                  type="password" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-stone-100 border border-stone-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
                />
              </div>
              <button type="submit" className="w-full bg-rose-900 text-amber-50 py-3 rounded-lg font-semibold hover:bg-rose-950 transition text-sm">Verify Passkey</button>
            </form>
          </div>
        </div>
      )}

      {/* Product Share Drawer */}
      {activeShareProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-amber-50 max-w-md w-full rounded-2xl shadow-2xl p-6 border border-amber-900/10 text-stone-800">
            <div className="flex justify-between items-center pb-3 border-b border-amber-900/10">
              <h3 className="font-traditional text-sm font-bold text-rose-950">Share Traditional Recipe</h3>
              <button onClick={() => setActiveShareProduct(null)} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="py-4 space-y-4 text-xs">
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border">
                <img src={activeShareProduct.images ? activeShareProduct.images[0] : activeShareProduct.images} className="w-12 h-12 object-cover rounded-lg" />
                <div>
                  <h4 className="font-bold text-stone-900 leading-tight">{activeShareProduct.name}</h4>
                  <span className="text-rose-900 font-extrabold mt-1 block">₹{activeShareProduct.price}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xxs font-bold uppercase tracking-wider">
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out this beauty secret: *${activeShareProduct.name}* at only ₹${activeShareProduct.price}! Visit: ` + window.location.href)}`} 
                  target="_blank" rel="noreferrer"
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 p-3 rounded-xl border flex flex-col items-center gap-1.5"
                >
                  <Share2 className="w-5 h-5 text-emerald-600" /> WhatsApp
                </a>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/product/${activeShareProduct.id}`);
                    showToast("Product link copied to clipboard!");
                    setActiveShareProduct(null);
                  }}
                  className="bg-stone-50 hover:bg-stone-100 text-stone-800 p-3 rounded-xl border flex flex-col items-center gap-1.5"
                >
                  <Copy className="w-5 h-5 text-stone-600" /> Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pages Router mapping */}
      <main className="flex-grow">
        
        {/* ================= HOME VIEW ================= */}
        {currentPage === 'home' && (
          <div className="space-y-16 pb-20">
            
            {/* Elegant Hero Banner */}
            <section className="text-white py-24 px-4 text-center sm:text-left relative overflow-hidden bg-rose-950">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-300/30 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase inline-block">100% Traditional Standards</span>
                  <h1 className="font-traditional text-4xl sm:text-5xl font-extrabold tracking-wide text-amber-100 leading-tight">Mother's Care.<br/><span className="text-amber-400 font-traditional">Grandma's Secrets.</span></h1>
                  <p className="mt-6 text-base sm:text-lg text-amber-100/80 leading-relaxed font-light">
                    Passed down through generations, lovingly crafted with pure ayurvedic herbs, rare botanical extracts, and grandmotherly care.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <div className="p-3 bg-black/30 border border-amber-500/20 rounded-xl max-w-sm inline-block">
                      <span className="text-xxs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" /> No COD • Secure Prepaid Checkout
                      </span>
                    </div>

                    <div className="p-3 bg-rose-900/50 border border-amber-300/30 rounded-xl max-w-sm inline-block cursor-pointer" onClick={() => setCurrentPage('ai-nani')}>
                      <span className="text-xxs font-bold text-amber-200 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Ask Grandma's AI Consultant
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center sm:justify-start">
                    <button onClick={() => { setSelectedCategoryFilter('all'); setCurrentPage('shop'); }} className="bg-amber-500 text-stone-950 px-8 py-4 rounded-full font-bold text-sm tracking-wider uppercase hover:bg-amber-400 transition shadow-lg">Explore Shop</button>
                    <button onClick={() => setCurrentPage('ai-nani')} className="bg-rose-900 text-amber-50 px-6 py-4 rounded-full font-bold text-sm tracking-wider uppercase border border-amber-500/30 hover:bg-rose-850 transition">Ask AI Nani</button>
                  </div>
                </div>
                
                {/* Traditional motif Ayurvedic Batch Prep Container (RESIZED & POPUP OPTIMIZED) */}
                <div className="border border-amber-500/20 p-5 rounded-2xl bg-black/20 text-center py-5 space-y-2 relative max-w-xs mx-auto shadow-xl">
                  <PotMortarCartoonSVG />
                  <h3 className="font-traditional text-xs text-amber-300 font-bold">Ayurvedic Small Batch Prep</h3>
                  <p className="text-[10px] text-amber-100/70 max-w-[190px] mx-auto font-light leading-relaxed">No laboratory toxins. Just raw mountain herbs, cold-pressed oils, native blossoms, and deep, devotional family care.</p>
                </div>
              </div>
            </section>

            {/* Quick Benefits metrics */}
            <section className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { title: "Prepaid Delivery Protection", desc: "No COD. Safe shipping", i: "🛡️" },
                { title: "Tamil Nadu Free Ship", desc: "Shipping rate is ₹0", i: "📦" },
                { title: "Traditional Handcrafted", desc: "By generational mothers", i: "🏺" },
                { title: "Strictly Botanical", desc: "Chemical-free recipe", i: "🌿" }
              ].map((b, idx) => (
                <div key={idx} className="p-5 border rounded-2xl flex flex-col items-center text-center shadow-sm bg-white border-amber-900/10">
                  <span className="text-3xl mb-2">{b.i}</span>
                  <h4 className="font-traditional text-xs font-bold text-rose-950 mb-1">{b.title}</h4>
                  <p className="text-[10px] text-stone-500">{b.desc}</p>
                </div>
              ))}
            </section>

            {/* AI Callout Interactive Section */}
            <section className="max-w-5xl mx-auto px-4">
              <div className="bg-gradient-to-r from-rose-950 to-rose-900 rounded-3xl p-8 sm:p-12 text-amber-50 border border-amber-400/20 relative overflow-hidden shadow-2xl">
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-2xl space-y-4">
                  <span className="bg-amber-500 text-stone-950 font-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-full inline-block">NATIVE GEMINI AI ADDITION</span>
                  <h2 className="font-traditional text-2xl sm:text-3xl font-bold tracking-wide">Enter Grandmother's AI Sanctuary</h2>
                  <p className="text-xs text-amber-100/80 leading-relaxed font-light">
                    Have a skin or hair query? Chat with <strong>AI Nani</strong>, our traditional chatbot. Get remedies spoken aloud with warm motherly TTS, or formulate your botanical recipe with raw watercolor label artwork instantly.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setCurrentPage('ai-nani')} className="bg-amber-400 text-stone-950 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition shadow">
                      Start AI Consultation
                    </button>
                    <button onClick={() => { setShowKeySetup(true); }} className="border border-amber-300/40 text-amber-300 px-6 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider hover:bg-white/10 transition">
                      Configure Key
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Premium design traditional box popup decoration */}
            <section className="max-w-md mx-auto px-4">
              <div className="bg-white border-2 border-amber-900/25 p-6 rounded-2xl text-center shadow-lg space-y-3">
                <MotherDaughterLoveCartoonSVG />
                <h3 className="font-traditional text-sm font-bold text-rose-950">Grandma's Love to Her Daughter</h3>
                <p className="text-xs text-stone-600 font-light leading-relaxed">Passing down sacred traditional recipes. From mother's hands directly into your home cosmetics basket. Pure botanical care, preserved beautifully.</p>
              </div>
            </section>

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-4 text-center">
              <h2 className="font-traditional text-2xl font-bold mb-2 text-rose-950">Heritage Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
                {categories.map(c => (
                  <div key={c.id} onClick={() => { setSelectedCategoryFilter(c.id); setCurrentPage('shop'); }} className="p-5 rounded-2xl border cursor-pointer hover:scale-105 transition duration-300 text-center shadow-xs bg-white border-amber-900/10">
                    <span className="text-3xl block mb-2">{c.id==='skincare'?'✨':c.id==='haircare'?'🌿':c.id==='stationery'?'📝':c.id==='jewelry'?'📿':'🧼'}</span>
                    <h4 className="font-traditional text-xs font-bold text-rose-950">{c.name}</h4>
                  </div>
                ))}
              </div>
            </section>

            {/* Bestseller list */}
            <section className="max-w-7xl mx-auto px-4">
              <h2 className="font-traditional text-2xl font-bold text-center mb-8 text-rose-950">Grandma's Beloved Bestsellers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {products.slice(0, 3).map(p => (
                  <div key={p.id} className="border rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition bg-white border-amber-900/10">
                    <div onClick={() => { setSelectedProductId(p.id); setCurrentPage('product-detail'); }} className="cursor-pointer space-y-3">
                      <div className="relative overflow-hidden rounded-xl">
                        <img src={p.images ? p.images[0] : p.image} className="w-full h-48 object-cover hover:scale-105 transition" />
                        <span className="absolute top-2 left-2 bg-rose-950 text-amber-300 text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-amber-500/20">PREPAID</span>
                        
                        <button 
                          onClick={(e) => handleOpenShareModal(e, p)}
                          className="absolute top-2 right-2 bg-amber-50/90 hover:bg-amber-100 p-2 rounded-full text-rose-950 hover:scale-110 transition"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="font-traditional text-sm font-bold text-rose-950 line-clamp-1">{p.name}</h4>
                      <p className="text-xxs text-stone-500 line-clamp-2 leading-relaxed font-light">{p.description}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-amber-900/5">
                      <span className="font-traditional text-sm font-bold">₹{p.price}</span>
                      <div className="flex gap-2">
                        <button onClick={() => toggleWishlist(p)} className="p-1.5 border rounded-lg text-rose-950 hover:bg-rose-50 transition border-amber-900/10">
                          <Heart className={`w-4 h-4 ${wishlist.some(w => w.id === p.id) ? 'fill-rose-900 text-rose-900' : ''}`} />
                        </button>
                        <button onClick={() => addToCart(p)} className="bg-rose-900 text-amber-100 text-xxs font-bold uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-rose-950 transition">Add To Basket</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Customer Reviews Carousel */}
            {approvedReviews.length > 0 && (
              <section className="bg-amber-100/30 border-y border-amber-900/10 py-16">
                <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
                  <div className="text-center">
                    <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block">Verified Customer Testimonials</span>
                    <h2 className="font-traditional text-2xl font-bold mt-1 text-rose-950 font-traditional">Motherly Endorsements</h2>
                    <div className="h-0.5 w-16 bg-amber-500 mx-auto mt-2"></div>
                  </div>

                  <div className="bg-white border border-amber-900/10 p-8 sm:p-10 rounded-2xl shadow-md min-h-[160px] flex flex-col justify-center relative transition-all duration-300">
                    <div className="flex justify-center text-amber-500 mb-3">
                      {[...Array(approvedReviews[reviewSliderIndex].rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-stone-700 italic leading-relaxed text-sm">
                      "{approvedReviews[reviewSliderIndex].comment}"
                    </p>
                    <div className="mt-4 font-bold text-stone-500 text-xs flex justify-between items-center border-t border-amber-900/5 pt-3">
                      <span>— {approvedReviews[reviewSliderIndex].userName}</span>
                      <span>{approvedReviews[reviewSliderIndex].date}</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 pt-2">
                    <button onClick={handlePrevReview} className="p-3 rounded-full bg-rose-950 text-amber-100 hover:bg-rose-900 transition-colors shadow">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={handleNextReview} className="p-3 rounded-full bg-rose-950 text-amber-100 hover:bg-rose-900 transition-colors shadow">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </section>
            )}

          </div>
        )}

        {/* ================= SHOP VIEW ================= */}
        {currentPage === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row gap-8">
              
              {/* Sidebar Filters */}
              <div className="w-full md:w-56 shrink-0 space-y-6">
                <div className="border p-5 rounded-2xl space-y-6 bg-white border-amber-900/10 shadow-sm">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-rose-950 mb-3">Categories</h4>
                    <div className="space-y-1 text-xs">
                      <button onClick={() => setSelectedCategoryFilter('all')} className={`block w-full text-left py-1.5 px-2 rounded hover:text-amber-800 ${selectedCategoryFilter==='all'?'bg-amber-100 font-bold text-stone-900':''}`}>All Products</button>
                      {categories.map(c => (
                        <button key={c.id} onClick={() => setSelectedCategoryFilter(c.id)} className={`block w-full text-left py-1.5 px-2 rounded hover:text-amber-800 ${selectedCategoryFilter===c.id?'bg-amber-100 font-bold text-stone-900':''}`}>{c.name}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-rose-950 mb-3">Sort Collection</h4>
                    <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="w-full bg-white border p-2.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500">
                      <option value="popular">Best Sellers</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="new">New Arrivals</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="flex-grow space-y-6">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search ubtans, organic soaps, hair oils..." 
                    value={searchQuery}
                    onChange={(e)=>setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-amber-900/10 p-3 rounded-xl pl-10 text-xs focus:outline-none"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="border p-4 rounded-xl flex flex-col justify-between shadow-xs bg-white border-amber-900/10">
                      <div onClick={() => { setSelectedProductId(p.id); setCurrentPage('product-detail'); setCurrentGalleryIndex(0); }} className="cursor-pointer space-y-2 relative">
                        <img src={p.images ? p.images[0] : p.image} className="w-full h-40 object-cover rounded-lg" />
                        <h4 className="font-traditional text-xs font-bold text-rose-950 leading-tight">{p.name}</h4>
                        
                        <button 
                          onClick={(e) => handleOpenShareModal(e, p)}
                          className="absolute top-2 right-2 bg-amber-50/90 hover:bg-amber-100 p-2 rounded-full text-rose-950 hover:scale-110 transition shadow-sm"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-amber-900/5">
                        <span className="font-traditional text-xs font-bold">₹{p.price}</span>
                        <div className="flex gap-2">
                          <button onClick={() => toggleWishlist(p)} className="p-1 border rounded text-rose-950 hover:bg-rose-50 border-amber-900/10">
                            <Heart className={`w-3.5 h-3.5 ${wishlist.some(w => w.id === p.id)?'fill-rose-900 text-rose-900':''}`} />
                          </button>
                          <button onClick={() => addToCart(p)} className="bg-rose-900 text-amber-100 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded">Add</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= ASK NANI AI SANCTUARY ================= */}
        {currentPage === 'ai-nani' && (
          <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-amber-900/15 pb-6">
              <div>
                <span className="text-xxs uppercase tracking-widest text-amber-700 font-bold flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Ancestral Beauty AI Lab
                </span>
                <h1 className="font-traditional text-3xl font-bold text-rose-950">Nani's Ayurvedic AI Corner</h1>
                <p className="text-xs text-stone-600 mt-1">Chat directly with our wise grandmother chatbot, hear advice spoken aloud, or sketch bespoke formulation wallpaper labels.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowKeySetup(true)}
                  className="bg-stone-900 text-amber-100 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-stone-850 transition flex items-center gap-1.5"
                >
                  <Settings className="w-4 h-4" /> Config API Key
                </button>
                {geminiApiKey && (
                  <span className="text-emerald-800 text-xxs font-bold bg-emerald-100 px-3 py-2.5 rounded-xl border border-emerald-200">
                    ✓ Connected
                  </span>
                )}
              </div>
            </div>

            {/* Main AI Sanctuary Tabs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Chat Panel */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Wisdom Chat Box */}
                <div className="bg-white border border-amber-900/15 rounded-3xl overflow-hidden shadow-md flex flex-col h-[500px]">
                  
                  <div className="bg-rose-950 text-amber-50 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-600 text-stone-950 font-bold font-traditional text-sm flex items-center justify-center">N</div>
                      <div>
                        <strong className="text-sm block text-amber-300 font-traditional">Consult AI Nani</strong>
                        <span className="text-[10px] text-amber-100/70">Ayurvedic Household Remedies Specialist</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (confirm("Reset grandmother's memory?")) {
                          setNaniChat([{ role: 'model', parts: [{ text: "Aashirwad beta! ❤️ Ask me your wellness queries." }] }]);
                        }
                      }}
                      className="text-amber-100/60 hover:text-amber-200 text-xxs flex items-center gap-1"
                      title="Clear chat"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Clear Chat
                    </button>
                  </div>

                  {!geminiApiKey && (
                    <div className="bg-amber-100 border-b border-amber-200 p-3 text-center text-xs text-amber-900 flex items-center justify-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-700" />
                      <span>Arre beta! Set up your free <strong>Gemini API Key</strong> in the header/top-right to unlock live responses.</span>
                      <button onClick={() => setShowKeySetup(true)} className="underline font-bold text-amber-950">Setup Now</button>
                    </div>
                  )}

                  {/* Message Streams */}
                  <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-amber-50/20">
                    {naniChat.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs border ${
                          msg.role === 'user' 
                            ? 'bg-rose-900 text-amber-50 border-rose-950' 
                            : 'bg-white text-stone-800 border-amber-900/10'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
                          
                          {msg.role === 'model' && (
                            <div className="mt-3 pt-2 border-t border-amber-900/5 flex justify-end gap-2 text-[10px] text-stone-500">
                              <button 
                                onClick={() => loadInTTSAndPlay(msg.parts[0].text)}
                                className="flex items-center gap-1 text-rose-900 font-bold hover:underline"
                              >
                                <Volume2 className="w-3.5 h-3.5" /> Listen to This Advice
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-stone-100 border border-stone-200 rounded-2xl p-4 text-xs text-stone-500 animate-pulse flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce delay-100" />
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce delay-200" />
                          <span>Grandmother is reciting ancient recipes...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={sendChatMessageToNani} className="p-4 border-t border-amber-900/15 bg-stone-50 flex gap-2">
                    <input 
                      type="text"
                      value={naniInput}
                      onChange={(e) => setNaniInput(e.target.value)}
                      placeholder="Ask Nani: 'I have severe hair fall, what should I use?' or 'Recommend an Ubtan'..."
                      className="flex-grow bg-white border border-stone-300 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button 
                      type="submit" 
                      disabled={chatLoading}
                      className="bg-rose-900 hover:bg-rose-950 text-amber-50 px-5 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" /> Send
                    </button>
                  </form>

                </div>

                {/* Dynamic Blends/Saved AI artwork list - One by One Delete */}
                <div className="bg-amber-100/30 border border-amber-900/10 p-6 rounded-3xl space-y-4">
                  <h3 className="font-traditional text-sm font-bold text-rose-950 flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-amber-600" /> Saved Formulation Sketchbook
                  </h3>
                  <p className="text-[11px] text-stone-600">These are your generated custom recipe label designs. Delete them one-by-one as needed:</p>
                  
                  {customBlends.length === 0 ? (
                    <p className="text-xxs text-stone-400 italic">No custom illustrations saved yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {customBlends.map((blend) => (
                        <div key={blend.id} className="bg-white border p-3 rounded-xl flex flex-col justify-between shadow-xs">
                          <img src={blend.image} className="w-full h-24 object-cover rounded-lg mb-2" />
                          <div className="text-[10px]">
                            <strong className="block text-stone-900 font-bold line-clamp-1 mb-1">{blend.prompt}</strong>
                            <button 
                              onClick={() => handleDeleteCustomBlend(blend.id)}
                              className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-1 rounded text-xxs font-bold flex items-center justify-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete Sketch
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Sidebar AI Elements */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 2. Speak to Nani Narrator Segment */}
                <div className="bg-amber-100/50 border border-amber-900/15 p-6 rounded-3xl space-y-4 shadow-xs">
                  <h3 className="font-traditional text-base font-bold text-rose-950 flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-amber-600" /> Traditional TTS Reader
                  </h3>
                  <p className="text-xxs text-stone-600 leading-relaxed">Type any household remedy or recipe tips below and let the Gemini audio processor generate a motherly voice narrator file.</p>
                  
                  <div className="space-y-3">
                    <textarea 
                      value={ttsText}
                      onChange={(e) => setTtsText(e.target.value)}
                      rows="3"
                      className="w-full bg-white border border-stone-300 p-3 rounded-xl text-xs text-stone-800"
                      placeholder="Aashirwad bacha! Apply Sandalwood oil for glowing skin..."
                    />

                    <div>
                      <label className="block text-[9px] font-bold text-stone-500 uppercase mb-1">Grandmother Voice Accents</label>
                      <select 
                        value={selectedVoice} 
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="w-full bg-white border border-stone-300 p-2 rounded-lg text-xs"
                      >
                        <option value="Sulafat">Sulafat (Warm & Caring Voice)</option>
                        <option value="Despina">Despina (Smooth Voice)</option>
                        <option value="Erinome">Erinome (Clear Voice)</option>
                      </select>
                    </div>

                    <button 
                      onClick={generateNarratorSpeech}
                      disabled={ttsLoading || !ttsText.trim()}
                      className="w-full bg-rose-900 hover:bg-rose-950 text-amber-50 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow"
                    >
                      {ttsLoading ? "Reciting ancient text..." : "Play Narration Audio"}
                    </button>

                    {ttsAudioUrl && (
                      <div className="pt-2 border-t text-center">
                        <audio controls src={ttsAudioUrl} className="mx-auto w-full max-w-xs" />
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Personalized Imagen Formulation label designer */}
                <div className="bg-amber-100/50 border border-amber-900/15 p-6 rounded-3xl space-y-4 shadow-xs">
                  <h3 className="font-traditional text-base font-bold text-rose-950 flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-amber-600" /> Sacred Formulation Sketcher
                  </h3>
                  <p className="text-xxs text-stone-600 leading-relaxed">Describe your unique Ayurvedic elements and let the **Imagen-4.0** model draft a high-detail botanical visual packaging design label.</p>
                  
                  <div className="space-y-3">
                    <textarea 
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      rows="3"
                      className="w-full bg-white border border-stone-300 p-3 rounded-xl text-xs text-stone-850"
                      placeholder="e.g. Saffron strands, organic sandalwood powder inside a bronze bowl..."
                    />

                    <button 
                      onClick={generateCustomBlendLabel}
                      disabled={blendLoading || !customPrompt.trim()}
                      className="w-full bg-stone-900 hover:bg-stone-850 text-amber-100 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow"
                    >
                      {blendLoading ? "Sketching Watercolor Label..." : "Sketch Label Art"}
                    </button>

                    {blendedImageUrl && (
                      <div className="border border-amber-900/10 rounded-2xl overflow-hidden shadow-md">
                        <img src={blendedImageUrl} alt="Generated Label Art" className="w-full h-auto object-cover" />
                        <span className="block p-2 text-center text-[10px] text-stone-500 bg-white">✓ High-detail packaging label art.</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ================= PRODUCT DETAIL VIEW ================= */}
        {currentPage === 'product-detail' && selectedProduct && (
          <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
            <button onClick={() => setCurrentPage('shop')} className="text-xxs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1"><ArrowLeft className="w-4 h-4"/> Back To Shop</button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
              
              <div className="space-y-4">
                <div className="aspect-square bg-stone-100 border border-amber-900/10 rounded-2xl overflow-hidden shadow-sm relative">
                  <img 
                    src={selectedProduct.images ? selectedProduct.images[currentGalleryIndex] : selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover transition-all duration-300" 
                  />

                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setCurrentGalleryIndex(prev => (prev === 0 ? selectedProduct.images.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full text-stone-800 shadow"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setCurrentGalleryIndex(prev => (prev === selectedProduct.images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full text-stone-800 shadow"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {selectedProduct.images.map((img, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentGalleryIndex(idx)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${currentGalleryIndex === idx ? 'border-amber-600 shadow-sm' : 'border-stone-200'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 text-xs">
                <span className="bg-amber-100 text-stone-800 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">{selectedProduct.category}</span>
                <h1 className="font-traditional text-2xl font-bold text-rose-950 leading-tight">{selectedProduct.name}</h1>
                
                <p className="text-stone-600 leading-relaxed font-light">{selectedProduct.description}</p>
                
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-900/5">
                  <span className="block font-bold mb-1.5 uppercase tracking-wider text-rose-900">Specifications</span>
                  <p className="text-stone-500 leading-relaxed">{selectedProduct.specifications}</p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-amber-900/5">
                  <span className="font-traditional text-xl font-bold">₹{selectedProduct.price}</span>
                  <button onClick={() => addToCart(selectedProduct)} className="bg-rose-900 text-amber-50 px-6 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-rose-950 transition">Add to Basket</button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= CHECKOUT PAGE ================= */}
        {currentPage === 'checkout' && (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="font-traditional text-xl font-bold text-rose-950 mb-6">Prepaid Delivery Checkout</h1>
            
            <div className="grid grid-cols-1 gap-6">
              
              <form onSubmit={handlePlaceOrder} className="space-y-6 bg-amber-50/50 p-6 rounded-2xl border border-amber-900/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold mb-1 uppercase text-stone-600">Full Name</label>
                    <input type="text" required value={checkoutDetails.name} onChange={(e)=>setCheckoutDetails({...checkoutDetails, name: e.target.value})} className="w-full bg-white border p-3 rounded-lg" />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 uppercase text-stone-600">Phone</label>
                    <input type="tel" required value={checkoutDetails.phone} onChange={(e)=>setCheckoutDetails({...checkoutDetails, phone: e.target.value})} className="w-full bg-white border p-3 rounded-lg" />
                  </div>
                </div>

                <div className="text-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block font-bold uppercase text-stone-600">Address Details</label>
                    <button 
                      type="button" 
                      onClick={handleClearAddressFields}
                      className="text-xxs text-red-700 hover:text-red-900 font-bold uppercase tracking-wider flex items-center gap-1 border border-red-200 bg-red-50/50 px-2 py-1 rounded"
                    >
                      Clear Address
                    </button>
                  </div>
                  
                  <input 
                    type="text" 
                    required 
                    value={checkoutDetails.address} 
                    onChange={(e)=>setCheckoutDetails({...checkoutDetails, address: e.target.value})} 
                    className="w-full bg-white border p-3 rounded-lg" 
                    placeholder="Door No, Street Name..." 
                  />
                  
                  <div className="grid grid-cols-3 gap-3">
                    <input type="text" required placeholder="City" value={checkoutDetails.city} onChange={(e)=>setCheckoutDetails({...checkoutDetails, city: e.target.value})} className="w-full bg-white border p-3 rounded-lg" />
                    <input type="text" required placeholder="District" value={checkoutDetails.district} onChange={(e)=>setCheckoutDetails({...checkoutDetails, district: e.target.value})} className="w-full bg-white border p-3 rounded-lg" />
                    <input type="text" required placeholder="Pincode" maxLength="6" value={checkoutDetails.pincode} onChange={(e)=>setCheckoutDetails({...checkoutDetails, pincode: e.target.value})} className="w-full bg-white border p-3 rounded-lg" />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-bold mb-1 uppercase text-stone-600">State Selection</label>
                  <select value={checkoutDetails.state} onChange={(e)=>setCheckoutDetails({...checkoutDetails, state: e.target.value})} className="w-full bg-white border p-3 rounded-lg font-medium">
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <div className="mt-3 p-3 bg-white border rounded-xl flex items-center gap-2">
                    <Truck className="text-rose-950" />
                    <p className="text-xxs text-stone-600">
                      {checkoutDetails.state === 'Tamil Nadu' ? (
                        <strong className="text-emerald-800 font-bold">🎉 FREE Delivery Available inside Tamil Nadu! (Shipping: ₹0)</strong>
                      ) : (
                        <strong className="text-rose-900">Courier Charge of ₹40 added automatically.</strong>
                      )}
                    </p>
                  </div>
                </div>

                {/* dynamic Coupon Code Apply Area */}
                <div className="bg-amber-100/40 p-4 rounded-xl border text-xs space-y-2">
                  <label className="block font-bold text-rose-950 uppercase">Apply Blessings Coupon</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. NANI10 or MOM50" 
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className="flex-grow bg-white border p-2.5 rounded-lg font-mono uppercase focus:outline-none" 
                    />
                    {appliedCoupon ? (
                      <button 
                        type="button" 
                        onClick={handleRemoveCoupon}
                        className="bg-red-700 text-white px-4 rounded-lg font-bold"
                      >
                        Remove
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={handleApplyCoupon}
                        className="bg-rose-900 text-amber-100 px-4 rounded-lg font-bold hover:bg-rose-950"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {couponFeedback && (
                    <p className={`text-xxs font-bold ${appliedCoupon ? 'text-emerald-800' : 'text-red-700'}`}>
                      {couponFeedback}
                    </p>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t text-xs">
                  <h3 className="font-traditional text-sm font-bold text-rose-950 border-b pb-2">Prepaid Billing Transfer Portal</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* QR Code Dynamic Segment */}
                    <div className="bg-white border p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2">
                      <img 
                        src={bankDetails.qrCodeUrl} 
                        alt="Active payment QR code" 
                        className="w-28 h-28 object-contain border rounded p-1 bg-amber-50" 
                      />
                      <strong className="block text-rose-950 text-[10px] font-bold">UPI ID: {bankDetails.upiId}</strong>
                    </div>

                    <div className="bg-white border p-4 rounded-xl text-[11px] leading-relaxed">
                      <strong className="block text-rose-950 uppercase mb-1 border-b pb-1">Direct Bank Transfer Details</strong>
                      <p>Holder: <strong className="font-bold">{bankDetails.holder}</strong></p>
                      <p>Bank: <strong>{bankDetails.bankName}</strong></p>
                      <p>Account No: <strong>{bankDetails.accountNumber}</strong></p>
                      <p>IFSC: <strong>{bankDetails.ifscCode}</strong></p>
                    </div>
                  </div>

                  {/* Payment screenshot area with clear file option */}
                  <div className="bg-white border p-4 rounded-xl space-y-2">
                    <label className="block font-bold uppercase text-stone-600">Payment Screenshot Receipt (Required)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setCheckoutDetails({...checkoutDetails, screenshot: URL.createObjectURL(file)});
                            showToast("Screenshot attached!");
                          }
                        }}
                        className="flex-grow bg-white border p-2 rounded-lg text-xxs" 
                      />
                      {checkoutDetails.screenshot && (
                        <button 
                          type="button"
                          onClick={() => {
                            setCheckoutDetails({...checkoutDetails, screenshot: null});
                            showToast("Screenshot cleared.");
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xxs font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {checkoutDetails.screenshot && (
                      <div className="mt-2 text-center">
                        <img src={checkoutDetails.screenshot} alt="Attached Receipt preview" className="w-24 h-24 mx-auto object-cover border rounded-lg" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing Breakdown Sheet */}
                <div className="pt-4 border-t text-xs space-y-1.5 text-stone-600">
                  <div className="flex justify-between"><span>Basket Total:</span><strong>₹{cartSubtotal}</strong></div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-800 font-bold">
                      <span>Coupon Applied ({appliedCoupon.code}):</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between"><span>Shipping & Courier:</span><strong>{shippingCharge===0?'FREE':`₹${shippingCharge}`}</strong></div>
                  <div className="flex justify-between text-sm font-bold text-rose-950 pt-2 border-t font-traditional"><span>Final Amount:</span><span>₹{cartGrandTotal}</span></div>
                </div>

                <button type="submit" className="w-full bg-rose-900 text-amber-50 py-3.5 rounded-xl font-bold uppercase tracking-widest hover:bg-rose-950 shadow-md">Submit Order Details</button>
              </form>

            </div>
          </div>
        )}

        {/* ================= CUSTOMER DASHBOARD ================= */}
        {currentPage === 'dashboard' && (
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 text-xs">
            <h1 className="font-traditional text-xl font-bold text-rose-950 mb-4">My Dashboard</h1>
            
            <div className="bg-amber-50 p-5 rounded-2xl border space-y-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-900 text-amber-100 rounded-full flex items-center justify-center font-bold font-traditional text-lg">AK</div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">{checkoutDetails.name}</h3>
                  <span className="text-xxs text-stone-400">Preferred State: {checkoutDetails.state}</span>
                </div>
              </div>
              
              <div className="border-t border-amber-900/10 pt-3 text-xxs space-y-1.5 text-stone-700">
                <strong className="block text-[10px] uppercase tracking-wider text-rose-950 mb-1">Active Account Profile Address:</strong>
                <p><strong>Street Address:</strong> {checkoutDetails.address || <span className="italic text-stone-400">Not specified</span>}</p>
                <p><strong>City & District:</strong> {checkoutDetails.city || '—'}, {checkoutDetails.district || '—'}</p>
                <p><strong>Pincode:</strong> {checkoutDetails.pincode || '—'} | <strong>State:</strong> {checkoutDetails.state}</p>
              </div>
            </div>

            <div className="bg-amber-50/50 p-5 rounded-2xl border space-y-4">
              <h4 className="font-traditional text-xs uppercase tracking-wider font-bold text-rose-950 border-b pb-2">Purchase Tracking</h4>
              {orders.length === 0 ? (
                <p className="text-stone-500 italic py-4">No active deliveries. Place an order to trace progress!</p>
              ) : (
                orders.map(o => (
                  <div key={o.id} className="bg-white border p-4 rounded-xl space-y-3">
                    <div className="flex justify-between text-xxs">
                      <strong>ID: {o.id}</strong>
                      <span className="bg-amber-100 text-amber-800 border px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{o.status}</span>
                    </div>
                    <p className="text-stone-500 font-semibold">Delivering to: {o.shippingAddress}</p>
                    <div className="flex justify-between border-t pt-2 font-bold text-stone-800">
                      <span>Grand Total paid:</span>
                      <span>₹{o.grandTotal}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= ADMIN CONSOLE MANAGEMENT ================= */}
        {currentPage === 'admin' && adminUser && (
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-xs">
            <div className="flex justify-between items-center border-b pb-4">
              <h1 className="font-traditional text-xl font-bold text-rose-950">Store Console Control</h1>
              <button onClick={()=>{setAdminUser(false); setCurrentPage('home');}} className="bg-stone-900 text-amber-50 px-3 py-1.5 rounded-lg font-bold">Logout</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Dynamic Category List Manager (ADD & DELETE) */}
              <div className="bg-amber-50 p-5 rounded-xl border border-amber-900/10 space-y-4">
                <h3 className="font-traditional text-sm font-bold text-rose-950 border-b pb-1">Dynamic Category Manager</h3>
                
                {/* Add Category Form */}
                <form onSubmit={handleAdminAddCategory} className="space-y-2 text-xxs">
                  <input type="text" name="catname" required placeholder="Category Title (e.g. Saffron Packs)" className="w-full bg-white border p-2.5 rounded-lg text-xs" />
                  <input type="text" name="catdesc" placeholder="Category Description Subtitle" className="w-full bg-white border p-2.5 rounded-lg text-xs" />
                  <button type="submit" className="w-full bg-rose-900 text-amber-50 py-2.5 rounded-lg font-bold uppercase tracking-wider">
                    Add Category
                  </button>
                </form>

                {/* Categories Deletion Queue */}
                <div className="space-y-2 border-t pt-3 mt-3">
                  <strong className="block text-[10px] text-stone-500 uppercase">Existing Categories (Delete one-by-one)</strong>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border text-xxs">
                        <div>
                          <strong className="font-bold text-stone-900">{cat.name}</strong>
                          <span className="block text-[9px] text-stone-400">code: {cat.id}</span>
                        </div>
                        <button 
                          onClick={() => handleAdminDeleteCategory(cat.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Coupon Code Manager */}
              <div className="bg-amber-50 p-5 rounded-xl border border-amber-900/10 space-y-4">
                <h3 className="font-traditional text-sm font-bold text-rose-950 border-b pb-1">Dynamic Coupon Manager</h3>
                
                {/* Add Coupon Form */}
                <form onSubmit={handleAdminAddCoupon} className="space-y-2 text-xxs">
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="COUPONCODE" 
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      required 
                      className="w-full bg-white border p-2.5 rounded-lg text-xs font-mono uppercase" 
                    />
                    <select 
                      value={newCouponType}
                      onChange={(e) => setNewCouponType(e.target.value)}
                      className="w-full bg-white border p-2 rounded-lg text-xs font-medium"
                    >
                      <option value="percent">Percent Off (%)</option>
                      <option value="flat">Flat Discount (₹)</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" 
                      placeholder="Discount Value" 
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(Number(e.target.value))}
                      required 
                      className="w-full bg-white border p-2.5 rounded-lg text-xs" 
                    />
                    <input 
                      type="text" 
                      placeholder="Description Label" 
                      value={newCouponDesc}
                      onChange={(e) => setNewCouponDesc(e.target.value)}
                      className="w-full bg-white border p-2.5 rounded-lg text-xs" 
                    />
                  </div>

                  <button type="submit" className="w-full bg-rose-900 text-amber-50 py-2.5 rounded-lg font-bold uppercase tracking-wider">
                    Add Blessings Coupon
                  </button>
                </form>

                {/* Coupon Deletion Queue */}
                <div className="space-y-2 border-t pt-3 mt-3">
                  <strong className="block text-[10px] text-stone-500 uppercase">Existing Active Coupons (Delete one-by-one)</strong>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 font-mono">
                    {coupons.map(cp => (
                      <div key={cp.id} className="flex justify-between items-center bg-white p-2 rounded-lg border text-xxs">
                        <div>
                          <strong className="text-rose-950 font-bold">{cp.code}</strong>
                          <span className="block text-[9px] text-stone-400 font-sans">{cp.type === 'percent' ? `${cp.value}% Off` : `₹${cp.value} Flat`} • {cp.description}</span>
                        </div>
                        <button 
                          onClick={() => handleAdminDeleteCoupon(cp.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Add Offering Form & Credentials Modification Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="bg-amber-50 p-5 rounded-xl border border-amber-900/10 space-y-4">
                <h3 className="font-traditional text-sm font-bold text-rose-950 border-b pb-1">Quick Add Offering</h3>
                <form onSubmit={(e)=>{
                  e.preventDefault();
                  const name = e.target.nname.value;
                  const price = Number(e.target.nprice.value);
                  const cat = e.target.ncat.value;
                  const specs = e.target.nspecs.value;
                  
                  const imgListInput = e.target.nimg.value;
                  const images = imgListInput.trim() 
                    ? imgListInput.split(',').map(item => item.trim())
                    : ["https://images.unsplash.com/photo-1607006342411-101038e68448?auto=format&fit=crop&q=80&w=300"];

                  const item = { 
                    id: `prod-${Date.now()}`, 
                    name, 
                    price, 
                    category: cat, 
                    description: "Pure natural extraction crafted with motherly care.", 
                    specifications: specs || "Weight: 100g, Type: Organic Botanical", 
                    images: images, 
                    rating: 5.0, 
                    reviewsCount: 1 
                  };

                  handleAdminAddProduct(item);
                  e.target.reset();
                }} className="space-y-3 text-xxs">
                  <input type="text" name="nname" required placeholder="Product Title" className="w-full bg-white border p-2.5 rounded-lg text-xs" />
                  <input type="number" name="nprice" required placeholder="Price in ₹" className="w-full bg-white border p-2.5 rounded-lg text-xs" />
                  <select name="ncat" className="w-full bg-white border p-2.5 rounded-lg font-medium">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input type="text" name="nspecs" placeholder="Specifications (e.g. Weight: 100g, Natural)" className="w-full bg-white border p-2.5 rounded-lg text-xs" />
                  
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-stone-500 mb-1">Product Images (Paste comma-separated URLs)</label>
                    <textarea name="nimg" rows="2" placeholder="url1, url2, url3..." className="w-full bg-white border p-2 rounded-lg text-xxs focus:outline-none"></textarea>
                  </div>

                  <button type="submit" className="w-full bg-rose-900 text-amber-50 py-2.5 rounded-lg font-bold uppercase tracking-wider">Publish Product</button>
                </form>
              </div>

              <div className="bg-amber-50 p-5 rounded-xl border border-amber-900/10 space-y-4">
                <h3 className="font-traditional text-sm font-bold text-rose-950 border-b pb-1 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-600" /> Security Login Credentials
                </h3>
                <p className="text-[10px] text-stone-500 leading-relaxed">Modify your master Admin Username and Password credentials securely.</p>
                
                <form onSubmit={handleUpdateAdminCredentials} className="space-y-3">
                  <div>
                    <label className="block text-xxs font-bold text-stone-600 uppercase mb-1">Admin Username</label>
                    <input 
                      type="text" 
                      value={newUsernameInput}
                      onChange={(e)=>setNewUsernameInput(e.target.value)}
                      required 
                      className="w-full bg-white border p-2.5 rounded-lg font-bold" 
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-stone-600 uppercase mb-1">New Admin Password</label>
                    <input 
                      type="text" 
                      value={newPasswordInput}
                      onChange={(e)=>setNewPasswordInput(e.target.value)}
                      required 
                      className="w-full bg-white border p-2.5 rounded-lg font-bold font-mono" 
                    />
                  </div>

                  <button type="submit" className="w-full bg-stone-900 text-amber-100 py-2 rounded-lg font-bold uppercase tracking-wider">
                    Update Security Access Codes
                  </button>
                </form>
              </div>

            </div>

            {/* Dynamic Bank Account Settings Manager + QR Code Loader */}
            <div className="bg-amber-50 p-5 rounded-xl border border-amber-900/10 space-y-4">
              <h3 className="font-traditional text-sm font-bold text-rose-950 border-b pb-1 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-600" /> Bank Account & Dynamic QR Details
              </h3>
              <p className="text-[10px] text-stone-500 leading-relaxed">Change the billing details and dynamic QR code shown to customers instantly.</p>
              
              <form onSubmit={handleUpdateBankDetails} className="space-y-3 text-xxs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-stone-600 mb-0.5">Holder Name</label>
                    <input type="text" value={bankHolderInput} onChange={(e)=>setBankHolderInput(e.target.value)} className="w-full bg-white border p-2.5 rounded-lg focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-stone-600 mb-0.5">Bank Name</label>
                    <input type="text" value={bankNameInput} onChange={(e)=>setBankNameInput(e.target.value)} className="w-full bg-white border p-2.5 rounded-lg focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[9px] uppercase font-bold text-stone-600 mb-0.5">Account Number</label>
                    <input type="text" value={bankAccountInput} onChange={(e)=>setBankAccountInput(e.target.value)} className="w-full bg-white border p-2.5 rounded-lg focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-stone-600 mb-0.5">IFSC Code</label>
                    <input type="text" value={bankIfscInput} onChange={(e)=>setBankIfscInput(e.target.value)} className="w-full bg-white border p-2.5 rounded-lg focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-stone-600 mb-0.5">UPI ID (e.g. 9789552833@okaxis)</label>
                    <input type="text" value={bankUpiInput} onChange={(e)=>setBankUpiInput(e.target.value)} className="w-full bg-white border p-2.5 rounded-lg focus:outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-stone-600 mb-0.5">UPI Payment QR Image URL</label>
                    <input type="text" value={bankQrUrlInput} onChange={(e)=>setBankQrUrlInput(e.target.value)} className="w-full bg-white border p-2.5 rounded-lg focus:outline-none font-mono" placeholder="https://..." />
                  </div>
                </div>

                <button type="submit" className="w-full bg-rose-900 text-amber-50 py-2.5 rounded-lg font-bold uppercase tracking-wider">
                  Save Active Bank & QR Settings
                </button>
              </form>
            </div>

            {/* Verification of incoming customer orders */}
            <div className="bg-amber-50 p-5 rounded-xl border border-amber-900/10 space-y-4">
              <h3 className="font-traditional text-sm font-bold text-rose-950 border-b pb-1">Order Verifications</h3>
              {orders.length === 0 ? <p className="italic py-2 text-stone-500">No active customer orders.</p> : (
                <div className="space-y-3">
                  {orders.map(o => (
                    <div key={o.id} className="bg-white border p-3 rounded-lg space-y-2 text-xxs">
                      <div className="flex justify-between">
                        <strong>ID: {o.id}</strong>
                        <span className="font-bold">₹{o.grandTotal}</span>
                      </div>
                      <p className="text-stone-500">Client: {o.customerName} ({o.state})</p>
                      {o.couponApplied && (
                        <p className="text-emerald-800 font-bold font-mono">Coupon Applied: {o.couponApplied} (Discounted -₹{o.discountAmt})</p>
                      )}
                      {o.screenshot && (
                        <a href={o.screenshot} target="_blank" rel="noreferrer" className="text-rose-900 underline block mt-1 font-bold">
                          View Payment Proof Screenshot
                        </a>
                      )}
                      
                      <div className="flex gap-2 pt-2 border-t justify-end">
                        <button onClick={()=>handleOrderAction(o.id, 'dispatched')} className="bg-blue-50 text-blue-800 border px-2 py-1 rounded">Dispatch</button>
                        <button onClick={()=>handleOrderAction(o.id, 'delivered')} className="bg-emerald-50 text-emerald-800 border px-2 py-1 rounded">Deliver</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Products Queue with One-by-One Delete option */}
            <div className="bg-amber-50 p-5 rounded-xl border border-amber-900/10 space-y-4">
              <h3 className="font-traditional text-sm font-bold text-rose-950 border-b pb-1">Active Catalog Items (Delete one-by-one)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {products.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-xxs bg-white border p-3 rounded-xl shadow-xs">
                    <div className="flex items-center gap-2">
                      <img src={p.images ? p.images[0] : p.image} className="w-8 h-8 object-cover rounded" />
                      <div>
                        <strong className="block text-stone-900 font-bold leading-tight">{p.name}</strong>
                        <span className="text-rose-900 font-bold">₹{p.price}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAdminDeleteProduct(p.id)} 
                      className="text-red-600 hover:text-red-800 p-1 bg-red-50 hover:bg-red-100 rounded-lg shrink-0"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Cart Drawer */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="bg-amber-50 w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between border-l border-amber-800/20">
            <div>
              <div className="flex justify-between items-center border-b border-amber-900/10 pb-4 mb-6">
                <h3 className="font-traditional text-lg font-bold text-rose-950 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-600" /> Sacred Basket
                </h3>
                <button onClick={() => setIsCartDrawerOpen(false)} className="text-stone-400 hover:text-stone-800 p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-xs text-stone-500 italic">Your cart is empty. Explore our grandmother's collection!</p>
                </div>
              ) : (
                <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4 border-b border-amber-900/5 pb-4">
                      <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden shrink-0 border">
                        <img src={item.product.images ? item.product.images[0] : item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow space-y-1 text-xs">
                        <h4 className="font-semibold text-stone-900 line-clamp-1">{item.product.name}</h4>
                        <span className="block font-bold text-rose-950">₹{item.product.price}</span>
                        <div className="flex items-center gap-2 pt-2">
                          <button onClick={() => updateCartQuantity(item.product.id, -1)} className="bg-stone-200/80 hover:bg-stone-200 w-6 h-6 rounded flex items-center justify-center font-bold">-</button>
                          <span className="font-bold text-stone-800 text-xxs px-1">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.product.id, 1)} className="bg-stone-200/80 hover:bg-stone-200 w-6 h-6 rounded flex items-center justify-center font-bold">+</button>
                          <button onClick={() => removeFromCart(item.product.id)} className="text-red-600 hover:text-red-800 ml-auto p-1" title="Remove">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-amber-900/10 pt-6 space-y-4">
                <div className="flex justify-between text-sm font-bold text-stone-800">
                  <span>Cart Subtotal:</span>
                  <span className="text-base text-rose-950 font-traditional">₹{cartSubtotal}</span>
                </div>
                <button 
                  onClick={() => { setIsCartDrawerOpen(false); setCurrentPage('checkout'); }} 
                  className="w-full bg-rose-900 text-amber-50 py-3 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-rose-950 transition text-center shadow-lg block"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Persistent floating AI voice assistant button */}
      <div className="fixed bottom-24 left-6 z-50 flex flex-col items-start gap-2">
        {voiceFeedbackText && (
          <div className="bg-stone-900 text-amber-100 text-[10px] uppercase tracking-wider font-extrabold px-3 py-2 rounded-xl shadow-2xl animate-pulse">
            {voiceFeedbackText}
          </div>
        )}
        <button 
          onClick={handleStartVoiceSearch}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 text-white ${
            isVoiceListening ? 'bg-red-600' : 'bg-rose-900'
          }`}
          title="Speak in English/Tamil"
        >
          {isVoiceListening ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>

      {/* Floating WhatsApp Connection Buttons */}
      <a 
        href="https://wa.me/919789552833?text=Hi!%20I%20am%20interested%20in%20Mom%20Secret%20Care%20Yourself%20Ayurvedic%20Wellness%20secrets." 
        target="_blank" 
        rel="noreferrer" 
        className="fixed bottom-6 right-6 z-40 bg-[#25d366] text-white p-3.5 rounded-full shadow-2xl hover:scale-110 transition duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.503-5.729-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.428 2.016 13.99 1.01 11.999 1.01 6.563 1.01 2.139 5.381 2.135 10.81c-.001 1.693.456 3.349 1.322 4.787L2.404 20.8l5.309-1.394z"/>
        </svg>
      </a>

      {/* Footer */}
      <footer className="bg-rose-950 text-amber-100/90 pt-16 pb-8 border-t border-amber-800/40 font-sans-premium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center border border-amber-200/50">
                <span className="font-traditional text-lg font-bold text-stone-950">M</span>
              </div>
              <div>
                <h3 className="font-traditional text-base font-bold text-amber-300 tracking-wider">Mom Secret</h3>
                <p className="text-xxs text-amber-100/80 uppercase tracking-widest leading-none">Care Yourself</p>
              </div>
            </div>
            <p className="text-xs font-light leading-relaxed text-amber-100/70">
              Honoring generations of pristine Indian beauty and ayurvedic wisdom. Hand-poured with motherly devotion and high-grade standards.
            </p>
          </div>

          <div>
            <h4 className="font-traditional text-sm font-bold text-amber-300 uppercase tracking-widest mb-4">Pure Offerings</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><button onClick={() => { setSelectedCategoryFilter('skincare'); setCurrentPage('shop'); }} className="hover:text-amber-300 transition">Ubtan & Skincare</button></li>
              <li><button onClick={() => { setSelectedCategoryFilter('haircare'); setCurrentPage('shop'); }} className="hover:text-amber-300 transition">Slow-Infused Hair Oils</button></li>
              <li><button onClick={() => { setSelectedCategoryFilter('jewelry'); setCurrentPage('shop'); }} className="hover:text-amber-300 transition">Temple Kundan Jewelry</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-traditional text-sm font-bold text-amber-300 uppercase tracking-widest mb-4">Trust Policies</h4>
            <ul className="space-y-2 text-xs font-light">
              <li><span className="cursor-pointer hover:text-amber-300 transition">Free Tamil Nadu Delivery Rules</span></li>
              <li><span className="cursor-pointer hover:text-amber-300 transition">Return & Exchange Policy</span></li>
              <li><span className="cursor-pointer hover:text-amber-300 transition">Privacy & Safety Standards</span></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-traditional text-sm font-bold text-amber-300 uppercase tracking-widest mb-4">Reach Our Kitchen</h4>
            <p className="text-xs font-light leading-relaxed text-amber-100/70">
              Madurai, Tamil Nadu, India<br />
              Email: <strong className="text-amber-200 font-bold">momsecretcareyourself@gmail.com</strong><br />
              WhatsApp: <strong className="text-amber-200 font-bold">9789552833</strong>
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-amber-800/20 pt-6 text-center text-xxs text-amber-100/50">
          <p>© 2026 Mom Secret Care Yourself. Bottled with maternal affection. Designed & engineered premium in India.</p>
        </div>
      </footer>

    </div>
  );
}