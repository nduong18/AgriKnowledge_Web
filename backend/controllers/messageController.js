const db = require('../config/db');

// Get all unique conversations for a user
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find all users who have exchanged messages with this user
        const query = `
            SELECT DISTINCT u.id, u.display_name, u.avatar, u.role,
                   (SELECT COUNT(*) FROM messages m2 WHERE m2.sender_id = u.id AND m2.receiver_id = ? AND m2.is_read = 0) as unread_count
            FROM users u
            JOIN messages m ON (u.id = m.sender_id OR u.id = m.receiver_id)
            WHERE (m.sender_id = ? OR m.receiver_id = ?) AND u.id != ?
        `;
        
        const [conversations] = await db.query(query, [userId, userId, userId, userId]);
        
        res.json(conversations);
    } catch(err) {
        console.error('Lỗi lấy danh sách đối thoại:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Get messages between current user and partner
exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const partnerId = req.params.partnerId;

        const query = `
            SELECT m.*, s.display_name as sender_name, s.avatar as sender_avatar
            FROM messages m
            JOIN users s ON m.sender_id = s.id
            WHERE (m.sender_id = ? AND m.receiver_id = ?) 
               OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        `;
        
        const [messages] = await db.query(query, [userId, partnerId, partnerId, userId]);
        
        // Mark as read (optional simplified logic)
        await db.query('UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ?', [userId, partnerId]);

        res.json(messages);
    } catch(err) {
        console.error('Lỗi lấy tin nhắn:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ error: 'Thiếu người nhận hoặc nội dung.' });
        }

        const query = `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`;
        await db.query(query, [senderId, receiverId, content]);

        res.status(201).json({ message: 'Đã gửi tin nhắn' });
    } catch(err) {
        console.error('Lỗi gửi tin nhắn:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Get global unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const [result] = await db.query('SELECT COUNT(*) as unread_count FROM messages WHERE receiver_id = ? AND is_read = 0', [userId]);
        res.json({ unread_count: result[0].unread_count });
    } catch(err) {
        console.error('Lỗi đếm số tin nhắn chưa đọc:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};
