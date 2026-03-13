// ============================================================
//  THE DREAM ABAYA v3 — app.js
//  OTP registration, forgot password, stock logic, email receipts
// ============================================================
require('dotenv').config();
const express  = require('express');
const session  = require('express-session');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const { Resend } = require('resend');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || ''); // Added Resend library
const resend = new Resend(process.env.RESEND_API_KEY || 're_aRKTRD6u_38vQxeEDoF4no3x1WTCK96gJ'); // Initialize Resend

const supabase = createClient(
  process.env.SUPABASE_URL      || 'https://wajbsykeuuitdinccuwd.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhamJzeWtldXVpdGRpbmNjdXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzMzNjUsImV4cCI6MjA4ODQwOTM2NX0._cWYMWTGHUndAkow-MeI5zKGCyHB-Yroi3R_FXXAJUw'
);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.json({ limit: '25mb' }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const SupabaseSessionStore = require('./supabase-session-store');
app.use(session({
  secret: process.env.SESSION_SECRET || 'dream-abaya-royal-secret-2025',
  resave: false,
  saveUninitialized: false,
  store: new SupabaseSessionStore(supabase),
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' }
}));

app.use((req, res, next) => {
  res.locals.user           = req.session.user || null;
  res.locals.isAdmin        = req.session.user?.is_admin || false;
  res.locals.cartCount      = (req.session.cart || []).length;
  res.locals.theme          = req.session.theme || 'dark';
  res.locals.YOCO_PUBLIC_KEY = process.env.YOCO_PUBLIC_KEY || 'pk_test_ed3c54a6gOol69qa7f45';
  next();
});

const MOCK_PRODUCTS = [
  {id:'mock-1', name:'Rania Couture Abaya',price:3200,category:'dream',section:'The Dream Abaya',material:'Japanese Crepe + Hand-Embroidered Silk',sizes:['XS','S','M','L','XL','XXL'],style:'Flared A-Line',colors:['Midnight Black','Champagne Gold'],is_featured:true,in_stock:true,stock_qty:8,description:'An heirloom-worthy masterpiece. Gold threadwork cascades along the hem.',image_url:'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80'},
  {id:'mock-2', name:'Sultana Embroidered Abaya',price:2850,category:'dream',section:'The Dream Abaya',material:'Premium Nida with Satin Lining',sizes:['S','M','L','XL'],style:'Balloon Sleeves',colors:['Ivory White','Dusty Rose'],is_featured:true,in_stock:true,stock_qty:5,description:'Balloon sleeves with intricate floral embroidery.',image_url:'https://images.unsplash.com/photo-1594938298603-c8148c4b4ae8?w=600&q=80'},
  {id:'mock-3', name:'Laylat Al Qadr Abaya',price:4100,category:'dream',section:'The Dream Abaya',material:'100% Pure Silk Chiffon',sizes:['XS','S','M','L','XL'],style:'Layered Cape-Over',colors:['Midnight Navy','Forest Emerald'],is_featured:true,in_stock:true,stock_qty:3,description:'Pure silk chiffon abaya flows like liquid light.',image_url:'https://images.unsplash.com/photo-1617375407633-acd17b655a9b?w=600&q=80'},
  {id:'mock-4', name:'Qamar Bridal Abaya',price:5500,category:'dream',section:'The Dream Abaya',material:'French Lace over Duchess Satin',sizes:['XS','S','M','L','XL','XXL'],style:'Ballgown Cathedral Train',colors:['Antique White','Blush Ivory'],is_featured:false,in_stock:true,stock_qty:2,description:'For the bride who chooses grace.',image_url:'https://images.unsplash.com/photo-1591130901921-b5f1d2ab11c1?w=600&q=80'},
  {id:'mock-5', name:'Zahra Everyday Abaya',price:480,category:'modest',section:'Modest & Beautiful',material:'Scuba Crepe',sizes:['S','M','L','XL','XXL'],style:'Classic Straight Cut',colors:['Black','Navy','Dusty Pink','Sage'],is_featured:true,in_stock:true,stock_qty:20,description:'The abaya every woman needs.',image_url:'https://images.unsplash.com/photo-1592334873219-42e6b9c99d2e?w=600&q=80'},
  {id:'mock-6', name:'Hana Casual Abaya',price:360,category:'modest',section:'Modest & Beautiful',material:'Nida Fabric',sizes:['XS','S','M','L','XL'],style:'Open-Front Kimono',colors:['Black','Caramel','Olive'],is_featured:false,in_stock:true,stock_qty:15,description:'Open-front kimono style for every occasion.',image_url:'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80'},
  {id:'mock-7', name:'Noor Wrap Abaya',price:420,category:'modest',section:'Modest & Beautiful',material:'Jersey Knit',sizes:['S','M','L','XL','XXL'],style:'Wrap Front with Belt',colors:['Charcoal','Plum','Forest Green'],is_featured:false,in_stock:true,stock_qty:12,description:'Jersey knit that moves with you.',image_url:'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80'},
  {id:'mock-8', name:'Safi Minimal Abaya',price:750,category:'aesthetic',section:'Simply Aesthetic',material:'Linen Blend',sizes:['XS','S','M','L','XL'],style:'Oversized Minimalist',colors:['Ecru','Sand','Chalk White'],is_featured:true,in_stock:true,stock_qty:9,description:'Unlined linen blend in earthy tones.',image_url:'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'},
  {id:'mock-9', name:'Baida Linen Co-Ord Set',price:890,category:'aesthetic',section:'Simply Aesthetic',material:'Pure Linen',sizes:['S','M','L','XL'],style:'Wide-Leg + Longline Top',colors:['Oatmeal','Terracotta','French Blue'],is_featured:false,in_stock:true,stock_qty:7,description:'Two-piece pure linen set.',image_url:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80'},
  {id:'mock-10', name:'Silk Satin Hijab',price:220,category:'hijabs',section:'Hijabs & Niqabs',material:'100% Silk Satin',sizes:['Standard (180x75cm)'],style:'Square Scarf',colors:['Black','Ivory','Champagne','Rose'],is_featured:true,in_stock:true,stock_qty:30,description:'The hijab that photographs beautifully.',image_url:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80'},
  {id:'mock-11', name:'Jersey Instant Hijab',price:95,category:'hijabs',section:'Hijabs & Niqabs',material:'Premium Jersey',sizes:['One Size'],style:'Slip-On Instant',colors:['Black','White','Navy','Blush','Grey'],is_featured:false,in_stock:true,stock_qty:50,description:'On in seconds. Premium jersey.',image_url:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80'},
  {id:'mock-12', name:'Chiffon Niqab',price:150,category:'hijabs',section:'Hijabs & Niqabs',material:'Lightweight Chiffon',sizes:['Standard','Extended'],style:'Half-Face with Elastic',colors:['Black','Charcoal','Navy'],is_featured:false,in_stock:true,stock_qty:18,description:'Feather-light chiffon niqab.',image_url:'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=600&q=80'},
  {id:'mock-13', name:'Embroidered Hijab Cap Set',price:310,category:'hijabs',section:'Hijabs & Niqabs',material:'Cotton Lawn + Embroidered Organza',sizes:['One Size'],style:'Bonnet + Overlay Scarf',colors:['White/Gold','Black/Silver'],is_featured:false,in_stock:true,stock_qty:11,description:'Matching bonnet cap and organza overlay.',image_url:'https://images.unsplash.com/photo-1485893226355-3cf62cf5a976?w=600&q=80'},
  {id:'mock-14', name:'Gold Hijab Pins Set',price:85,category:'accessories',section:'Accessories',material:'Gold-Plated Alloy',sizes:['Set of 6'],style:'Gemstone Head Pins',colors:['Gold/Pearl','Gold/Emerald'],is_featured:false,in_stock:true,stock_qty:40,description:'Six jewelled hijab pins.',image_url:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80'},
  {id:'mock-15', name:'Structured Modesty Belt',price:195,category:'accessories',section:'Accessories',material:'Vegan Leather + Gold Hardware',sizes:['XS-S','M-L','XL-XXL'],style:'Wide Obi Belt',colors:['Black/Gold','Tan/Gold','White/Silver'],is_featured:true,in_stock:true,stock_qty:14,description:'Define your silhouette.',image_url:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'},
  {id:'mock-16', name:'Prayer Beads — Oud Wood',price:145,category:'accessories',section:'Accessories',material:'Genuine Oud Wood + Sterling Silver',sizes:['33 Beads','99 Beads'],style:'Tasbih',colors:['Natural Oud','Dark Mahogany'],is_featured:false,in_stock:true,stock_qty:22,description:'Handturned oud wood prayer beads.',image_url:'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80'},
  {id:'mock-17', name:'Modest Clutch Bag',price:380,category:'accessories',section:'Accessories',material:'Satin + Beaded Closure',sizes:['One Size'],style:'Evening Clutch',colors:['Gold','Black','Champagne','Emerald'],is_featured:false,in_stock:true,stock_qty:8,description:'The clutch that turns heads.',image_url:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'},
  {id:'mock-18', name:'Oud Al Layl Perfume Oil',price:420,category:'perfumes',section:'Perfumes',material:'Alcohol-Free Perfume Oil',sizes:['3ml','6ml','12ml'],style:'Oriental Oud',colors:['N/A'],is_featured:true,in_stock:true,stock_qty:25,description:'Oud, amber, and a whisper of rose.',image_url:'https://images.unsplash.com/photo-1543169117-f8b7c8a8c5cb?w=600&q=80'},
  {id:'mock-19', name:'Musk Al Abaya Body Mist',price:185,category:'perfumes',section:'Perfumes',material:'Alcohol-Free Body Mist',sizes:['100ml','200ml'],style:'White Musk',colors:['N/A'],is_featured:false,in_stock:true,stock_qty:30,description:'White musk with sandalwood.',image_url:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80'},
  {id:'mock-20', name:'Bakhoor Gift Set',price:550,category:'perfumes',section:'Perfumes',material:'Oud Chips + Ceramic Burner',sizes:['50g + Burner'],style:'Bakhoor Incense',colors:['N/A'],is_featured:false,in_stock:true,stock_qty:10,description:'Traditional bakhoor in a modern gift set.',image_url:'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80'},
  {id:'mock-21', name:'Rose & Saffron Attar',price:295,category:'perfumes',section:'Perfumes',material:'Pure Attar / Perfume Oil',sizes:['2ml','5ml','10ml'],style:'Floral Oriental',colors:['N/A'],is_featured:false,in_stock:true,stock_qty:17,description:'Persian rose and Kashmir saffron.',image_url:'https://images.unsplash.com/photo-1590156562745-5d3a7a28e2e0?w=600&q=80'},
  {id:'mock-22', name:'Noor Al Sabah Perfume',price:365,category:'perfumes',section:'Perfumes',material:'Eau de Parfum — Alcohol-Free',sizes:['30ml','50ml'],style:'Fresh Floral Musk',colors:['N/A'],is_featured:false,in_stock:true,stock_qty:13,description:'Morning light in a bottle.',image_url:'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80'},
  {id:'mock-23', name:'Amber Oud Eau de Parfum',price:490,category:'perfumes',section:'Perfumes',material:'Eau de Parfum — Alcohol-Free',sizes:['30ml','50ml','100ml'],style:'Warm Oriental',colors:['N/A'],is_featured:true,in_stock:true,stock_qty:8,description:'Deep amber resin and smoky oud.',image_url:'https://images.unsplash.com/photo-1587034782782-c32eea6e4b7a?w=600&q=80'},
  {id:'mock-24', name:'Travel Perfume Discovery Set',price:320,category:'perfumes',section:'Perfumes',material:'6 x 2ml Vials',sizes:['Set of 6'],style:'Discovery Set',colors:['N/A'],is_featured:false,in_stock:true,stock_qty:16,description:'6 x 2ml vials of bestselling scents.',image_url:'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80'},
];

async function getProducts(filters={}) {
  try {
    let q = supabase.from('products').select('*');
    if (filters.category) q = q.eq('category', filters.category);
    if (filters.featured) q = q.eq('is_featured', true);
    if (filters.search)   q = q.ilike('name', '%'+filters.search+'%');
    q = q.order('created_at', { ascending: false });
    const { data, error } = await q;
    if (error || !data || !data.length) {
      let mock = [...MOCK_PRODUCTS];
      if (filters.category) mock = mock.filter(p=>p.category===filters.category);
      if (filters.featured)  mock = mock.filter(p=>p.is_featured);
      if (filters.search)    mock = mock.filter(p=>p.name.toLowerCase().includes(filters.search.toLowerCase()));
      return mock;
    }
    return data;
  } catch { return MOCK_PRODUCTS; }
}

async function getProductById(id) {
  const mock = MOCK_PRODUCTS.find(p=>p.id===id);
  if (mock) return { ...mock, discounts: [], variantStock: {} };
  try {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    if (!data) return null;
    // Attach active discounts
    const now = new Date().toISOString();
    const { data: discounts } = await supabase.from('discounts')
      .select('*').eq('product_id', id)
      .lte('starts_at', now).gte('ends_at', now);
    data.discounts = discounts || [];
    // Attach variant stock as {size__color: qty}
    const { data: variants } = await supabase.from('product_variants')
      .select('*').eq('product_id', id);
    const variantStock = {};
    (variants||[]).forEach(v => { variantStock[`${v.size}__${v.color}`] = v.stock_qty; });
    data.variantStock = variantStock;
    return data;
  } catch(e) { console.error('getProductById error:', e.message); return null; }
}

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login?redirect='+encodeURIComponent(req.path));
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user?.is_admin) return res.status(403).redirect('/');
  next();
}

function generateOTP() { return String(Math.floor(100000 + Math.random() * 900000)); }

// ============================================================
// THE FINAL RESEND FIX FOR APP.JS
// ============================================================
async function sendEmail({ to, subject, html }) {
  try {
    // We use the 'resend' object initialized at the top of your file
    const { data, error } = await resend.emails.send({
      from: 'The Dream Abaya <onboarding@resend.dev>', 
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return false;
    }

    console.log('Email sent successfully! ID:', data.id);
    return true;
  } catch (e) { 
    console.error('System Email error:', e.message); 
    return false; 
  }
}
// Theme
app.post('/theme', (req, res) => {
  req.session.theme = req.body.theme || (req.session.theme==='dark'?'light':'dark');
  res.json({ theme: req.session.theme });
});

// Search API
app.get('/api/search', async (req, res) => {
  const q = (req.query.q||'').trim().toLowerCase();
  if (q.length < 2) return res.json([]);
  const all = await getProducts();
  res.json(all.filter(p=>p.name.toLowerCase().includes(q)||(p.category||'').includes(q)).slice(0,6)
    .map(p=>({id:p.id,name:p.name,price:p.price,category:p.category,image_url:p.image_url})));
});

// Check email availability
app.get('/api/check-availability', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.json({ available: true });
  try {
    const { data } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).single();
    res.json({ available: !data });
  } catch { res.json({ available: true }); }
});

// Home
app.get('/', async (req, res) => {
  const featured = await getProducts({ featured: true });
  const sections = {
    dream:       await getProducts({ category: 'dream' }),
    modest:      await getProducts({ category: 'modest' }),
    aesthetic:   await getProducts({ category: 'aesthetic' }),
    hijabs:      await getProducts({ category: 'hijabs' }),
    accessories: await getProducts({ category: 'accessories' }),
    perfumes:    await getProducts({ category: 'perfumes' })
  };
  res.render('partials/index', { title: 'The Dream Abaya — Awaken the Princess Within', featured, sections, page: 'home' });
});


// Product
app.get('/product/:id', async (req, res) => {
  const product = await getProductById(req.params.id);
  if (!product) return res.status(404).render('partials/404', { title: '404', page: '' });
  const related = (await getProducts({ category: product.category })).filter(p=>p.id!==product.id).slice(0,4);
  res.render('partials/product', { title: product.name+' — The Dream Abaya', product, related, page: 'vault' });
});


// Vault — browse all products
app.get('/vault', async (req, res) => {
  const { category, sort, search } = req.query;
  let products = await getProducts({ category, search });
  if (sort === 'price_asc')  products.sort((a,b) => a.price - b.price);
  if (sort === 'price_desc') products.sort((a,b) => b.price - a.price);
  if (sort === 'newest')     products.reverse();
  res.render('partials/vault', { title: 'The Vault — All Collections', products, activeCategory: category||'all', sort: sort||'', search: search||'', page: 'vault' });
});

// ============================================================
// FULLY RESTORED & BRANDED OTP ROUTE
// ============================================================
app.post('/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: 'Email is required.' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const cleanEmail = email.toLowerCase().trim();

  // Expiration: 10 minutes from now
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  try {
    // 1. Save to Supabase (matching your exact table schema)
    const { error: dbError } = await supabase
      .from('otps')
      .insert([{ 
        email: cleanEmail, 
        code: otp, 
        type: 'registration',
        expires_at: expiresAt.toISOString(),
        user_id: null // Allowed now that we dropped NOT NULL
      }]);

    if (dbError) {
      console.error('Database Save Error:', dbError.message);
      return res.json({ success: false, message: 'Database error. Try again.' });
    }

    // 2. Send Branded Email
    const emailSent = await sendEmail({
      to: cleanEmail,
      subject: '✦ Your Verification Code — The Dream Abaya',
      html: `
        <div style="font-family:'Georgia', serif; background-color:#0D1117; color:#F0EDE8; padding:50px; text-align:center; border:1px solid #C5A059;">
          <h1 style="color:#C5A059; font-size:28px; letter-spacing:3px; text-transform:uppercase;">The Dream Abaya</h1>
          <div style="margin:30px 0; border-top:1px solid rgba(197,160,89,0.2); border-bottom:1px solid rgba(197,160,89,0.2); padding:20px 0;">
            <p style="font-size:16px; font-style:italic;">Your requested verification code is:</p>
            <h1 style="font-size:48px; letter-spacing:12px; color:#F0EDE8; margin:10px 0;">${otp}</h1>
          </div>
          <p style="font-size:12px; color:rgba(240,237,232,0.6);">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `
    });

    if (!emailSent) {
      return res.json({ success: false, message: 'Email service failed. Check Resend key.' });
    }

    // 3. This signal tells register.ejs to move to Step 3 (the OTP screen)
    return res.json({ success: true, message: 'Code sent successfully!' });

  } catch (e) {
    console.error('System Route Error:', e.message);
    return res.json({ success: false, message: 'Server error occurred.' });
  }
});

// ============================================================
// UPDATED VERIFY OTP ROUTE
// ============================================================
app.post('/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.json({ ok: false, success: false, message: 'Missing fields.' });
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = otp.trim();

  try {
    // Look for the most recent registration code for this email
    const { data, error } = await supabase
      .from('otps')
      .select('*')
      .eq('email', cleanEmail)
      .eq('type', 'registration')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return res.json({ ok: false, success: false, message: 'No code found. Please request a new one.' });
    }

    if (data.code !== cleanOtp) {
      return res.json({ ok: false, success: false, message: 'Incorrect code. Please try again.' });
    }

    // Check expiry against expires_at column
    if (new Date(data.expires_at) < new Date()) {
      return res.json({ ok: false, success: false, message: 'Code has expired. Please request a new one.' });
    }

    // ✓ Mark email as verified in session — POST /register checks this
    req.session.otpVerifiedEmail = cleanEmail;

    res.json({ ok: true, success: true });
  } catch (e) {
    console.error('Verify error:', e.message);
    res.json({ ok: false, success: false, message: 'Verification system error.' });
  }
});

// ── REGISTER with OTP ──────────────────────────────────────
app.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('partials/register', { title: 'Join The Palace', error: null, page: 'auth' });
});

app.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  const re = (error) => res.render('partials/register', { title: 'Join The Palace', error, page: 'auth' });
  if (!name||!email||!password) return re('All fields are required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return re('Please enter a valid email address.');
  // Phone: accept +27XXXXXXXXX or 27XXXXXXXXX or 0XXXXXXXXX
  const rawPhone = (phone||'').replace(/\s/g,'');
  const normalPhone = rawPhone.replace(/^\+/,'');
  const localPhone  = normalPhone.startsWith('27') ? '0' + normalPhone.slice(2) : normalPhone;
  if (!/^0[678]\d{8}$/.test(localPhone)) return re('Please provide a valid SA phone number.');
  if (password.length < 8) return re('Password must be at least 8 characters.');
  // Require OTP was verified in this session (inline flow)
  // Fall through gracefully if old flow used
  const otpVerified = req.session.otpVerifiedEmail === email.toLowerCase();
  if (!otpVerified && !req.session.pendingUserId) return re('Please verify your email before creating your account.');
  try {
    const { data: existing } = await supabase.from('users').select('id').eq('email',email.toLowerCase()).single();
    if (existing) return re('An account with this email already exists.');
    const password_hash = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase.from('users')
      .insert([{ name:name.trim(), email:email.toLowerCase(), password_hash, phone:localPhone, is_admin:false, status:'active' }])
      .select().single();
    if (error) throw error;
    // Clean up OTP records (both type names for safety)
    await supabase.from('otps').delete().eq('email', email.toLowerCase());
    delete req.session.otpVerifiedEmail;
    // Include is_admin in session (false for new registrations)
    req.session.user = { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin || false };
    res.redirect('/?welcome=1&name=' + encodeURIComponent(user.name.split(' ')[0]));
  } catch(err) { console.error('Register error:', err); re('Something went wrong. Please try again.'); }
});


app.get('/verify-otp', (req, res) => {
  if (!req.session.pendingUserId) return res.redirect('/register');
  res.render('verify-otp', { title: 'Verify Your Account', error: null, email: req.session.pendingEmail, page: 'auth' });
});

app.post('/verify-otp', async (req, res) => {
  const { otp } = req.body;
  const userId = req.session.pendingUserId;
  if (!userId) return res.redirect('/register');
  try {
    const { data: rec } = await supabase.from('otps').select('*').eq('user_id',userId).eq('code',otp.trim()).eq('type','registration').order('created_at',{ascending:false}).limit(1).single();
    if (!rec) return res.render('verify-otp', { title: 'Verify Your Account', error: 'Invalid code. Please try again.', email: req.session.pendingEmail, page: 'auth' });
    if (new Date(rec.expires_at) < new Date()) return res.render('verify-otp', { title: 'Verify Your Account', error: 'Code expired. Please register again.', email: req.session.pendingEmail, page: 'auth' });
    await supabase.from('users').update({ status:'active' }).eq('id', userId);
    await supabase.from('otps').delete().eq('id', rec.id);
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    req.session.user = { id:user.id, name:user.name, email:user.email, is_admin:user.is_admin };
    delete req.session.pendingUserId; delete req.session.pendingEmail;
    res.redirect('/?welcome=1&name='+encodeURIComponent(user.name.split(' ')[0]));
  } catch { res.render('verify-otp', { title: 'Verify Your Account', error: 'Verification failed. Try again.', email: req.session.pendingEmail, page: 'auth' }); }
});

app.post('/resend-otp', async (req, res) => {
  const userId = req.session.pendingUserId; const email = req.session.pendingEmail;
  if (!userId) return res.json({ success: false });
  const otp = generateOTP(); const expires_at = new Date(Date.now()+10*60*1000).toISOString();
  await supabase.from('otps').delete().eq('user_id',userId).eq('type','registration');
  await supabase.from('otps').insert([{ user_id:userId, code:otp, expires_at, type:'registration' }]);
  await sendEmail({ to:email, subject:'✦ New Verification Code', html:`<div style="font-family:Georgia,serif;background:#0D1117;color:#F0EDE8;padding:40px;border:1px solid rgba(197,160,89,.3)"><h2 style="color:#C5A059">New Code</h2><p style="font-size:3em;letter-spacing:.4em;color:#C5A059;font-family:monospace">${otp}</p><p style="color:#6B6560;font-size:12px">Expires in 10 minutes.</p></div>` });
  res.json({ success: true });
});

// ── LOGIN ──────────────────────────────────────────────────
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  const resetMsg = req.query.reset ? 'Password reset successful. Please sign in.' : null;
  res.render('partials/login', { title: 'Enter The Palace', error: null, success: resetMsg, redirect: req.query.redirect||'/', page: 'auth' });
});

app.post('/login', async (req, res) => {
  const { email, password, redirect } = req.body;
  try {
    const { data: user } = await supabase.from('users').select('*').eq('email',email.toLowerCase()).single();
    if (!user) return res.render('partials/login', { title:'Enter The Palace', error:'Invalid email or password.', success:null, redirect:redirect||'/', page:'auth' });
    if (user.status==='pending') { req.session.pendingUserId=user.id; req.session.pendingEmail=user.email; return res.redirect('/verify-otp'); }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.render('partials/login', { title:'Enter The Palace', error:'Invalid email or password.', success:null, redirect:redirect||'/', page:'auth' });
    req.session.user = { id:user.id, name:user.name, email:user.email, is_admin:Boolean(user.is_admin) };
    // Save session explicitly before redirect so is_admin is persisted
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      let dest;
      if (user.is_admin) {
        dest = '/admin'; // Admin always goes to dashboard
      } else if (redirect && redirect !== '/') {
        dest = redirect;
      } else {
        dest = '/?welcome=1&name=' + encodeURIComponent(user.name.split(' ')[0]);
      }
      res.redirect(dest);
    });
  } catch(e) { console.error('Login error:', e); res.render('partials/login', { title:'Enter The Palace', error:'Something went wrong.', success:null, redirect:redirect||'/', page:'auth' }); }
});

// ── DEBUG SESSION (remove in production) ──────────────────
app.get('/debug-session', (req, res) => {
  res.json({ user: req.session.user || null, isAdmin: req.session.user?.is_admin || false });
});

app.post('/logout', (req, res) => { req.session.destroy(()=>res.redirect('/?bye=1')); });

// ── FORGOT / RESET PASSWORD ────────────────────────────────
app.get('/forgot-password', (req, res) => res.render('forgot-password', { title:'Reset Password', error:null, success:null, page:'auth' }));

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const re = (error,success) => res.render('forgot-password',{title:'Reset Password',error,success,page:'auth'});
  if (!email) return re('Please enter your email address.', null);
  try {
    const { data: user } = await supabase.from('users').select('id,name,email').eq('email',email.toLowerCase()).single();
    if (!user) return re(null,'If that email is registered, a reset link has been sent.');
    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now()+60*60*1000).toISOString();
    await supabase.from('otps').delete().eq('user_id',user.id).eq('type','password_reset');
    await supabase.from('otps').insert([{ user_id:user.id, code:token, expires_at, type:'password_reset' }]);
    const link = (process.env.BASE_URL||'http://localhost:3000')+'/reset-password?token='+token+'&uid='+user.id;
    await sendEmail({ to:user.email, subject:'✦ Reset Your Dream Abaya Password',
      html:`<div style="font-family:Georgia,serif;max-width:500px;background:#0D1117;color:#F0EDE8;padding:40px;border:1px solid rgba(197,160,89,.3)"><h2 style="color:#C5A059">Reset Password</h2><p style="color:#A9A29A">Hello ${user.name.split(' ')[0]}, click below to reset your password.</p><div style="text-align:center;padding:24px 0"><a href="${link}" style="display:inline-block;padding:14px 36px;background:#C5A059;color:#000;text-decoration:none;font-family:Georgia;letter-spacing:.12em;font-size:14px">Reset My Password</a></div><p style="color:#6B6560;font-size:11px">Expires in 1 hour. If you didn't request this, ignore this email.</p></div>` });
    re(null,'A reset link has been sent to your email address.');
  } catch { re('Something went wrong. Please try again.', null); }
});

app.get('/reset-password', async (req, res) => {
  const { token, uid } = req.query;
  if (!token||!uid) return res.redirect('/forgot-password');
  const { data: rec } = await supabase.from('otps').select('*').eq('user_id',uid).eq('code',token).eq('type','password_reset').single();
  if (!rec||new Date(rec.expires_at)<new Date()) return res.render('forgot-password',{title:'Reset Password',error:'This reset link has expired.',success:null,page:'auth'});
  res.render('reset-password', { title:'Set New Password', error:null, token, uid, page:'auth' });
});

app.post('/reset-password', async (req, res) => {
  const { token, uid, password, confirm_password } = req.body;
  const re = (error) => res.render('reset-password',{title:'Set New Password',error,token,uid,page:'auth'});
  if (!password||password.length<8) return re('Password must be at least 8 characters.');
  if (password!==confirm_password) return re('Passwords do not match.');
  try {
    const { data: rec } = await supabase.from('otps').select('*').eq('user_id',uid).eq('code',token).eq('type','password_reset').single();
    if (!rec||new Date(rec.expires_at)<new Date()) return re('Reset link expired.');
    const password_hash = await bcrypt.hash(password,10);
    await supabase.from('users').update({ password_hash }).eq('id',uid);
    await supabase.from('otps').delete().eq('id',rec.id);
    res.redirect('/login?reset=1');
  } catch { re('Something went wrong.'); }
});

// Profile update
app.post('/profile/update', requireAuth, async (req, res) => {
  const { name, current_password, new_password } = req.body;
  try {
    if (name&&name.trim()) { await supabase.from('users').update({name:name.trim()}).eq('id',req.session.user.id); req.session.user.name=name.trim(); }
    if (current_password&&new_password) {
      const { data: u } = await supabase.from('users').select('password_hash').eq('id',req.session.user.id).single();
      const valid = await bcrypt.compare(current_password,u.password_hash);
      if (!valid) return res.json({success:false,error:'Current password is incorrect.'});
      if (new_password.length<8) return res.json({success:false,error:'Password must be at least 8 characters.'});
      await supabase.from('users').update({password_hash:await bcrypt.hash(new_password,10)}).eq('id',req.session.user.id);
    }
    res.json({ success:true, name:req.session.user.name });
  } catch { res.json({success:false,error:'Update failed.'}); }
});

// Cart
app.get('/cart', (req,res) => { const cart=req.session.cart||[]; res.render('partials/cart',{title:'Your Cart',cart,total:cart.reduce((s,i)=>s+i.price*i.qty,0),page:'cart'}); });
app.post('/cart/add', async (req,res) => {
  // Must be logged in to add to cart
  if (!req.session.user) return res.json({ success: false, requireLogin: true });
  const {product_id,qty=1,size,color}=req.body; const product=await getProductById(product_id);
  if (!product) return res.json({success:false});
  if (!req.session.cart) req.session.cart=[];
  const ex=req.session.cart.find(i=>i.id===product_id&&i.size===size); const max=product.stock_qty||99;
  if (ex) ex.qty=Math.min(ex.qty+parseInt(qty),max);
  else req.session.cart.push({id:product_id,name:product.name,price:product.price,image_url:product.image_url,qty:Math.min(parseInt(qty),max),size,color,stock_qty:max});
  res.json({success:true,cartCount:req.session.cart.length});
});
app.post('/cart/remove',(req,res)=>{ const{product_id,size}=req.body; req.session.cart=(req.session.cart||[]).filter(i=>!(i.id===product_id&&i.size===size)); res.json({success:true,cartCount:req.session.cart.length}); });
app.post('/cart/update',(req,res)=>{ const{product_id,size,qty}=req.body; const item=(req.session.cart||[]).find(i=>i.id===product_id&&i.size===size); if(item)item.qty=Math.max(1,Math.min(parseInt(qty),item.stock_qty||99)); res.json({success:true}); });

// Place order
app.post('/order/place', requireAuth, async (req,res) => {
  const {customer_name,customer_email,customer_phone,delivery_address,notes}=req.body;
  const cart=req.session.cart||[];
  if (!cart.length) return res.redirect('/cart');
  try {
    const orderId='TDA-'+Date.now().toString(36).toUpperCase();
    const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
    for (const item of cart) {
      await supabase.from('orders').insert([{ id:orderId+'-'+item.id.slice(-4), product_id:item.id.startsWith('mock-')?null:item.id, user_id:req.session.user.id, customer_name,customer_email,customer_phone,delivery_address, total_price:item.price*item.qty, status:'Pending', notes, product_name:item.name, product_price:item.price, product_size:item.size, product_color:item.color, qty:item.qty }]);
      if (!item.id.startsWith('mock-')) {
        const { data:p } = await supabase.from('products').select('stock_qty').eq('id',item.id).single();
        if (p&&p.stock_qty>0) await supabase.from('products').update({stock_qty:Math.max(0,p.stock_qty-item.qty)}).eq('id',item.id);
      }
    }
    const rows=cart.map(i=>`<tr><td style="padding:10px;border-bottom:1px solid rgba(197,160,89,.15);color:#F0EDE8">${i.name}</td><td style="padding:10px;border-bottom:1px solid rgba(197,160,89,.15);color:#A9A29A;text-align:center">${i.size||'—'}</td><td style="padding:10px;border-bottom:1px solid rgba(197,160,89,.15);color:#A9A29A;text-align:center">×${i.qty}</td><td style="padding:10px;border-bottom:1px solid rgba(197,160,89,.15);color:#C5A059;text-align:right">R${(i.price*i.qty).toLocaleString('en-ZA')}</td></tr>`).join('');
    await sendEmail({to:customer_email,subject:'✦ Order Confirmed — '+orderId,
      html:`<div style="font-family:Georgia,serif;max-width:600px;background:#0D1117;color:#F0EDE8;padding:40px;border:1px solid rgba(197,160,89,.3)"><h1 style="color:#C5A059;text-align:center;letter-spacing:.15em">✦ The Dream Abaya ✦</h1><p style="color:#A9A29A;text-align:center;font-size:12px">ORDER CONFIRMATION — ${orderId}</p><p>Dear <strong>${customer_name}</strong>, thank you for your order.</p><table style="width:100%;border-collapse:collapse;margin:20px 0"><thead><tr style="border-bottom:2px solid rgba(197,160,89,.3)"><th style="padding:10px;color:#C5A059;text-align:left">ITEM</th><th style="padding:10px;color:#C5A059;text-align:center">SIZE</th><th style="padding:10px;color:#C5A059;text-align:center">QTY</th><th style="padding:10px;color:#C5A059;text-align:right">TOTAL</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="3" style="padding:14px 10px;color:#C5A059">ORDER TOTAL</td><td style="padding:14px 10px;color:#C5A059;font-size:18px;text-align:right">R${total.toLocaleString('en-ZA')}</td></tr></tfoot></table><div style="background:rgba(197,160,89,.06);border:1px solid rgba(197,160,89,.2);padding:18px;margin:20px 0"><p style="color:#C5A059;font-size:11px;letter-spacing:.1em;margin:0 0 6px">DELIVERY ADDRESS</p><p style="color:#F0EDE8;margin:0">${delivery_address}</p></div><p style="color:#6B6560;font-size:11px;text-align:center">✦ Made with love in South Africa ✦</p></div>`});
    req.session.cart=[];
    res.render('order-success',{title:'Order Placed!',orderId,total,page:'cart'});
  } catch(err) { console.error(err); res.redirect('/cart?error=1'); }
});

// Wishlist
// Wishlist — now also fetches featured products as suggestions for empty state
app.get('/wishlist', async (req,res) => {
  const ids = req.session.wishlist || [];
  const products = await Promise.all(ids.map(id => getProductById(id)));
  // Fetch up to 4 featured/in-stock products as "you may like" suggestions
  const allProducts = await getProducts({ featured: true });
  const suggested = allProducts.filter(p => !ids.includes(p.id) && p.in_stock !== false).slice(0, 4);
  res.render('partials/wishlist', {
    title: 'My Wishlist',
    products: products.filter(Boolean),
    suggested, // passed to template for empty state
    page: 'wishlist'
  });
});
app.post('/wishlist/toggle',(req,res) => { const{product_id}=req.body; if(!req.session.wishlist)req.session.wishlist=[]; const idx=req.session.wishlist.indexOf(product_id); if(idx>-1){req.session.wishlist.splice(idx,1);res.json({success:true,action:'removed',count:req.session.wishlist.length});}else{req.session.wishlist.push(product_id);res.json({success:true,action:'added',count:req.session.wishlist.length});} });

// Track order
app.get('/track',(req,res)=>res.render('partials/track',{title:'Track Order',order:null,searchId:'',error:null,page:'track',user:req.session.user}));
app.post('/track', async (req,res) => {
  const {order_id}=req.body; const currentUser=req.session.user;
  const trimId=(order_id||'').trim().toUpperCase();
  if (!trimId) return res.render('partials/track',{title:'Track Order',order:null,searchId:'',error:'Please enter an order ID.',page:'track',user:currentUser});
  try {
    let order=null;
    const {data:o1}=await supabase.from('orders').select('*').eq('id',trimId).single();
    if (o1) order=o1;
    else { const {data:o2}=await supabase.from('orders').select('*').ilike('id',trimId+'%').limit(1); order=o2&&o2[0]; }
    if (!order) return res.render('partials/track',{title:'Track Order',order:null,searchId:order_id,error:'No order found with that ID. Please check and try again.',page:'track',user:currentUser});
    if (currentUser&&order.customer_email&&order.customer_email!==currentUser.email) return res.render('partials/track',{title:'Track Order',order:null,searchId:order_id,error:'This order belongs to a different account.',page:'track',user:currentUser});
    res.render('partials/track',{title:'Track Order',order,searchId:order_id,error:null,page:'track',user:currentUser});
  } catch { res.render('partials/track',{title:'Track Order',order:null,searchId:order_id,error:'Unable to look up order. Please try again.',page:'track',user:currentUser}); }
});

// ── ADMIN ──────────────────────────────────────────────────
// ── ONE-TIME ADMIN SETUP — visit /setup-admin?secret=YOUR_SECRET ──
app.get('/setup-admin', async (req, res) => {
  const secret = req.query.secret || '';
  const expectedSecret = process.env.SETUP_SECRET || 'dream-palace-setup-2025';
  if (secret !== expectedSecret) return res.status(403).send('Forbidden — wrong secret');
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@thedreamabaya.co.za';
    const adminPassword = 'DreamPalace@2025!';
    const adminName = 'Palace Admin';
    const { data: existing } = await supabase.from('users').select('id,is_admin,email').eq('email', adminEmail).single();
    if (existing) {
      const password_hash = await bcrypt.hash(adminPassword, 10);
      await supabase.from('users').update({ is_admin: true, status: 'active', password_hash }).eq('id', existing.id);
      return res.send(`<pre style="font-family:monospace;background:#0D1117;color:#C5A059;padding:40px;font-size:14px">
✦ Admin account updated successfully!
─────────────────────────────────────
Email:    ${adminEmail}
Password: ${adminPassword}
is_admin: true ✓ (forced)
Status:   active ✓ (forced)
─────────────────────────────────────
Password hash has been reset.
<a href="/login" style="color:#C5A059">→ Go to login</a>
</pre>`);
    }
    const password_hash = await bcrypt.hash(adminPassword, 10);
    await supabase.from('users').insert([{ name: adminName, email: adminEmail, password_hash, is_admin: true, status: 'active' }]);
    return res.send(`<pre style="font-family:monospace;background:#0D1117;color:#C5A059;padding:40px;font-size:14px">
✦ Admin account created!
─────────────────────────────────────
Email:    ${adminEmail}
Password: ${adminPassword}
─────────────────────────────────────
⚠  Change your password after first login!
<a href="/login" style="color:#C5A059">→ Go to login</a>
</pre>`);
  } catch(err) {
    return res.status(500).send('Error: ' + err.message);
  }
});

// ── AI: describe product from image ──────────────────────────────
// Accepts either: multipart file upload OR JSON with imageUrl
app.post('/admin/ai-describe', requireAdmin, upload.single('imageFile'), async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ name: '', description: 'Set GEMINI_API_KEY in your .env file to enable AI descriptions.' });
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    let imagePart;
    if (req.file) {
      // Uploaded file via multipart
      imagePart = { inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype } };
    } else {
      const imageUrl = req.body?.imageUrl;
      if (!imageUrl) return res.json({ name: '', description: 'No image provided. Add a URL or upload a file.' });
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) return res.json({ name: '', description: 'Could not fetch image from URL.' });
      const buffer = await imgRes.arrayBuffer();
      const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
      imagePart = { inlineData: { data: Buffer.from(buffer).toString('base64'), mimeType } };
    }
    const prompt = 'You are a luxury abaya and modest fashion product copywriter for a South African boutique called The Dream Abaya. Analyse this product image carefully. Return ONLY valid JSON (no markdown, no extra text) in this exact shape: {"name": "short evocative product name max 6 words", "description": "2-3 sentence luxury description focusing on fabric style and occasion"} Be specific: for abayas describe cut embroidery sleeve style, for perfumes describe scent profile, for accessories describe material and finish.';
    const result = await model.generateContent([prompt, imagePart]);
    const raw = result.response.text().replace(/```json|```/g, '').trim();
    // Be resilient — extract JSON even if model adds extra text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.json({ name: '', description: raw });
    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch(e) {
    console.error('AI describe error:', e.message);
    res.json({ name: '', description: 'AI error: ' + e.message });
  }
});

// ── Serve rendered product-form HTML for edit modal ───────────────
app.get('/admin/product-form-html/:id', requireAdmin, async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).send('Product not found');
    res.render('admin/product-form', { p: product, colorToHex: (c) => {
      const map = {'black':'#000000','white':'#ffffff','ivory':'#FFFFF0','champagne gold':'#C5A059','gold':'#C5A059','dusty rose':'#DCAE96','blush':'#F9CADA','navy':'#001F5B','midnight navy':'#001F5B','forest emerald':'#1C6B4A','sage green':'#8FAF7E','ecru':'#C2B280','sand':'#C2A97D','charcoal':'#3C3C3C','plum':'#7B2D8B','forest green':'#228B22','caramel':'#C67946','olive':'#5D6914','oatmeal':'#D6C7A8','terracotta':'#C25E3C','french blue':'#4F6D8E','rose':'#FF007F','grey':'#808080','n/a':'#555555'};
      return map[(c||'').toLowerCase()]||'#C5A059';
    }});
  } catch(e) { res.status(500).send('Error: ' + e.message); }
});

// ── Create product — handle variants + discounts ──────────────────
// (overrides the simple route below)


// ── Cart checkout (multi-item) — Yoco Redirect Flow ──────────────
app.post('/payment/cart-checkout', async (req, res) => {
  console.log('Cart checkout hit — body:', JSON.stringify(req.body).slice(0, 200));
  const { amountCents, items, customer_name, customer_email, customer_phone, delivery_address, notes } = req.body;
  if (!amountCents || !items?.length) {
    console.log('Missing fields — amountCents:', amountCents, 'items:', items?.length);
    return res.json({ success: false, message: 'Missing required checkout fields.' });
  }
  try {
    const yocoRes = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.YOCO_SECRET_KEY,
        'Content-Type': 'application/json',
        'Idempotency-Key': Date.now().toString()
      },
      body: JSON.stringify({
        amount:     amountCents,
        currency:   'ZAR',
        successUrl: (process.env.BASE_URL || 'http://localhost:3000') + '/order-success',
        cancelUrl:  (process.env.BASE_URL || 'http://localhost:3000') + '/cart',
        metadata:   { customer_name, customer_email, customer_phone, delivery_address, notes }
      })
    });
    const yocoData = await yocoRes.json();
    console.log('Yoco response:', JSON.stringify(yocoData));
    if (!yocoData.redirectUrl) {
      return res.json({ success: false, message: yocoData.displayMessage || yocoData.message || 'Payment setup failed.' });
    }
    // Store pending order in session — fulfilled on /order-success
    req.session.pendingOrder = { amountCents, items, customer_name, customer_email, customer_phone, delivery_address, notes };
    req.session.save();
    res.json({ success: true, redirectUrl: yocoData.redirectUrl });
  } catch(e) {
    console.error('Cart checkout error:', e.message);
    res.json({ success: false, message: 'Checkout error. Please try again.' });
  }
});

// ── Discounts tab: list all ──────────────────────────────────────
app.get('/admin/discounts-data', requireAdmin, async (req, res) => {
  try {
    const { data } = await supabase
      .from('discounts')
      .select('*, products(id, name, category, sizes, colors)')
      .order('ends_at', { ascending: true });
    res.json({ success: true, discounts: data || [] });
  } catch(e) { res.json({ success: true, discounts: [] }); }
});
// ── Discounts tab: get variants for a product ────────────────────
app.get('/admin/product-variants/:id', requireAdmin, async (req, res) => {
  try {
    const { data: variants } = await supabase
      .from('product_variants').select('size, color, stock_qty')
      .eq('product_id', req.params.id).gt('stock_qty', 0).order('size');
    const { data: prod } = await supabase
      .from('products').select('sizes, colors, name').eq('id', req.params.id).single();
    res.json({ success: true, variants: variants || [], product: prod || {} });
  } catch(e) { res.json({ success: false, variants: [], product: {} }); }
});
// ── Discounts tab: save (create or update) ───────────────────────
app.post('/admin/discounts/save', requireAdmin, async (req, res) => {
  const { product_id, size, color, percent_off, starts_at, ends_at, discount_id } = req.body;
  if (!product_id || !percent_off || !ends_at)
    return res.json({ success: false, message: 'Product, % off and end date are required.' });
  try {
    const row = {
      product_id,
      size:        size  || null,
      color:       color || null,
      percent_off: parseFloat(percent_off),
      starts_at:   starts_at ? new Date(starts_at).toISOString() : new Date().toISOString(),
      ends_at:     new Date(ends_at).toISOString(),
    };
    if (discount_id) {
      await supabase.from('discounts').update(row).eq('id', discount_id);
    } else {
      await supabase.from('discounts').insert([row]);
    }
    res.json({ success: true });
  } catch(e) { res.json({ success: false, message: e.message }); }
});
// ── Discounts tab: delete ────────────────────────────────────────
app.post('/admin/discounts/delete/:id', requireAdmin, async (req, res) => {
  try {
    await supabase.from('discounts').delete().eq('id', req.params.id);
    res.json({ success: true });
  } catch(e) { res.json({ success: false, message: e.message }); }
});

app.get('/admin', requireAdmin, async (req,res) => {
  const products=await getProducts();
  const {data:orders}=await supabase.from('orders').select('*').order('created_at',{ascending:false}).limit(50);
  const {data:users}=await supabase.from('users').select('id,name,email,created_at,is_admin,status,phone').order('created_at',{ascending:false}).limit(50);
  res.render('admin/dashboard',{title:'Admin Command Center',products,orders:orders||[],users:users||[],page:'admin',query:req.query});
});
app.post('/admin/products/create', requireAdmin, async (req,res) => {
  const { name, description, price, category, image_url, image_base64, material, sizes, style, colors, is_featured, in_stock, variants_json } = req.body;
  const toArr = v => Array.isArray(v) ? v.filter(Boolean) : (v ? String(v).split(',').map(s=>s.trim()).filter(Boolean) : []);
  const sizesArr  = toArr(sizes);
  const colorsArr = toArr(colors);
  // Handle image — base64 upload or URL
  let finalImageUrl = image_url || null;
  // (base64 upload stored in DB as-is for now; in production upload to storage bucket)
  if (!finalImageUrl && image_base64) finalImageUrl = image_base64;
  const { data: prod, error } = await supabase.from('products')
    .insert([{ name, description, price: parseFloat(price), category, image_url: finalImageUrl, material: material||null, sizes: sizesArr, style: style||null, colors: colorsArr, is_featured: is_featured==='on', in_stock: in_stock!=='off', stock_qty: 0 }])
    .select().single();
  if (error || !prod) { console.error('Create product error:', error); return res.redirect('/admin?error=Create+failed&tab=add'); }
  // Save variants
  await saveVariants(prod.id, variants_json);
  // Save discounts
  await saveDiscounts(prod.id, req.body);
  res.redirect('/admin?success=Product+created&tab=products');
});
app.post('/admin/products/update/:id', requireAdmin, async (req,res) => {
  const id = req.params.id;
  const { name, description, price, category, image_url, image_base64, material, sizes, style, colors, is_featured, in_stock, variants_json } = req.body;
  const toArr = v => Array.isArray(v) ? v.filter(Boolean) : (v ? String(v).split(',').map(s=>s.trim()).filter(Boolean) : []);
  const sizesArr  = toArr(sizes);
  const colorsArr = toArr(colors);
  let finalImageUrl = image_url || null;
  if (!finalImageUrl && image_base64) finalImageUrl = image_base64;
  await supabase.from('products').update({ name, description, price: parseFloat(price), category, image_url: finalImageUrl, material: material||null, sizes: sizesArr, style: style||null, colors: colorsArr, is_featured: is_featured==='on', in_stock: in_stock!=='off' }).eq('id', id);
  await saveVariants(id, variants_json);
  await saveDiscounts(id, req.body);
  res.redirect('/admin?success=Product+updated&tab=products');
});
app.post('/admin/products/delete/:id', requireAdmin, async (req,res) => { await supabase.from('products').delete().eq('id',req.params.id); res.redirect('/admin?success=Product+deleted&tab=products'); });
app.post('/admin/orders/update/:id', requireAdmin, async (req,res) => {
  const{status}=req.body;
  const{data:order}=await supabase.from('orders').select('*').eq('id',req.params.id).single();
  await supabase.from('orders').update({status}).eq('id',req.params.id);
  const msgs={'Confirmed':'Your order has been confirmed.','In Production':'Your order is being crafted.','Shipped':'Your order is on its way!','Delivered':'Your order has been delivered. ✦'};
  if (order&&order.customer_email&&msgs[status]) await sendEmail({to:order.customer_email,subject:'✦ Order Update — '+req.params.id,html:`<div style="font-family:Georgia,serif;background:#0D1117;color:#F0EDE8;padding:40px;border:1px solid rgba(197,160,89,.3)"><h2 style="color:#C5A059">Order Update</h2><p style="color:#A9A29A">Order: <strong style="color:#F0EDE8">${req.params.id}</strong></p><div style="background:rgba(197,160,89,.08);border-left:3px solid #C5A059;padding:16px;margin:20px 0"><p style="color:#F0EDE8;margin:0">${msgs[status]}</p></div></div>`});
  res.redirect('/admin?success=Order+updated&tab=orders');
});
app.post('/admin/orders/update-status', requireAdmin, async (req,res) => { const{order_id,status}=req.body; await supabase.from('orders').update({status}).eq('id',order_id); res.json({success:true}); });
app.get('/admin/create-staff', requireAdmin, (req,res) => res.render('admin/create-staff',{title:'Create Staff Account',error:null,success:null,page:'admin'}));
app.post('/admin/create-staff', requireAdmin, async (req,res) => {
  const{name,email,password,phone,role}=req.body;
  const re=(error,success)=>res.render('admin/create-staff',{title:'Create Staff Account',error,success,page:'admin'});
  if (!name||!email||!password) return re('All fields required.',null);
  const cleanPhone=(phone||'').replace(/\s/g,'');
  if (phone&&!/^0\d{9}$/.test(cleanPhone)) return re('Phone must be 10 digits starting with 0.',null);
  try {
    const{data:ex}=await supabase.from('users').select('id').eq('email',email.toLowerCase()).single();
    if (ex) return re('Email already exists.',null);
    const password_hash=await bcrypt.hash(password,10);
    await supabase.from('users').insert([{name,email:email.toLowerCase(),password_hash,phone:cleanPhone||null,is_admin:role==='admin',status:'active'}]);
    re(null,`Staff account for ${name} created successfully.`);
  } catch { re('Failed to create account.',null); }
});
app.post('/admin/orders/resend-receipt/:id', requireAdmin, async (req,res) => {
  const{data:order}=await supabase.from('orders').select('*').eq('id',req.params.id).single();
  if (!order) return res.json({success:false});
  await sendEmail({to:order.customer_email,subject:'✦ Receipt — '+order.id,html:`<div style="font-family:Georgia,serif;background:#0D1117;color:#F0EDE8;padding:40px;border:1px solid rgba(197,160,89,.3)"><h2 style="color:#C5A059">Order Receipt</h2><p>Order ID: ${order.id}</p><p>Total: R${Number(order.total_price).toLocaleString('en-ZA')}</p><p>Status: ${order.status}</p></div>`});
  res.json({success:true});
});

// ── Helper: save variants ────────────────────────────────────────
async function saveVariants(productId, variantsJson) {
  if (!variantsJson) return;
  try {
    const variants = JSON.parse(variantsJson);
    // Upsert each variant
    for (const [key, qty] of Object.entries(variants)) {
      const [size, color] = key.split('__');
      if (!size) continue;
      await supabase.from('product_variants').upsert(
        { product_id: productId, size, color: color||'', stock_qty: parseInt(qty)||0 },
        { onConflict: 'product_id,size,color' }
      );
    }
  } catch(e) { console.error('saveVariants error:', e.message); }
}

// ── Helper: save discounts ───────────────────────────────────────
async function saveDiscounts(productId, body) {
  try {
    const sizes   = [].concat(body['disc_size[]']   || []);
    const colors  = [].concat(body['disc_color[]']  || []);
    const pcts    = [].concat(body['disc_pct[]']    || []);
    const starts  = [].concat(body['disc_starts[]'] || []);
    const ends    = [].concat(body['disc_ends[]']   || []);
    if (!pcts.length) return;
    // Delete existing and re-insert
    await supabase.from('discounts').delete().eq('product_id', productId);
    const rows = pcts.map((pct, i) => ({
      product_id: productId,
      size:       sizes[i]  || null,
      color:      colors[i] || null,
      percent_off: parseFloat(pct),
      starts_at:  starts[i] ? new Date(starts[i]).toISOString() : new Date().toISOString(),
      ends_at:    ends[i]   ? new Date(ends[i]).toISOString()   : new Date(Date.now()+7*24*60*60*1000).toISOString(),
    })).filter(r => r.percent_off > 0);
    if (rows.length) await supabase.from('discounts').insert(rows);
  } catch(e) { console.error('saveDiscounts error:', e.message); }
}

// ── Deduct variant stock on successful order ─────────────────────
async function deductVariantStock(productId, size, color, qty) {
  if (!productId || productId.startsWith('mock')) return;
  try {
    const { data: v } = await supabase.from('product_variants')
      .select('id,stock_qty').eq('product_id', productId)
      .eq('size', size||'').eq('color', color||'').single();
    if (v && v.stock_qty > 0) {
      await supabase.from('product_variants')
        .update({ stock_qty: Math.max(0, v.stock_qty - qty) }).eq('id', v.id);
    }
    // Also deduct global stock
    const { data: p } = await supabase.from('products').select('stock_qty').eq('id', productId).single();
    if (p && p.stock_qty > 0) {
      await supabase.from('products').update({ stock_qty: Math.max(0, p.stock_qty - qty) }).eq('id', productId);
    }
  } catch(e) { console.error('deductVariantStock error:', e.message); }
}

// ── YOCO payment gateway ─────────────────────────────────────────
app.post('/payment/checkout', async (req, res) => {
  const { token, amountCents, product_id, product_name, size, color,
          customer_name, customer_email, customer_phone, delivery_address } = req.body;
  if (!token || !amountCents) return res.json({ success: false, message: 'Missing payment details.' });
  try {
    // Charge via Yoco REST API
    const yocoRes = await fetch('https://online.yoco.com/v1/charges/', {
      method: 'POST',
      headers: {
        'X-Auth-Secret-Key': process.env.YOCO_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, amountInCents: amountCents, currency: 'ZAR' })
    });
    const charge = await yocoRes.json();
    if (charge.status !== 'successful') {
      return res.json({ success: false, message: charge.displayMessage || 'Payment declined.' });
    }
    // Create order
    const orderId = 'TDA-' + Date.now().toString(36).toUpperCase();
    await supabase.from('orders').insert([{
      id: orderId, product_id: product_id||null,
      user_id: req.session.user?.id || null,
      customer_name, customer_email, customer_phone, delivery_address,
      total_price: amountCents / 100, status: 'Confirmed',
      payment_status: 'paid', payment_ref: charge.id,
      product_name, product_price: amountCents/100,
      product_size: size, product_color: color, qty: 1,
    }]);
    // Deduct stock
    await deductVariantStock(product_id, size, color, 1);
    // Save payment record
    await supabase.from('payments').insert([{
      order_id: orderId, user_id: req.session.user?.id || null,
      amount_cents: amountCents, status: 'paid',
      gateway: 'yoco', gateway_ref: charge.id
    }]);
    // Send confirmation email
    const orderBody = `<div style="text-align:center;margin-bottom:20px"><h2 style="color:#F0EDE8;font-weight:400">Order Confirmed ✦</h2><p style="color:rgba(197,160,89,.6)">${orderId}</p></div>
    <p style="color:rgba(240,237,232,.65)">Thank you <strong style="color:#F0EDE8">${customer_name.split(' ')[0]}</strong>! Your payment of <strong style="color:#C5A059">R${(amountCents/100).toLocaleString('en-ZA')}</strong> was successful.</p>
    <p style="color:rgba(240,237,232,.5);font-size:13px;margin-top:16px">Item: ${product_name}${size ? ' · '+size : ''}${color ? ' · '+color : ''}</p>`;
    await sendEmail({ to: customer_email, subject: '✦ Order Confirmed — ' + orderId, html: emailWrapper(orderBody) });
    res.json({ success: true, orderId });
  } catch(e) {
    console.error('Payment error:', e);
    res.json({ success: false, message: 'Payment processing error.' });
  }
});

// ── Inject YOCO_PUBLIC_KEY into product page ─────────────────────
// (already in res.locals, but also expose as window var via script)


app.use((req,res)=>res.status(404).render('partials/404',{title:'404 — Not Found',page:''}));
app.listen(PORT,()=>console.log('\n👑  The Dream Abaya v3 LIVE → http://localhost:'+PORT+'\n'));