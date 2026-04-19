const db = require('../config/db');

exports.getPosts = async (req, res) => {
    try {
        const { type, category, location } = req.query;
        let query = `
            SELECT m.*, u.display_name, u.avatar, u.role 
            FROM marketplace_posts m 
            JOIN users u ON m.user_id = u.id 
            WHERE 1=1
        `;
        let queryParams = [];

        if (type) {
            query += ' AND m.post_type = ?';
            queryParams.push(type);
        }
        if (category) {
            query += ' AND m.category = ?';
            queryParams.push(category);
        }
        if (location) {
            query += ' AND m.location LIKE ?';
            queryParams.push(`%${location}%`);
        }

        query += ' ORDER BY m.created_at DESC';

        const [posts] = await db.query(query, queryParams);
        res.json(posts);
    } catch (error) {
        console.error('Lỗi lấy danh sách Giao thương:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

exports.createPost = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { product_name, category, quantity, location, description, image_url } = req.body;

        if (!product_name) {
            return res.status(400).json({ error: 'Vui lòng nhập tên nông sản' });
        }

        // Tự động phân loại dựa vào role
        // farmer -> sell (cần bán)
        // merchant -> buy (cần mua)
        let post_type = userRole === 'farmer' ? 'sell' : 'buy';

        const insertQuery = `
            INSERT INTO marketplace_posts 
            (user_id, post_type, product_name, category, quantity, location, description, image_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [userId, post_type, product_name, category || null, quantity || null, location || null, description || null, image_url || null];
        
        await db.query(insertQuery, params);
        res.status(201).json({ message: 'Đăng tin thành công' });
    } catch (error) {
        console.error('Lỗi tạo tin đăng:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.id;
        const { product_name, category, quantity, location, description, image_url } = req.body;

        if (!product_name) {
            return res.status(400).json({ error: 'Vui lòng nhập tên nông sản' });
        }

        // Check ownership
        const [posts] = await db.query('SELECT user_id FROM marketplace_posts WHERE id = ?', [postId]);
        if (posts.length === 0) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
        
        if (req.user.role !== 'admin' && posts[0].user_id !== userId) {
            return res.status(403).json({ error: 'Bạn không có quyền sửa bài viết này' });
        }

        const updateQuery = `
            UPDATE marketplace_posts 
            SET product_name = ?, category = ?, quantity = ?, location = ?, description = ?, image_url = ?
            WHERE id = ?
        `;
        const params = [product_name, category || null, quantity || null, location || null, description || null, image_url || null, postId];
        
        await db.query(updateQuery, params);
        res.json({ message: 'Cập nhật tin thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật tin đăng:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

exports.verifyPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { is_verified } = req.body; // boolean or 1/0
        
        // Cần đảm bảo người gọi là admin (được handle bởi auth middleware)

        await db.query('UPDATE marketplace_posts SET is_verified = ? WHERE id = ?', [is_verified ? 1 : 0, postId]);
        res.json({ message: 'Đã cập nhật trạng thái huy hiệu thành công!' });
    } catch(err) {
        console.error('Lỗi duyệt bài:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        // User có thể xoá bài của họ hoặc Admin xoá
        
        const [posts] = await db.query('SELECT user_id FROM marketplace_posts WHERE id = ?', [postId]);
        if (posts.length === 0) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
        
        if (req.user.role !== 'admin' && posts[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Bạn không có quyền xoá bài viết này' });
        }

        await db.query('DELETE FROM marketplace_posts WHERE id = ?', [postId]);
        res.json({ message: 'Xoá thành công' });
    } catch(err) {
        console.error('Lỗi xoá bài:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};
