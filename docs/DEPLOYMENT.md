# NEXUS Project Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended - Easiest)
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Vercel
- **Database**: MongoDB Atlas (Free tier)

### Option 2: Render
- **Frontend**: Deploy to Render
- **Backend**: Deploy to Render
- **Database**: MongoDB Atlas (Free tier)

### Option 3: Railway
- **Frontend**: Deploy to Railway
- **Backend**: Deploy to Railway
- **Database**: MongoDB Atlas (Free tier)

## 📋 Prerequisites

1. **GitHub Account**: Push your code to GitHub
2. **MongoDB Atlas Account**: Free tier database
3. **Vercel Account**: Free hosting (recommended)

## 🗄️ Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Create a database user with password
5. Get your connection string
6. Add your IP address to the whitelist (or use 0.0.0.0/0 for all IPs)

## 🌐 Step 2: Deploy Backend to Vercel

### 2.1 Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2.2 Deploy Backend
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure settings:
   - **Framework Preset**: Node.js
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### 2.3 Set Environment Variables
In Vercel dashboard, add these environment variables:
```
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/nexus?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Frontend Environment File
Create `frontend/.env.production`:
```
VITE_API_URL=https://your-backend-domain.vercel.app
```

### 3.2 Deploy Frontend
1. In Vercel, create a new project
2. Import the same GitHub repository
3. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3.3 Set Environment Variables
```
VITE_API_URL=https://your-backend-domain.vercel.app
```

## 🔄 Step 4: Update API URLs

After deployment, update the frontend API configuration:

1. Get your backend URL from Vercel
2. Update `frontend/src/config/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? "http://localhost:5001" : "https://your-backend-domain.vercel.app");
```

## 🧪 Step 5: Test Your Deployment

1. **Test Backend**: Visit `https://your-backend-domain.vercel.app/health`
2. **Test Frontend**: Visit your frontend URL
3. **Test API Calls**: Try logging in and creating projects

## 🔧 Development Workflow

### Local Development
```bash
# Backend
cd backend
npm run dev

# Frontend (in new terminal)
cd frontend
npm run dev
```

### Production Updates
1. Make changes locally
2. Test thoroughly
3. Push to GitHub
4. Vercel automatically deploys

## 🛡️ Security Considerations

### Environment Variables
- Never commit `.env` files
- Use Vercel's environment variable system
- Rotate JWT secrets regularly

### CORS Configuration
- Backend is configured to only allow your frontend domain
- Update `FRONTEND_URL` in backend environment variables

### Database Security
- Use strong passwords for MongoDB users
- Enable MongoDB Atlas security features
- Regular backups (automatic with Atlas)

## 📊 Monitoring & Analytics

### Vercel Analytics
- Built-in performance monitoring
- Real-time analytics
- Error tracking

### MongoDB Atlas
- Database performance monitoring
- Query optimization suggestions
- Automatic scaling

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `FRONTEND_URL` environment variable
   - Ensure frontend URL is in allowed origins

2. **MongoDB Connection Issues**
   - Verify connection string
   - Check IP whitelist
   - Ensure database user has correct permissions

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in `package.json`
   - Check build logs in Vercel dashboard

### Debug Commands
```bash
# Check backend health
curl https://your-backend-domain.vercel.app/health

# Test API endpoint
curl -X POST https://your-backend-domain.vercel.app/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

## 💰 Cost Estimation

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month, 100 serverless function executions/day
- **MongoDB Atlas**: 512MB storage, shared RAM
- **Total Cost**: $0/month for development

### Scaling Up
- **Vercel Pro**: $20/month for more bandwidth and functions
- **MongoDB Atlas**: $9/month for dedicated cluster
- **Total Cost**: ~$29/month for production

## 🎯 Next Steps

1. **Domain Setup**: Add custom domain to Vercel
2. **SSL Certificate**: Automatic with Vercel
3. **CDN**: Automatic with Vercel
4. **Monitoring**: Set up alerts and monitoring
5. **Backup Strategy**: Configure MongoDB Atlas backups

## 📞 Support

- **Vercel Documentation**: https://vercel.com/docs
- **MongoDB Atlas Documentation**: https://docs.atlas.mongodb.com
- **Project Issues**: Create GitHub issues for project-specific problems 