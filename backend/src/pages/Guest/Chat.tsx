import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, Clock, Sparkles, MessageCircle, Zap, Star, Bot, User, 
         HelpCircle, MapPin, Calendar, Coffee, Car, Wifi, Shield, Heart,
         Utensils, Dumbbell, Music, Camera, Gift, Sun, Moon, Info } from 'lucide-react';

interface Message {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: string;
}

interface QuickActionCategory {
  title: string;
  icon: React.ReactNode;
  color: string;
  actions: string[];
}

interface FAQ {
  category: string;
  questions: string[];
}

export default function EnhancedChat() {
  const [message, setMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showFAQ, setShowFAQ] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Expanded Quick Actions with more categories
  const quickActionCategories: QuickActionCategory[] = [
    {
      title: "Room Services",
      icon: <MessageCircle className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      actions: [
        "Request housekeeping", "Extra towels & amenities", "Room temperature control",
        "Late checkout request", "Technical support", "Room service menu",
        "Minibar refill", "Wake-up call", "Laundry service"
      ]
    },
    {
      title: "Dining & Beverages",
      icon: <Utensils className="h-4 w-4" />,
      color: "bg-green-100 text-green-700 hover:bg-green-200",
      actions: [
        "Restaurant reservations", "Chef's special today", "Wine pairing recommendations",
        "Dietary restrictions menu", "Private dining options", "Bar menu",
        "Breakfast times", "In-room dining", "Cooking classes"
      ]
    },
    {
      title: "Wellness & Spa",
      icon: <Heart className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
      actions: [
        "Spa appointment booking", "Massage therapy options", "Fitness center hours",
        "Yoga class schedule", "Pool & sauna access", "Wellness packages",
        "Personal trainer", "Meditation sessions", "Beauty treatments"
      ]
    },
    {
      title: "Local Experiences",
      icon: <MapPin className="h-4 w-4" />,
      color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
      actions: [
        "City tour recommendations", "Museum tickets", "Local attractions",
        "Transportation options", "Shopping districts", "Cultural events",
        "Photography spots", "Nightlife recommendations", "Day trip packages"
      ]
    },
    {
      title: "Business & Events",
      icon: <Calendar className="h-4 w-4" />,
      color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
      actions: [
        "Meeting room booking", "Business center access", "Event planning",
        "Conference facilities", "Printing services", "Translation services",
        "Secretary assistance", "Catering for events", "AV equipment rental"
      ]
    },
    {
      title: "Information & Help",
      icon: <Info className="h-4 w-4" />,
      color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
      actions: [
        "Hotel amenities guide", "WiFi information", "Emergency contacts",
        "Check-out procedures", "Lost & found", "Currency exchange",
        "Weather forecast", "Airport shuttle", "Concierge services"
      ]
    }
  ];

  // Comprehensive FAQ System
  const faqCategories: FAQ[] = [
    {
      category: "Getting Started",
      questions: [
        "How do I connect to WiFi?",
        "What are the hotel amenities?",
        "Where is the fitness center?",
        "What time is breakfast served?",
        "How do I access the spa?"
      ]
    },
    {
      category: "Dining Options",
      questions: [
        "What restaurants are in the hotel?",
        "Can I make dinner reservations?",
        "Do you have vegetarian options?",
        "What's the chef's specialty?",
        "Is room service available 24/7?"
      ]
    },
    {
      category: "Local Area",
      questions: [
        "What attractions are nearby?",
        "How do I get to downtown?",
        "Where are the best shopping areas?",
        "What's the weather like today?",
        "Can you recommend local tours?"
      ]
    },
    {
      category: "Services",
      questions: [
        "Can I extend my checkout?",
        "Do you offer laundry service?",
        "Is there airport transportation?",
        "Can you book show tickets?",
        "Do you have a business center?"
      ]
    }
  ];

  // Enhanced recommendations with time-based and personalized suggestions
  const timeBasedRecommendations = () => {
    const hour = new Date().getHours();
    const guestName = 'Guest'; // Would come from context in real app
    
    if (hour >= 6 && hour < 11) {
      return [
        `Good morning ${guestName}! Start your day with our signature breakfast buffet featuring local specialties`,
        "Perfect morning for a sunrise yoga session on our terrace - book now!",
        "Try our fresh-pressed juice bar with energizing wellness shots",
        "Morning spa treatments are 20% off today - treat yourself!"
      ];
    } else if (hour >= 11 && hour < 16) {
      return [
        `Good afternoon ${guestName}! Our rooftop lunch menu features seasonal ingredients`,
        "Ideal time for exploring local attractions - I can arrange a guided tour",
        "Poolside service is available with refreshing cocktails and light bites",
        "Book an afternoon spa treatment to relax and recharge"
      ];
    } else if (hour >= 16 && hour < 21) {
      return [
        `Good evening ${guestName}! Experience our award-winning dinner tasting menu`,
        "Sunset cocktails on the rooftop bar with panoramic city views",
        "Live jazz performance tonight in our lounge - reserve your table",
        "Evening cultural tours showcase the city's historic districts"
      ];
    } else {
      return [
        `Good evening ${guestName}! Our 24-hour room service offers comfort food favorites`,
        "Late-night spa services include relaxing treatments for better sleep",
        "Enjoy quiet evening activities like our library or meditation room",
        "Our concierge can arrange transportation for nightlife experiences"
      ];
    }
  };

  // Comprehensive response system with context awareness
  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    const guestName = 'Guest'; // Would come from context
    
    // Enhanced greeting patterns
    if (message.match(/\b(hello|hi|hey|good morning|good afternoon|good evening|greetings)\b/)) {
      const hour = new Date().getHours();
      const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      return `${timeGreeting} ${guestName}! 🌟 I'm your AI Chatbot at Nobu Hotel. I'm here 24/7 to make your stay extraordinary. Whether you need dining reservations, spa bookings, local recommendations, or any assistance, I'm at your service. How can I help you today?`;
    }
    
    // Food & Dining - Enhanced responses
    if (message.match(/\b(food|menu|restaurant|eat|hungry|dinner|lunch|breakfast|cuisine|chef|wine|cocktail)\b/)) {
      return `Excellent choice, ${guestName}! 🍽️ Our culinary team offers exceptional experiences:
      
• **Main Restaurant**: Award-winning Japanese-Peruvian fusion cuisine
• **Rooftop Bar**: Craft cocktails with city views  
• **Room Service**: 24/7 gourmet delivery (25-30 min)
• **Wine Cellar**: Over 500 selections with expert pairings

Would you like to make a reservation, see today's specials, or perhaps arrange a private chef experience? I can also accommodate any dietary preferences or allergies.`;
    }
    
    // Spa & Wellness - Comprehensive response
    if (message.match(/\b(spa|massage|relax|wellness|treatment|yoga|fitness|pool|sauna)\b/)) {
      return `Perfect timing for wellness, ${guestName}! 🧘‍♀️ Our spa sanctuary offers:
      
• **Signature Treatments**: Traditional Japanese therapies & modern wellness
• **Fitness Center**: State-of-the-art equipment (24/7 access)
• **Pool & Sauna**: Heated infinity pool with city views
• **Yoga Studio**: Daily classes including sunrise sessions
• **Personal Training**: Customized fitness programs

Current availability shows openings for massages and facials. Would you like me to book a treatment, or would you prefer information about our wellness packages?`;
    }
    
    // Activities & Entertainment
    if (message.match(/\b(activity|activities|fun|entertainment|things to do|events|tours|sightseeing)\b/)) {
      return `Wonderful, ${guestName}! 🎭 There's so much to experience:
      
**In-Hotel Activities:**
• Live music in our lounge (Thu-Sat evenings)
• Art gallery featuring local artists
• Rooftop stargazing with telescope

**Local Experiences:**
• Historic district walking tours (UNESCO World Heritage site)
• Art museum with world-class collections
• Waterfront markets and local crafts
• Photography workshops in scenic locations

What type of experience speaks to you - cultural, adventure, relaxation, or culinary exploration?`;
    }
    
    // Transportation & Location
    if (message.match(/\b(transport|transportation|taxi|uber|car|airport|shuttle|directions|location)\b/)) {
      return `I'll help you get around easily, ${guestName}! 🚗 Transportation options:
      
• **Hotel Shuttle**: Complimentary service to downtown & airport (every 30 min)
• **Concierge Car Service**: Premium vehicles with professional drivers
• **Taxi/Rideshare**: I can arrange pickup directly to your room
• **Public Transit**: Metro station 2 blocks away with city-wide access
• **Bike Rental**: Explore the city on our complimentary bikes

Where would you like to go? I can provide directions, travel times, and book transportation for you.`;
    }
    
    // Technical Support & Hotel Info
    if (message.match(/\b(wifi|internet|tv|technical|connection|password|amenities|facilities)\b/)) {
      return `I'm here to help with all technical needs, ${guestName}! 💻 Here's what you need:
      
**WiFi Access:**
• Network: 'NobuGuest-Premium'
• Password: 'Welcome2024!'
• Speed: High-speed fiber (500+ Mbps)

**Room Technology:**
• Smart TV with streaming services
• Climate control via tablet
• USB charging stations throughout room
• Bluetooth sound system

**Hotel Amenities:**
• Business center with printing (24/7)
• Meeting rooms with AV equipment
• International phone access
• Technical support available instantly

Is there a specific technical issue I can resolve for you right away?`;
    }
    
    // Emergency & Urgent Situations
    if (message.match(/\b(emergency|urgent|help|problem|issue|medical|security)\b/)) {
      return `I'm here to help immediately, ${guestName}! 🚨 For your safety and comfort:
      
**Medical Emergency**: Dial 911 or hotel emergency (ext. 0)
**Hotel Security**: Available 24/7 (ext. 911)
**Urgent Room Issues**: I'll dispatch maintenance within 5 minutes
**Lost Items**: Our lost & found team will assist
**Guest Relations**: Manager on duty can address any concerns

Please let me know specifically what you need assistance with. Your safety and satisfaction are our top priorities, and I'll ensure immediate attention to any urgent matters.`;
    }
    
    // Check-out & Departure
    if (message.match(/\b(checkout|check out|leaving|departure|bill|receipt|luggage)\b/)) {
      return `Thank you for staying with us, ${guestName}! 🎒 I'll make your departure seamless:
      
**Check-out Options:**
• Express check-out via TV (bills emailed instantly)
• Front desk service (available 24/7)
• Late check-out available (subject to availability)

**Departure Services:**
• Luggage storage if you want to explore more
• Airport shuttle reservation
• Transportation arrangements
• Final bill preparation with detailed breakdown

**Don't Forget:**
• Rate your stay for future personalization
• Join our loyalty program for exclusive benefits

What departure time works best for you? I can arrange everything to ensure a smooth conclusion to your stay.`;
    }
    
    // Local recommendations & culture
    if (message.match(/\b(local|culture|history|shopping|museum|gallery|market|neighborhood)\b/)) {
      return `I'd love to share local gems with you, ${guestName}! 🏛️ Cultural highlights:
      
**Must-Visit Attractions:**
• Metropolitan Art Museum (10-min walk) - World-renowned collections
• Historic Old Town (15-min) - Cobblestone streets & architecture  
• Artisan Quarter (12-min) - Local crafts & authentic experiences
• Waterfront District (8-min) - Markets, cafes & scenic views

**Cultural Experiences:**
• Traditional craft workshops
• Local cooking classes with market tours
• Evening cultural performances
• Historical walking tours with expert guides

**Shopping Recommendations:**
• Luxury boutiques on Madison Avenue
• Local artisan markets (weekends)
• Vintage finds in the Arts District

What type of cultural experience interests you most? I can arrange tours, provide maps, or book tickets for special exhibitions.`;
    }
    
    // Weather & outdoor activities
    if (message.match(/\b(weather|sunny|rain|cold|hot|outdoor|outside|park|beach)\b/)) {
      return `Let me help you plan based on today's conditions, ${guestName}! ☀️ Current weather info:
      
**Today's Forecast:**
• Temperature: Pleasant 72°F (22°C)
• Conditions: Partly cloudy with sunshine
• Perfect for outdoor activities!

**Outdoor Recommendations:**
• Rooftop terrace dining with city views
• Walking tour of Historic District
• Bike rental for waterfront exploration
• Photography expedition to scenic viewpoints
• Outdoor yoga session in nearby park

**Backup Indoor Options:**
• World-class museums with current exhibitions
• Shopping in climate-controlled districts
• Spa treatments with panoramic windows
• Indoor cultural experiences

Would you like me to check the extended forecast or help plan outdoor activities for your stay?`;
    }
    
    // Shopping & souvenirs
    if (message.match(/\b(shop|shopping|buy|purchase|souvenir|gift|store|boutique|mall)\b/)) {
      return `Perfect! Let me guide you to the best shopping, ${guestName}! 🛍️ Shopping destinations:
      
**Luxury Shopping:**
• Fifth Avenue Boutiques (5-min taxi) - Designer brands
• Hotel Lobby Shop - Curated luxury items & local crafts
• Exclusive hotel partnerships - VIP shopping experiences

**Local & Authentic:**
• Artisan Market (weekends) - Handmade local crafts
• Vintage District - Unique finds & antiques
• Local Designer Studios - One-of-a-kind pieces

**Convenience:**
• Hotel gift shop - Essentials & premium souvenirs
• 24/7 convenience store (2 blocks)
• Personal shopping service available

**Special Services:**
• Personal shopper assistance
• Tax-free shopping guidance
• Package delivery to room
• International shipping arrangements

What type of shopping experience are you looking for? I can arrange transportation, provide maps, or connect you with personal shopping services.`;
    }
    
    // Default enhanced response
    return `Thank you for reaching out, ${guestName}! ✨ I'm your dedicated AI Chatbot, equipped to assist with:

🍽️ **Dining**: Reservations, menus, dietary preferences
🧘‍♀️ **Wellness**: Spa bookings, fitness, relaxation
🎭 **Activities**: Local tours, entertainment, cultural experiences  
🚗 **Transportation**: Airport transfers, local travel, directions
🏨 **Services**: Housekeeping, concierge, technical support
📍 **Local Info**: Attractions, shopping, weather, recommendations

I'm here 24/7 to make your stay extraordinary. What would you like to explore or arrange today?`;
  };

  // Enhanced contextual suggestions
  const generateSuggestions = (userMessage: string): string[] => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('food') || message.includes('restaurant') || message.includes('hungry')) {
      return [
        "Show me tonight's dinner specials", 
        "Make a restaurant reservation for 2", 
        "What vegetarian options do you have?",
        "Order room service now",
        "Wine pairing recommendations",
        "Chef's tasting menu details"
      ];
    }
    
    if (message.includes('spa') || message.includes('wellness') || message.includes('massage')) {
      return [
        "Book a relaxing massage", 
        "What spa packages are available?", 
        "Show me wellness activities",
        "Check spa availability today",
        "Couples massage booking",
        "Yoga class schedule"
      ];
    }
    
    if (message.includes('activity') || message.includes('tour') || message.includes('sightseeing')) {
      return [
        "What can I do nearby today?", 
        "Book a city walking tour", 
        "Local cultural attractions",
        "Photography tour booking",
        "Evening entertainment options",
        "Day trip recommendations"
      ];
    }
    
    if (message.includes('transport') || message.includes('airport') || message.includes('taxi')) {
      return [
        "Book airport shuttle", 
        "Arrange taxi to downtown", 
        "Hotel car service rates",
        "Public transportation guide",
        "Directions to attractions",
        "Bike rental information"
      ];
    }
    
    if (message.includes('room') || message.includes('housekeeping') || message.includes('service')) {
      return [
        "Request housekeeping now", 
        "Extra towels and amenities", 
        "Room temperature adjustment",
        "Technical support needed",
        "Late checkout request",
        "Minibar refill service"
      ];
    }
    
    return [
      "Show me hotel amenities", 
      "What services do you offer?", 
      "Local area recommendations",
      "Dining options available",
      "Plan my day itinerary",
      "Emergency contact information"
    ];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [localMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      message: message.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setLocalMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateBotResponse(userMessage.message);
      const suggestions = generateSuggestions(userMessage.message);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setLocalMessages(prev => [...prev, botMessage]);
      setContextualSuggestions(suggestions);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    const guestName = 'Guest';
    setIsTyping(true);
    
    setTimeout(() => {
      let response = '';
      
      // Enhanced responses for quick actions
      switch (action.toLowerCase()) {
        case 'request housekeeping':
          response = `Perfect, ${guestName}! 🧹 Housekeeping has been notified and will service your room within 30 minutes. They'll ensure everything is spotless, restock amenities, and attend to any special requests. Is there anything specific you'd like them to focus on?`;
          break;
        case 'restaurant reservations':
          response = `Excellent choice, ${guestName}! 🍽️ I can help you reserve a table at our award-winning restaurant. We have availability for dinner tonight with options for intimate dining or our chef's counter experience. What time and party size would work best for you?`;
          break;
        case 'spa appointment booking':
          response = `Wonderful, ${guestName}! 🧘‍♀️ Our spa has availability for treatments today. Popular options include our signature 90-minute wellness journey, deep tissue massage, and rejuvenating facial treatments. Would you prefer morning tranquility or afternoon relaxation?`;
          break;
        case 'city tour recommendations':
          response = `Great idea, ${guestName}! 🗺️ I recommend our premium city tour featuring historic landmarks, local markets, and cultural highlights. The 3-hour guided experience includes transportation and expert commentary. Tours depart at 10 AM and 2 PM daily. Shall I reserve your spot?`;
          break;
        case 'wifi information':
          response = `Absolutely, ${guestName}! 📶 WiFi details: Network 'NobuGuest-Premium', Password 'Welcome2024!'. Enjoy high-speed fiber internet throughout the hotel. If you experience any connectivity issues, our tech support team is available 24/7 for immediate assistance.`;
          break;
        default:
          response = `I've processed your request for "${action}", ${guestName}! 🌟 Our team is taking care of this for you immediately. You'll receive confirmation shortly. Is there anything else I can assist you with to enhance your stay?`;
      }
      
      const botMessage: Message = {
        id: Date.now().toString(),
        message: response,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setLocalMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  const handleFAQClick = (question: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      message: question,
      sender: 'user',
      timestamp: new Date()
    };
    
    setLocalMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateBotResponse(question);
      const suggestions = generateSuggestions(question);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setLocalMessages(prev => [...prev, botMessage]);
      setContextualSuggestions(suggestions);
      setIsTyping(false);
    }, 1200);
  };

  const QuickActionButton = ({ action, icon, color }: { action: string; icon: React.ReactNode; color: string }) => (
    <button
      onClick={() => handleQuickAction(action)}
      className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${color} hover:shadow-md transform hover:scale-105`}
    >
      {icon}
      <span>{action}</span>
    </button>
  );

  return (
    <div className="pb-20 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Nobu AI Chatbot</h1>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">AI Assistant Online • 24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md">
              <Phone className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Time-Based Recommendations Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Star className="h-5 w-5" />
          <h3 className="font-semibold">Personalized Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {timeBasedRecommendations().slice(0, 2).map((rec, index) => (
            <div key={index} className="bg-white bg-opacity-20 rounded-lg p-3 cursor-pointer hover:bg-opacity-30 transition-all"
                 onClick={() => handleSuggestionClick(rec.split('-')[0] + '?')}>
              <p className="text-sm leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      {showQuickActions && (
        <div className="bg-white border-b border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-800">Quick Actions</h3>
            </div>
            <button
              onClick={() => setShowQuickActions(false)}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              Hide
            </button>
          </div>
          
          {/* Category Tabs */}
          <div className="flex space-x-2 mb-4 overflow-x-auto">
            {quickActionCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(index)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === index 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span>{category.title}</span>
              </button>
            ))}
          </div>

          {/* Active Category Actions */}
          <div className="flex flex-wrap gap-2">
            {quickActionCategories[activeCategory].actions.slice(0, 6).map((action, index) => (
              <QuickActionButton
                key={index}
                action={action}
                icon={quickActionCategories[activeCategory].icon}
                color={quickActionCategories[activeCategory].color}
              />
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {showFAQ && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-800">Frequently Asked Questions</h3>
            </div>
            <button
              onClick={() => setShowFAQ(false)}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              Hide
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-lg p-3 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-2 text-sm">{category.category}</h4>
                <div className="space-y-1">
                  {category.questions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleFAQClick(question)}
                      className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-all"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {localMessages.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 max-w-md mx-auto">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
                  <Bot className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Welcome to AI Guest Services</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Your intelligent concierge is ready to assist 24/7 with comprehensive support!
              </p>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                  <Utensils className="h-4 w-4 text-blue-500" />
                  <span className="text-blue-700 font-medium">Dining reservations & recommendations</span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                  <Heart className="h-4 w-4 text-green-500" />
                  <span className="text-green-700 font-medium">Spa, wellness & fitness bookings</span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  <span className="text-purple-700 font-medium">Local tours & cultural experiences</span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-orange-50 rounded-lg">
                  <Car className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-700 font-medium">Transportation & travel assistance</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {localMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md relative ${msg.sender === 'user' ? 'ml-12' : 'mr-12'}`}>
              <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}>
                {msg.sender === 'bot' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="p-1 bg-blue-100 rounded-full">
                      <Bot className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-blue-600">AI Chatbot</span>
                  </div>
                )}
                
                <div className="text-sm leading-relaxed whitespace-pre-line">{msg.message}</div>
                
                <div className={`text-xs mt-2 flex items-center space-x-1 ${
                  msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <Clock className="h-3 w-3" />
                  <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className={`absolute top-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                msg.sender === 'user' ? '-right-10 bg-blue-600' : '-left-10 bg-gradient-to-r from-blue-500 to-purple-600'
              }`}>
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
            </div>
          </div>
        ))}

        {contextualSuggestions.length > 0 && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md mr-12">
              <p className="text-xs text-gray-500 mb-2 px-2 font-medium">Suggested follow-ups:</p>
              <div className="grid grid-cols-1 gap-2">
                {contextualSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-left px-4 py-2 text-sm bg-gradient-to-r from-gray-50 to-blue-50 text-gray-700 rounded-xl hover:from-blue-50 hover:to-blue-100 transition-all duration-200 border border-gray-200 hover:border-blue-300 transform hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="mr-12">
              <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1 bg-blue-100 rounded-full">
                    <Bot className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-xs text-blue-600 font-semibold">AI is thinking...</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Message Input */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <form onSubmit={handleSend} className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything - dining, spa, activities, local info..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 placeholder-gray-500"
            />
            <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
          </div>
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        
        <div className="flex items-center justify-between mt-3">
          {!showQuickActions && (
            <button
              onClick={() => setShowQuickActions(true)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1 font-medium"
            >
              <Zap className="h-4 w-4" />
              <span>Show Quick Actions</span>
            </button>
          )}
          
          {!showFAQ && (
            <button
              onClick={() => setShowFAQ(true)}
              className="text-sm text-green-600 hover:text-green-700 flex items-center space-x-1 font-medium"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Show FAQ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}