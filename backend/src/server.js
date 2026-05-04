const express = require('express');
const cors = require('cors');
const path = require('path');

const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const priceRoutes = require('./routes/priceRoutes');
const newsRoutes = require('./routes/newsRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const publicDir = path.resolve(__dirname, '../../public');
const PORT = env.PORT;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/prices', priceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/messages', messageRoutes);

app.use(express.static(publicDir));

app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

const server = app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Frontend is served from ${publicDir}`);
});

process.on('SIGINT', () => {
    console.log('\nStopping server...');
    server.close(() => {
        console.log('Server stopped.');
        process.exit(0);
    });
});
