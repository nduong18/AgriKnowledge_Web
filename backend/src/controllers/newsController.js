const db = require('../config/db');

// [PUBLIC] Lấy tất cả tin tức đã xuất bản
exports.getAllPublishedNews = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, admin_id, author_name, title, thumbnail_url, LEFT(content, 300) as snippet, is_published, created_at, updated_at FROM news WHERE is_published = 1 ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error('Lỗi lấy danh sách tin tức:', err);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};

// [PUBLIC] Lấy chi tiết 1 bài viết
exports.getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM news WHERE id = ? AND is_published = 1', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
        res.json(rows[0]);
    } catch (err) {
        console.error('Lỗi lấy chi tiết tin tức:', err);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};

// [ADMIN] Lấy tất cả tin tức (bao gồm cả chưa xuất bản)
exports.getAllNewsAdmin = async (req, res) => {
    try {
        const { search } = req.query;
        let sql = 'SELECT id, admin_id, author_name, title, thumbnail_url, is_published, created_at, updated_at FROM news';
        let params = [];

        if (search) {
            sql += ' WHERE title LIKE ? OR author_name LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY created_at DESC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('Lỗi lấy danh sách tin tức (admin):', err);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};

// [ADMIN] Lấy chi tiết 1 bài viết (bao gồm cả chưa xuất bản)
exports.getNewsByIdAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM news WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
        res.json(rows[0]);
    } catch (err) {
        console.error('Lỗi lấy chi tiết tin tức (admin):', err);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};

// [ADMIN] Tạo bài viết mới
exports.createNews = async (req, res) => {
    try {
        const { title, thumbnail_url, content, is_published } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Tiêu đề và nội dung không được bỏ trống' });
        }

        const admin_id = req.user.id;
        const author_name = req.user.display_name || req.user.email || 'Admin';
        const published = is_published !== undefined ? is_published : 1;

        await db.query(
            'INSERT INTO news (admin_id, author_name, title, thumbnail_url, content, is_published) VALUES (?, ?, ?, ?, ?, ?)',
            [admin_id, author_name, title, thumbnail_url || '', content, published]
        );

        res.status(201).json({ message: 'Đăng tải bài viết thành công!' });
    } catch (err) {
        console.error('Lỗi tạo tin tức:', err);
        res.status(500).json({ error: 'Lỗi máy chủ khi tạo bài viết' });
    }
};

// [ADMIN] Cập nhật bài viết
exports.updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, thumbnail_url, content, is_published } = req.body;

        const [existing] = await db.query('SELECT * FROM news WHERE id = ?', [id]);
        if (existing.length === 0) return res.status(404).json({ error: 'Không tìm thấy bài viết' });

        const current = existing[0];
        const updateTitle = title !== undefined ? title : current.title;
        const updateThumb = thumbnail_url !== undefined ? thumbnail_url : current.thumbnail_url;
        const updateContent = content !== undefined ? content : current.content;
        const updatePublished = is_published !== undefined ? is_published : current.is_published;

        await db.query(
            'UPDATE news SET title = ?, thumbnail_url = ?, content = ?, is_published = ? WHERE id = ?',
            [updateTitle, updateThumb, updateContent, updatePublished, id]
        );

        res.json({ message: 'Cập nhật bài viết thành công!' });
    } catch (err) {
        console.error('Lỗi cập nhật tin tức:', err);
        res.status(500).json({ error: 'Lỗi máy chủ khi cập nhật bài viết' });
    }
};

// [ADMIN] Xóa bài viết
exports.deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const [existing] = await db.query('SELECT * FROM news WHERE id = ?', [id]);
        if (existing.length === 0) return res.status(404).json({ error: 'Không tìm thấy bài viết' });

        await db.query('DELETE FROM news WHERE id = ?', [id]);
        res.json({ message: 'Xóa bài viết thành công!' });
    } catch (err) {
        console.error('Lỗi xóa tin tức:', err);
        res.status(500).json({ error: 'Lỗi máy chủ khi xóa bài viết' });
    }
};
