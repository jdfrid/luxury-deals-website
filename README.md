# 💎 Luxury Deals Website

A modern eBay affiliate website for luxury products with a comprehensive admin management system.

![Luxury Deals](https://img.shields.io/badge/eBay-Affiliate-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

---

## ✨ Features

### Public Website
- 🎯 **21+ Curated Luxury Products** - Watches, handbags, jewelry, sunglasses, shoes
- 💰 **Massive Discounts** - Average 51% off, up to 58% savings
- 🔍 **Search & Filter** - Find products by category, brand, or keyword
- 📱 **Responsive Design** - Perfect on mobile, tablet, and desktop
- 🔗 **eBay Affiliate Integration** - All links include campaign ID tracking

### Admin Dashboard
- 🔐 **Secure Authentication** - Role-based access control
- 📦 **Product Management** - Add, edit, delete products with ease
- 🏷️ **Category Management** - Organize products into categories
- 👥 **User Management** - Create users with different permission levels
- 🔎 **Advanced Search** - Real-time search and filtering
- 📊 **Auto-calculations** - Discount percentages calculated automatically

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/luxury-deals-website.git
cd luxury-deals-website

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the website.

---

## 🔐 Admin Access

**Default Credentials:**
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Important**: Change these credentials after deployment!

**Admin URL**: `http://localhost:3000/admin`

---

## 📦 Project Structure

```
luxury-deals-website/
├── client/
│   ├── public/
│   │   └── real_ebay_deals.json      # Product data
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/                   # shadcn/ui components
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx       # Authentication
│   │   │   └── ThemeContext.tsx      # Theme management
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Home page
│   │   │   ├── Categories.tsx        # Categories page
│   │   │   ├── Login.tsx             # Login page
│   │   │   └── AdminDashboard.tsx    # Admin interface
│   │   ├── App.tsx                   # Main app component
│   │   └── index.css                 # Global styles
│   └── index.html
├── vercel.json                        # Vercel deployment config
└── package.json
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **Routing**: Wouter
- **State Management**: React Context API
- **Icons**: Lucide React

---

## 📊 Data Management

### Products
Products are stored in `/client/public/real_ebay_deals.json`. Each product includes:
- Title, brand, description
- Original price, final price, discount percentage
- Category, deal type, condition
- eBay product URL (with affiliate ID)
- Image URL
- Featured status

### Categories & Users
- Stored in browser localStorage
- Persists across sessions
- Can be exported/imported

---

## 🎨 Customization

### Adding Products

1. Login to admin dashboard
2. Go to Products tab
3. Click "Add New Product"
4. Fill in all fields
5. Click "Add Product"
6. Download updated JSON file
7. Replace `/client/public/real_ebay_deals.json`

### Changing Colors

Edit `/client/src/index.css` to customize the color scheme:

```css
:root {
  --primary: 262 83% 58%;    /* Purple */
  --secondary: 330 81% 60%;  /* Pink */
  /* ... more colors */
}
```

### Adding Categories

1. Login to admin dashboard
2. Go to Categories tab
3. Add/edit/delete categories
4. Changes saved to localStorage

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Deploy with one click
4. Get permanent URL

**Detailed instructions**: See `DEPLOYMENT_INSTRUCTIONS.md`

### Deploy to Netlify

1. Push code to GitHub
2. Import repository in Netlify
3. Configure build settings
4. Deploy

---

## 🔒 Security Notes

### Current Implementation
- Frontend-only authentication
- Data stored in localStorage and JSON
- Suitable for demo/small projects

### For Production
Consider implementing:
- Backend API with proper authentication
- Database for user and product data
- Password hashing (bcrypt)
- JWT tokens for sessions
- HTTPS everywhere
- Rate limiting
- Input validation

---

## 📈 eBay Affiliate Integration

All product links include the eBay Partner Network campaign ID: `5339243279`

### Link Format
```
https://www.ebay.com/itm/ITEM_ID?campid=5339243279
```

### Tracking
- Monitor clicks and earnings in eBay Partner Network dashboard
- 24-hour cookie window for commissions
- Earn on qualifying purchases

---

## 🎯 User Roles

| Role | View Products | Add/Edit | Delete | Manage Categories | Manage Users |
|------|--------------|----------|--------|-------------------|--------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Editor** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Viewer** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

---

## 🐛 Known Issues

1. **Image Loading**: Some products have placeholder images
   - Solution: Update with real eBay product images

2. **Data Persistence**: Changes require JSON file replacement
   - Solution: Implement backend API for real-time updates

3. **Security**: Basic authentication only
   - Solution: Add proper backend authentication

---

## 🔄 Updates & Maintenance

### Regular Tasks
- Add new products weekly
- Update prices and discounts
- Remove expired deals
- Monitor affiliate performance
- Backup data files

### Updating Products
1. Make changes in admin dashboard
2. Download updated JSON
3. Commit to Git
4. Push to GitHub
5. Vercel auto-deploys

---

## 📚 Documentation

- `ADMIN_SYSTEM_GUIDE.md` - Complete admin documentation
- `DEPLOYMENT_INSTRUCTIONS.md` - Deployment guide
- `FINAL_PROJECT_SUMMARY.md` - Project overview

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Deployed on [Vercel](https://vercel.com)

---

## 📞 Support

For questions or issues:
- Check the documentation files
- Review browser console for errors
- Verify all required fields are filled
- Ensure you have the correct permissions

---

## 🎉 Live Demo

**Website**: [Coming Soon - Deploy to get your URL]

**Admin Dashboard**: [Your URL]/admin

**Login**: admin / admin123

---

**Built with ❤️ for luxury deal enthusiasts**

---

## 📊 Stats

- **Products**: 21 luxury items
- **Categories**: 5 (Watches, Handbags, Sunglasses, Jewelry, Shoes)
- **Total Savings**: $32,093.55
- **Average Discount**: 51%
- **Price Range**: $119.99 - $4,999.00

---

**Version**: 1.0  
**Last Updated**: November 22, 2025
