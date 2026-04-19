document.addEventListener('DOMContentLoaded', () => {
    const API_URL_MARKETPLACE = 'http://localhost:3000/api/marketplace';
    const API_URL_MESSAGES = 'http://localhost:3000/api/messages';
    
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Set UI for user
    const nameDisplay = document.getElementById('user-name-display');
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const roleDisplay = document.getElementById('user-role-display');

    if (nameDisplay) nameDisplay.innerText = user.display_name || user.email.split('@')[0];
    if (sidebarAvatar && user.avatar) sidebarAvatar.src = user.avatar;
    if (roleDisplay) {
        if (user.role === 'admin') {
            roleDisplay.innerText = 'Quản trị viên';
            roleDisplay.style.background = 'var(--red-100)';
            roleDisplay.style.color = 'var(--red-700)';
        } else if (user.role === 'merchant') {
            roleDisplay.innerText = 'Thương lái';
            roleDisplay.style.background = 'var(--orange-100)';
            roleDisplay.style.color = 'var(--orange-700)';
        } else {
            roleDisplay.innerText = 'Nông dân';
        }
    }

    // Modal elements
    const postModal = document.getElementById('postModal');
    const chatModal = document.getElementById('chatModal');
    const inboxModal = document.getElementById('inboxModal');
    const btnPostAd = document.getElementById('btn-post-ad');
    const btnInbox = document.getElementById('btn-inbox');
    if (user.role !== 'admin') {
        btnPostAd.style.display = 'inline-block';
        if (user.role === 'merchant') {
            document.getElementById('post-modal-title').innerText = 'Đăng tin Cần mua';
            document.getElementById('post-ad-text').innerText = 'Đăng tin Mua';
        } else {
            document.getElementById('post-modal-title').innerText = 'Đăng tin Cần bán';
            document.getElementById('post-ad-text').innerText = 'Đăng tin Bán';
        }
    }

    // Modals open/close
    btnPostAd.addEventListener('click', () => {
        postModal.classList.add('show');
    });

    btnInbox.addEventListener('click', () => {
        inboxModal.classList.add('show');
        loadInboxConversations();
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('show');
        });
    });

    document.querySelectorAll('.close-chat-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            chatModal.classList.remove('show');
        });
    });

    document.querySelectorAll('.close-inbox-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            inboxModal.classList.remove('show');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });

    // Image Upload to Base64 logic
    const imageInput = document.getElementById('post-image-file');
    const imagePreview = document.getElementById('image-preview');
    const imageUrlInput = document.getElementById('post-image-url');

    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64String = event.target.result;
                imageUrlInput.value = base64String;
                imagePreview.innerHTML = `<img src="${base64String}" style="width: 100%; height: auto; display: block;">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Filters logic
    const fetchPosts = async () => {
        try {
            const type = document.getElementById('filter-type').value;
            const category = document.getElementById('filter-category').value;
            const location = document.getElementById('filter-location').value;
            
            let query = new URLSearchParams();
            if (type) query.append('type', type);
            if (category) query.append('category', category);
            if (location) query.append('location', location);

            const res = await fetch(`${API_URL_MARKETPLACE}?${query.toString()}`);
            const posts = await res.json();
            renderFeed(posts);
        } catch (error) {
            console.error('Lỗi tải bảng tin:', error);
        }
    };

    document.getElementById('filter-type').addEventListener('change', fetchPosts);
    document.getElementById('filter-category').addEventListener('change', fetchPosts);
    document.getElementById('filter-location').addEventListener('input', debounce(fetchPosts, 500));

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function renderFeed(posts) {
        const container = document.getElementById('marketplace-feed');
        container.innerHTML = '';
        if (posts.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 40px;">Không có tin đăng nào phù hợp.</div>';
            return;
        }

        posts.forEach(post => {
            const isBuy = post.post_type === 'buy';
            const defaultImg = isBuy ? 'https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=500&q=60' : 'https://images.unsplash.com/photo-1592982537447-6f2c6a0c5c1b?auto=format&fit=crop&w=500&q=60';
            const imgUrl = post.image_url || defaultImg;
            
            let verifiedHtml = '';
            if (post.is_verified) {
                verifiedHtml = `<div class="mc-verified"><i class="fa-solid fa-check-circle"></i> Hàng từ vườn</div>`;
            }

            const card = document.createElement('div');
            card.className = 'market-card';
            card.innerHTML = `
                <img src="${imgUrl}" class="mc-img" alt="${post.product_name}">
                <div class="mc-body">
                    <div>
                        <span class="${isBuy ? 'mc-tag-buy' : 'mc-tag-sell'}">${isBuy ? 'Cần mua' : 'Cần bán'}</span>
                    </div>
                    <div class="mc-title">${post.product_name}</div>
                    <div class="mc-info"><i class="fa-solid fa-layer-group"></i> Loại: ${post.category || 'Khác'}</div>
                    <div class="mc-info"><i class="fa-solid fa-weight-scale"></i> SL: ${post.quantity || 'Thỏa thuận'}</div>
                    <div class="mc-info"><i class="fa-solid fa-location-dot"></i> Nơi ở: ${post.location || 'Không rõ'}</div>
                    ${verifiedHtml}
                    <div style="margin-top: 10px; font-size: 0.9rem; color: #475569; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${post.description || ''}
                    </div>
                    <div class="mc-footer">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <img src="${post.avatar || 'https://via.placeholder.com/40'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                            <span style="font-size: 0.9rem; font-weight: 500;">${post.display_name}</span>
                        </div>
                        ${String(post.user_id) !== String(user.id) ? `<button class="btn btn-sm btn-outline-emerald btn-chat" data-id="${post.user_id}" data-name="${post.display_name}">Nhắn tin</button>` : `<span style="font-size: 0.8rem; color: var(--emerald-600); font-weight: 500;"><i class="fa-solid fa-user-tag"></i> Tin của bạn</span>`}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Add event listener for chat buttons
        document.querySelectorAll('.btn-chat').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const partnerId = e.currentTarget.getAttribute('data-id');
                const partnerName = e.currentTarget.getAttribute('data-name');
                if (partnerId == user.id) {
                    alert('Bạn không thể tự nhắn tin cho mình.');
                    return;
                }
                openChat(partnerId, partnerName);
            });
        });
    }

    // Submit post
    document.getElementById('post-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const product_name = document.getElementById('post-name').value;
        const category = document.getElementById('post-category').value;
        const quantity = document.getElementById('post-quantity').value;
        const location = document.getElementById('post-location').value;
        const description = document.getElementById('post-desc').value;
        const image_url = document.getElementById('post-image-url').value;

        const submitBtn = document.getElementById('submit-post-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang đăng...';

        try {
            const res = await fetch(API_URL_MARKETPLACE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ product_name, category, quantity, location, description, image_url })
            });

            if (res.ok) {
                alert('Đăng tin thành công!');
                document.getElementById('postModal').classList.remove('show');
                document.getElementById('post-form').reset();
                imagePreview.innerHTML = '';
                imageUrlInput.value = '';
                fetchPosts();
            } else {
                const data = await res.json();
                alert(data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            alert('Lỗi kết nối máy chủ');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Đăng tin';
        }
    });

    // Chat Logic
    async function openChat(partnerId, partnerName) {
        document.getElementById('active-chat-partner-id').value = partnerId;
        document.getElementById('chat-partner-name').innerText = partnerName;
        document.getElementById('chat-messages').innerHTML = '<div style="text-align: center; color: #94a3b8;"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải tin nhắn...</div>';
        
        chatModal.classList.add('show');
        loadMessages(partnerId);
    }

    async function loadMessages(partnerId) {
        try {
            const res = await fetch(`${API_URL_MESSAGES}/${partnerId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const msgs = await res.json();
            const container = document.getElementById('chat-messages');
            container.innerHTML = '';
            
            // Cập nhật lại số dư tin nhắn chưa đọc
            updateUnreadCount();

            if (msgs.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: #94a3b8; margin-top: auto; margin-bottom: auto;">Chưa có tin nhắn nào. Gửi tin nhắn đầu tiên!</div>';
                return;
            }

            msgs.forEach(msg => {
                const isSelf = msg.sender_id === user.id;
                const div = document.createElement('div');
                div.className = `chat-bubble ${isSelf ? 'chat-self' : 'chat-other'}`;
                div.innerHTML = `
                    <div style="font-size: 0.95rem;">${msg.content}</div>
                    <div style="font-size: 0.7rem; text-align: right; opacity: 0.8; margin-top: 4px;">
                        ${new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                `;
                container.appendChild(div);
            });
            container.scrollTop = container.scrollHeight;
        } catch (err) {
            console.error(err);
        }
    }

    document.getElementById('send-chat-btn').addEventListener('click', sendChatMessage);
    document.getElementById('chat-input-text').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendChatMessage();
    });

    async function sendChatMessage() {
        const input = document.getElementById('chat-input-text');
        const content = input.value.trim();
        const receiverId = document.getElementById('active-chat-partner-id').value;

        if (!content || !receiverId) return;

        input.value = '';
        input.disabled = true;

        try {
            const res = await fetch(API_URL_MESSAGES, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ receiverId, content })
            });

            if (res.ok) {
                loadMessages(receiverId);
            }
        } catch(err) {
            console.error('Lỗi gửi tin:', err);
        } finally {
            input.disabled = false;
            input.focus();
        }
    }

    // Inbox Logic
    async function loadInboxConversations() {
        const container = document.getElementById('inbox-list');
        container.innerHTML = '<div style="text-align: center; color: #94a3b8; margin-top: 50px;"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải hộp thư...</div>';
        
        try {
            const res = await fetch(`${API_URL_MESSAGES}/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const convs = await res.json();
            
            container.innerHTML = '';
            
            if (convs.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: #94a3b8; margin-top: 50px;">Bạn chưa có tin nhắn nào. Bấm "Nhắn tin" trên bài đăng để bắt đầu!</div>';
                return;
            }
            
            convs.forEach(c => {
                const div = document.createElement('div');
                div.className = 'inbox-item';
                
                let badgeHtml = '';
                if (c.unread_count > 0) {
                    badgeHtml = `<span style="background: var(--red-500); color: white; border-radius: 12px; padding: 2px 8px; font-size: 0.75rem; font-weight: bold; margin-right: 10px;">${c.unread_count}</span>`;
                }

                div.innerHTML = `
                    <img src="${c.avatar || 'https://via.placeholder.com/45'}" alt="Avatar">
                    <div class="inbox-item-info">
                        <div class="inbox-item-name">${c.display_name}</div>
                        <div class="inbox-item-role">${c.role === 'farmer' ? 'Nông dân' : c.role === 'merchant' ? 'Thương lái' : 'Admin'}</div>
                    </div>
                    ${badgeHtml}
                    <i class="fa-solid fa-chevron-right" style="color: #cbd5e1;"></i>
                `;
                div.addEventListener('click', () => {
                    inboxModal.classList.remove('show');
                    openChat(c.id, c.display_name);
                });
                container.appendChild(div);
            });
            
        } catch (error) {
            console.error('Lỗi tải hộp thư:', error);
            container.innerHTML = '<div style="text-align: center; color: var(--red-500); margin-top: 50px;">Không thể tải dữ liệu hộp thư.</div>';
        }
    }

    async function updateUnreadCount() {
        try {
            const res = await fetch(`${API_URL_MESSAGES}/unread-count`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            const badge = document.getElementById('inbox-badge');
            if (badge) {
                if (data.unread_count > 0) {
                    badge.innerText = data.unread_count > 99 ? '99+' : data.unread_count;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }
        } catch (err) {
            console.error('Lỗi lấy số lượng tin nhắn mới', err);
        }
    }

    // Init
    fetchPosts();
    updateUnreadCount();
    // Auto refresh badge every 15s to simulate realtime notifications
    setInterval(updateUnreadCount, 15000);
});
